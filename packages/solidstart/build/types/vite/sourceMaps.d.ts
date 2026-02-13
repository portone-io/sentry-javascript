import type { Plugin, UserConfig } from 'vite';
import type { SentrySolidStartPluginOptions } from './types';
/**
 * A Sentry plugin for adding the @sentry/vite-plugin to automatically upload source maps to Sentry.
 *
 * Since the vite config is no longer passed in directly (SolidStart 2.0 uses standalone Vite plugins),
 * this plugin uses a `config()` hook to read the resolved vite config and determine `filesToDeleteAfterUpload`.
 */
export declare function makeAddSentryVitePlugin(options: SentrySolidStartPluginOptions): Plugin[];
/**
 * A Sentry plugin for SolidStart to enable "hidden" source maps if they are unset.
 */
export declare function makeEnableSourceMapsVitePlugin(options: SentrySolidStartPluginOptions): Plugin[];
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
export declare function getUpdatedSourceMapSettings(viteConfig: UserConfig, sentryPluginOptions?: SentrySolidStartPluginOptions): boolean | 'inline' | 'hidden';
//# sourceMappingURL=sourceMaps.d.ts.map