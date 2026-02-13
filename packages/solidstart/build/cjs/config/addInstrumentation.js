Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const fs = require('fs');
const path = require('path');
const wrapServerEntryWithDynamicImport = require('./wrapServerEntryWithDynamicImport.js');

// Nitro presets for hosts that only host static files
const staticHostPresets = ['github_pages'];
// Nitro presets for hosts that use `server.mjs` as opposed to `index.mjs`
const serverFilePresets = ['netlify'];

/**
 * Adds the built `instrument.server.js` file to the output directory.
 *
 * As Sentry also imports the release injection file, this needs to be copied over manually as well.
 * TODO: The mechanism of manually copying those files could maybe be improved
 *
 * This will no-op if no `instrument.server.js` file was found in the
 * build directory.
 */
async function addInstrumentationFileToBuild(nitro) {
  nitro.hooks.hook('close', async () => {
    // Static file hosts have no server component so there's nothing to do
    if (staticHostPresets.includes(nitro.options.preset)) {
      return;
    }

    const buildDir = nitro.options.buildDir;
    const serverDir = nitro.options.output.serverDir;

    try {
      // 1. Create assets directory first (for release-injection-file)
      const assetsServerDir = path.join(serverDir, 'assets');
      if (!fs.existsSync(assetsServerDir)) {
        await fs.promises.mkdir(assetsServerDir, { recursive: true });
        core.consoleSandbox(() => {
          // eslint-disable-next-line no-console
          console.log(`[Sentry SolidStart Plugin] Successfully created directory ${assetsServerDir}.`);
        });
      }

      // 2. Copy release injection file if available
      try {
        const ssrAssetsPath = path.resolve(buildDir, 'build', 'ssr', 'assets');
        const assetsBuildDir = await fs.promises.readdir(ssrAssetsPath);
        const releaseInjectionFile = assetsBuildDir.find(file =>
          /^_sentry-release-injection-file-.*\.(js|mjs)$/.test(file),
        );

        if (releaseInjectionFile) {
          const releaseSource = path.resolve(ssrAssetsPath, releaseInjectionFile);
          const releaseDestination = path.resolve(assetsServerDir, releaseInjectionFile);

          await fs.promises.copyFile(releaseSource, releaseDestination);
          core.consoleSandbox(() => {
            // eslint-disable-next-line no-console
            console.log(`[Sentry SolidStart Plugin] Successfully created ${releaseDestination}.`);
          });
        }
      } catch (err) {
        core.consoleSandbox(() => {
          // eslint-disable-next-line no-console
          console.warn('[Sentry SolidStart Plugin] Failed to copy release injection file.', err);
        });
      }

      // 3. Copy Sentry server instrumentation file
      const instrumentSource = path.resolve(buildDir, 'build', 'ssr', 'instrument.server.js');
      const instrumentDestination = path.resolve(serverDir, 'instrument.server.mjs');

      await fs.promises.copyFile(instrumentSource, instrumentDestination);
      core.consoleSandbox(() => {
        // eslint-disable-next-line no-console
        console.log(`[Sentry SolidStart Plugin] Successfully created ${instrumentDestination}.`);
      });
    } catch (error) {
      core.consoleSandbox(() => {
        // eslint-disable-next-line no-console
        console.warn('[Sentry SolidStart Plugin] Failed to add instrumentation file to build.', error);
      });
    }
  });
}

/**
 * Adds an `instrument.server.mjs` import to the top of the server entry file.
 *
 * This is meant as an escape hatch and should only be used in environments where
 * it's not possible to `--import` the file instead as it comes with a limited
 * tracing experience, only collecting http traces.
 */
async function addSentryTopImport(nitro) {
  nitro.hooks.hook('close', async () => {
    const buildPreset = nitro.options.preset;
    const serverDir = nitro.options.output.serverDir;

    // Static file hosts have no server component so there's nothing to do
    if (staticHostPresets.includes(buildPreset)) {
      return;
    }

    const instrumentationFile = path.resolve(serverDir, 'instrument.server.mjs');
    const serverEntryFileName = serverFilePresets.includes(buildPreset) ? 'server.mjs' : 'index.mjs';
    const serverEntryFile = path.resolve(serverDir, serverEntryFileName);

    try {
      await fs.promises.access(instrumentationFile, fs.constants.F_OK);
    } catch (error) {
      core.consoleSandbox(() => {
        // eslint-disable-next-line no-console
        console.warn(
          `[Sentry SolidStart Plugin] Failed to add \`${instrumentationFile}\` as top level import to \`${serverEntryFile}\`.`,
          error,
        );
      });
      return;
    }

    try {
      const content = await fs.promises.readFile(serverEntryFile, 'utf-8');
      const updatedContent = `import './instrument.server.mjs';\n${content}`;
      await fs.promises.writeFile(serverEntryFile, updatedContent);

      core.consoleSandbox(() => {
        // eslint-disable-next-line no-console
        console.log(
          `[Sentry SolidStart Plugin] Added \`${instrumentationFile}\` as top level import to \`${serverEntryFile}\`.`,
        );
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Sentry SolidStart Plugin] An error occurred when trying to add \`${instrumentationFile}\` as top level import to \`${serverEntryFile}\`.`,
        error,
      );
    }
  });
}

/**
 * This function modifies the Rollup configuration to include a plugin that wraps the entry file with a dynamic import (`import()`)
 * and adds the Sentry server config with the static `import` declaration.
 *
 * With this, the Sentry server config can be loaded before all other modules of the application (which is needed for import-in-the-middle).
 * See: https://nodejs.org/api/module.html#enabling
 */
async function addDynamicImportEntryFileWrapper({
  nitro,
  rollupConfig,
  sentryPluginOptions,
}

) {
  // Static file hosts have no server component so there's nothing to do
  if (staticHostPresets.includes(nitro.options.preset)) {
    return;
  }

  const srcDir = nitro.options.srcDir;
  // todo allow other instrumentation paths
  const serverInstrumentationPath = path.resolve(srcDir, 'src', 'instrument.server.ts');

  const instrumentationFileName = sentryPluginOptions.instrumentation
    ? path.basename(sentryPluginOptions.instrumentation)
    : '';

  rollupConfig.plugins.push(
    wrapServerEntryWithDynamicImport.wrapServerEntryWithDynamicImport({
      serverConfigFileName: sentryPluginOptions.instrumentation
        ? path.join(path.dirname(instrumentationFileName), path.parse(instrumentationFileName).name)
        : 'instrument.server',
      serverEntrypointFileName: sentryPluginOptions.serverEntrypointFileName || nitro.options.preset,
      resolvedServerConfigPath: serverInstrumentationPath,
      entrypointWrappedFunctions: sentryPluginOptions.experimental_entrypointWrappedFunctions,
      additionalImports: ['import-in-the-middle/hook.mjs'],
      debug: sentryPluginOptions.debug,
    }),
  );
}

exports.addDynamicImportEntryFileWrapper = addDynamicImportEntryFileWrapper;
exports.addInstrumentationFileToBuild = addInstrumentationFileToBuild;
exports.addSentryTopImport = addSentryTopImport;
exports.serverFilePresets = serverFilePresets;
exports.staticHostPresets = staticHostPresets;
//# sourceMappingURL=addInstrumentation.js.map
