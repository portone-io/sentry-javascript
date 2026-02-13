import type { NitroConfig } from 'nitropack';
import type { SentrySolidStartPluginOptions } from '../vite/types';
export type SentryNitroOptions = Pick<SentrySolidStartPluginOptions, 'autoInjectServerSentry' | 'experimental_entrypointWrappedFunctions' | 'instrumentation' | 'serverEntrypointFileName' | 'debug'>;
/**
 * Wraps a Nitro config object with Sentry build-time enhancements such as
 * building the `instrument.server.ts` file into the appropriate build folder
 * and optionally auto-injecting the Sentry server configuration.
 *
 * This is meant to be used with `nitroV2Plugin()` from `@solidjs/vite-plugin-nitro-2`:
 *
 * ```typescript
 * import { nitroV2Plugin } from "@solidjs/vite-plugin-nitro-2";
 * import { withSentryNitroConfig } from "@sentry/solidstart/config";
 *
 * nitroV2Plugin(withSentryNitroConfig(
 *   { preset: "vercel" },
 *   { autoInjectServerSentry: 'top-level-import' },
 * ))
 * ```
 */
export declare function withSentryNitroConfig(nitroConfig?: NitroConfig, sentryOptions?: SentryNitroOptions): NitroConfig;
//# sourceMappingURL=withSentryNitroConfig.d.ts.map