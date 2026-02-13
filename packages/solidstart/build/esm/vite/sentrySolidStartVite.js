import { makeBuildInstrumentationFilePlugin } from './buildInstrumentationFile.js';
import { makeAddSentryVitePlugin, makeEnableSourceMapsVitePlugin } from './sourceMaps.js';

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
    sentryPlugins.push(makeBuildInstrumentationFilePlugin(options));
  }

  if (process.env.NODE_ENV !== 'development') {
    if (options.sourceMapsUploadOptions?.enabled ?? true) {
      const sourceMapsPlugin = makeAddSentryVitePlugin(options);
      const enableSourceMapsPlugin = makeEnableSourceMapsVitePlugin(options);

      sentryPlugins.push(...sourceMapsPlugin, ...enableSourceMapsPlugin);
    }
  }

  return sentryPlugins;
}

export { sentrySolidStartVite };
//# sourceMappingURL=sentrySolidStartVite.js.map
