import { sentryVitePlugin } from '@sentry/vite-plugin';

/**
 * A Sentry plugin for adding the @sentry/vite-plugin to automatically upload source maps to Sentry.
 *
 * Since the vite config is no longer passed in directly (SolidStart 2.0 uses standalone Vite plugins),
 * this plugin uses a `config()` hook to read the resolved vite config and determine `filesToDeleteAfterUpload`.
 */
function makeAddSentryVitePlugin(options) {
  const { authToken, debug, org, project, sourceMapsUploadOptions } = options;

  // Default to deleting source maps after upload when the user hasn't configured sourcemaps themselves.
  // This will be overridden if the user has explicitly set `build.sourcemap` in their vite config.
  // Since `makeEnableSourceMapsVitePlugin` sets sourcemap to 'hidden' when unset, we default to deleting.
  let updatedFilesToDeleteAfterUpload =
    typeof sourceMapsUploadOptions?.filesToDeleteAfterUpload === 'undefined' &&
    typeof sourceMapsUploadOptions?.unstable_sentryVitePluginOptions?.sourcemaps?.filesToDeleteAfterUpload ===
      'undefined'
      ? ['.*/**/*.map']
      : undefined;

  return [
    {
      name: 'sentry-solidstart-sourcemap-config-reader',
      apply: 'build',
      enforce: 'pre',
      config(viteConfig) {
        // If user explicitly set sourcemap (true, false, 'hidden', 'inline'), don't auto-delete
        if (typeof viteConfig.build?.sourcemap !== 'undefined') {
          updatedFilesToDeleteAfterUpload = undefined;
        }

        if (updatedFilesToDeleteAfterUpload) {
          debug &&
            // eslint-disable-next-line no-console
            console.log(
              `[Sentry] Automatically setting \`sourceMapsUploadOptions.filesToDeleteAfterUpload: ${JSON.stringify(
                updatedFilesToDeleteAfterUpload,
              )}\` to delete generated source maps after they were uploaded to Sentry.`,
            );
        }
      },
    },
    // Cast needed because @sentry/vite-plugin may resolve a different vite version than the one used locally
    ...(sentryVitePlugin({
      authToken: authToken ?? process.env.SENTRY_AUTH_TOKEN,
      bundleSizeOptimizations: options.bundleSizeOptimizations,
      debug: debug ?? false,
      org: org ?? process.env.SENTRY_ORG,
      project: project ?? process.env.SENTRY_PROJECT,
      sourcemaps: {
        filesToDeleteAfterUpload:
          (sourceMapsUploadOptions?.filesToDeleteAfterUpload ||
            sourceMapsUploadOptions?.unstable_sentryVitePluginOptions?.sourcemaps?.filesToDeleteAfterUpload) ??
          updatedFilesToDeleteAfterUpload,
        ...sourceMapsUploadOptions?.unstable_sentryVitePluginOptions?.sourcemaps,
      },
      telemetry: sourceMapsUploadOptions?.telemetry ?? true,
      _metaOptions: {
        telemetry: {
          metaFramework: 'solidstart',
        },
      },
      ...sourceMapsUploadOptions?.unstable_sentryVitePluginOptions,
    }) ),
  ];
}

/**
 * A Sentry plugin for SolidStart to enable "hidden" source maps if they are unset.
 */
function makeEnableSourceMapsVitePlugin(options) {
  return [
    {
      name: 'sentry-solidstart-update-source-map-setting',
      apply: 'build',
      enforce: 'post',
      config(viteConfig) {
        return {
          ...viteConfig,
          build: {
            ...viteConfig.build,
            sourcemap: getUpdatedSourceMapSettings(viteConfig, options),
          },
        };
      },
    },
  ];
}

/** There are 3 ways to set up source map generation (https://github.com/getsentry/sentry-javascript/issues/13993)
 *
 *     1. User explicitly disabled source maps
 *       - keep this setting (emit a warning that errors won't be unminified in Sentry)
 *       - We won't upload anything
 *
 *     2. Users enabled source map generation (true, 'hidden', 'inline').
 *       - keep this setting (don't do anything - like deletion - besides uploading)
 *
 *     3. Users didn't set source maps generation
 *       - we enable 'hidden' source maps generation
 *       - configure `filesToDeleteAfterUpload` to delete all .map files (we emit a log about this)
 *
 * --> only exported for testing
 */
function getUpdatedSourceMapSettings(
  viteConfig,
  sentryPluginOptions,
) {
  viteConfig.build = viteConfig.build || {};

  const viteSourceMap = viteConfig?.build?.sourcemap;
  let updatedSourceMapSetting = viteSourceMap;

  const settingKey = 'vite.build.sourcemap';
  const debug = sentryPluginOptions?.debug;

  if (viteSourceMap === false) {
    updatedSourceMapSetting = viteSourceMap;

    if (debug) {
      // Longer debug message with more details
      // eslint-disable-next-line no-console
      console.warn(
        `[Sentry] Source map generation is currently disabled in your SolidStart configuration (\`${settingKey}: false \`). This setting is either a default setting or was explicitly set in your configuration. Sentry won't override this setting. Without source maps, code snippets on the Sentry Issues page will remain minified. To show unminified code, enable source maps in \`${settingKey}\` (e.g. by setting them to \`hidden\`).`,
      );
    } else {
      // eslint-disable-next-line no-console
      console.warn('[Sentry] Source map generation is disabled in your SolidStart configuration.');
    }
  } else if (viteSourceMap && ['hidden', 'inline', true].includes(viteSourceMap)) {
    updatedSourceMapSetting = viteSourceMap;

    debug &&
      // eslint-disable-next-line no-console
      console.log(
        `[Sentry] We discovered \`${settingKey}\` is set to \`${viteSourceMap.toString()}\`. Sentry will keep this source map setting. This will un-minify the code snippet on the Sentry Issue page.`,
      );
  } else {
    updatedSourceMapSetting = 'hidden';

    debug &&
      //  eslint-disable-next-line no-console
      console.log(
        `[Sentry] Enabled source map generation in the build options with \`${settingKey}: 'hidden'\`. The source maps  will be deleted after they were uploaded to Sentry.`,
      );
  }

  return updatedSourceMapSetting;
}

export { getUpdatedSourceMapSettings, makeAddSentryVitePlugin, makeEnableSourceMapsVitePlugin };
//# sourceMappingURL=sourceMaps.js.map
