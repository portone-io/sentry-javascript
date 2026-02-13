Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const fs = require('fs');
const path = require('path');

/**
 * A Sentry plugin for SolidStart to build the server
 * `instrument.server.ts` file.
 *
 * Uses the Vite 7 Environment API (`configEnvironment`) to only add the
 * instrumentation file to the SSR environment build.
 */
function makeBuildInstrumentationFilePlugin(options = {}) {
  return {
    name: 'sentry-solidstart-build-instrumentation-file',
    apply: 'build',
    enforce: 'post',
    configEnvironment(name, config) {
      if (name !== 'ssr') {
        return;
      }

      const instrumentationFilePath = options.instrumentation || './src/instrument.server.ts';
      const resolvedPath = path.resolve(process.cwd(), instrumentationFilePath);

      try {
        fs.accessSync(resolvedPath, fs.constants.F_OK);
      } catch (error) {
        core.consoleSandbox(() => {
          // eslint-disable-next-line no-console
          console.warn(
            `[Sentry SolidStart Plugin] Could not access \`${instrumentationFilePath}\`, please make sure it exists.`,
            error,
          );
        });
        return;
      }

      const build = config.build || {};
      const rollupOptions = build.rollupOptions || {};
      const existingInput = rollupOptions.input;

      let mergedInput;

      if (typeof existingInput === 'string') {
        mergedInput = [existingInput, resolvedPath];
      } else if (Array.isArray(existingInput)) {
        mergedInput = [...existingInput, resolvedPath];
      } else if (typeof existingInput === 'object' && existingInput !== null) {
        mergedInput = { ...existingInput, 'instrument.server': resolvedPath };
      } else {
        mergedInput = [resolvedPath];
      }

      return {
        build: {
          ...build,
          rollupOptions: {
            ...rollupOptions,
            input: mergedInput,
          },
        },
      };
    },
  };
}

exports.makeBuildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin;
//# sourceMappingURL=buildInstrumentationFile.js.map
