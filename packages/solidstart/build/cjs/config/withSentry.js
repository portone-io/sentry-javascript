Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const sentrySolidStartVite = require('../vite/sentrySolidStartVite.js');
const addInstrumentation = require('./addInstrumentation.js');

const defaultSentrySolidStartPluginOptions

 = {
  experimental_entrypointWrappedFunctions: ['default', 'handler', 'server'],
};

/**
 * Modifies the passed in Solid Start configuration with build-time enhancements such as
 * building the `instrument.server.ts` file into the appropriate build folder based on
 * build preset.
 *
 * @param solidStartConfig A Solid Start configuration object, as usually passed to `defineConfig` in `app.config.ts|js`
 * @param sentrySolidStartPluginOptions Options to configure the plugin
 * @returns The modified config to be exported and passed back into `defineConfig`
 */
function withSentry(
  solidStartConfig = {},
  sentrySolidStartPluginOptions,
) {
  const sentryPluginOptions = {
    ...sentrySolidStartPluginOptions,
    ...defaultSentrySolidStartPluginOptions,
  };

  const server = (solidStartConfig.server || {}) ;
  const hooks = server.hooks || {};
  const viteConfig = solidStartConfig.vite;
  const vite =
    typeof viteConfig === 'function'
      ? (...args) => sentrySolidStartVite.addSentryPluginToVite(viteConfig(...args), sentryPluginOptions)
      : sentrySolidStartVite.addSentryPluginToVite(viteConfig, sentryPluginOptions);

  return {
    ...solidStartConfig,
    vite,
    server: {
      ...server,
      hooks: {
        ...hooks,
        async 'rollup:before'(nitro, config) {
          if (sentrySolidStartPluginOptions?.autoInjectServerSentry === 'experimental_dynamic-import') {
            await addInstrumentation.addDynamicImportEntryFileWrapper({ nitro, rollupConfig: config, sentryPluginOptions });

            sentrySolidStartPluginOptions.debug &&
              core.debug.log(
                'Wrapping the server entry file with a dynamic `import()`, so Sentry can be preloaded before the server initializes.',
              );
          } else {
            await addInstrumentation.addInstrumentationFileToBuild(nitro);

            if (sentrySolidStartPluginOptions?.autoInjectServerSentry === 'top-level-import') {
              await addInstrumentation.addSentryTopImport(nitro);
            }
          }

          // Run user provided hook
          if (hooks['rollup:before']) {
            hooks['rollup:before'](nitro);
          }
        },
      },
    },
  };
}

exports.withSentry = withSentry;
//# sourceMappingURL=withSentry.js.map
