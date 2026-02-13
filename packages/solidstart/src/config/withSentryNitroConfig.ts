import { debug as debugLog } from '@sentry/core';
import type { Nitro, NitroConfig } from 'nitropack';
import type { SentrySolidStartPluginOptions } from '../vite/types';
import {
  addDynamicImportEntryFileWrapper,
  addInstrumentationFileToBuild,
  addSentryTopImport,
} from './addInstrumentation';
import type { RollupConfig } from './types';

export type SentryNitroOptions = Pick<
  SentrySolidStartPluginOptions,
  'autoInjectServerSentry' | 'experimental_entrypointWrappedFunctions' | 'instrumentation' | 'serverEntrypointFileName' | 'debug'
>;

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
export function withSentryNitroConfig(
  nitroConfig: NitroConfig = {},
  sentryOptions: SentryNitroOptions = {},
): NitroConfig {
  const sentryPluginOptions = {
    ...sentryOptions,
    experimental_entrypointWrappedFunctions:
      sentryOptions.experimental_entrypointWrappedFunctions || ['default', 'handler', 'server'],
  };

  const userHooks = nitroConfig.hooks || {};
  const userRollupHooks = typeof userHooks.rollup === 'object' && userHooks.rollup !== null ? userHooks.rollup : {};
  const userRollupBefore = 'before' in userRollupHooks ? userRollupHooks.before : undefined;

  return {
    ...nitroConfig,
    hooks: {
      ...userHooks,
      rollup: {
        ...userRollupHooks,
        async before(nitro: Nitro, config: RollupConfig) {
          if (sentryOptions.autoInjectServerSentry === 'experimental_dynamic-import') {
            await addDynamicImportEntryFileWrapper({ nitro, rollupConfig: config, sentryPluginOptions });

            sentryOptions.debug &&
              debugLog.log(
                'Wrapping the server entry file with a dynamic `import()`, so Sentry can be preloaded before the server initializes.',
              );
          } else {
            await addInstrumentationFileToBuild(nitro);

            if (sentryOptions.autoInjectServerSentry === 'top-level-import') {
              await addSentryTopImport(nitro);
            }
          }

          // Run user provided hook
          if (typeof userRollupBefore === 'function') {
            await userRollupBefore(nitro, config);
          }
        },
      },
    },
  };
}
