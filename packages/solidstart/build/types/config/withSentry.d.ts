import type { SentrySolidStartPluginOptions } from '../vite/types';
import type { SolidStartInlineConfig } from './types';
/**
 * Modifies the passed in Solid Start configuration with build-time enhancements such as
 * building the `instrument.server.ts` file into the appropriate build folder based on
 * build preset.
 *
 * @param solidStartConfig A Solid Start configuration object, as usually passed to `defineConfig` in `app.config.ts|js`
 * @param sentrySolidStartPluginOptions Options to configure the plugin
 * @returns The modified config to be exported and passed back into `defineConfig`
 */
export declare function withSentry(solidStartConfig: SolidStartInlineConfig, sentrySolidStartPluginOptions: SentrySolidStartPluginOptions): SolidStartInlineConfig;
//# sourceMappingURL=withSentry.d.ts.map