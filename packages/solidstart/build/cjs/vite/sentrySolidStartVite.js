Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const buildInstrumentationFile = require('./buildInstrumentationFile.js');
const sourceMaps = require('./sourceMaps.js');

/**
 * Various Sentry vite plugins to be used for SolidStart.
 *
 * Usage in `vite.config.ts`:
 * ```typescript
 * import { defineConfig } from "vite";
 * import { solidStart } from "@solidjs/start/config";
 * import { sentrySolidStartVite } from "@sentry/solidstart/config";
 *
 * export default defineConfig({
 *   plugins: [
 *     sentrySolidStartVite({ org: '...', project: '...' }),
 *     solidStart({ ... }),
 *   ],
 * });
 * ```
 */
function sentrySolidStartVite(options = {}) {
  const sentryPlugins = [];

  if (options.autoInjectServerSentry !== 'experimental_dynamic-import') {
    sentryPlugins.push(buildInstrumentationFile.makeBuildInstrumentationFilePlugin(options));
  }

  if (process.env.NODE_ENV !== 'development') {
    if (options.sourceMapsUploadOptions?.enabled ?? true) {
      const sourceMapsPlugin = sourceMaps.makeAddSentryVitePlugin(options);
      const enableSourceMapsPlugin = sourceMaps.makeEnableSourceMapsVitePlugin(options);

      sentryPlugins.push(...sourceMapsPlugin, ...enableSourceMapsPlugin);
    }
  }

  return sentryPlugins;
}

exports.sentrySolidStartVite = sentrySolidStartVite;
//# sourceMappingURL=sentrySolidStartVite.js.map
