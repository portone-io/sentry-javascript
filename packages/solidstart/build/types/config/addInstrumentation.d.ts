import type { Nitro } from 'nitropack';
import type { SentrySolidStartPluginOptions } from '../vite/types';
import type { RollupConfig } from './types';
export declare const staticHostPresets: string[];
export declare const serverFilePresets: string[];
/**
 * Adds the built `instrument.server.js` file to the output directory.
 *
 * As Sentry also imports the release injection file, this needs to be copied over manually as well.
 * TODO: The mechanism of manually copying those files could maybe be improved
 *
 * This will no-op if no `instrument.server.js` file was found in the
 * build directory.
 */
export declare function addInstrumentationFileToBuild(nitro: Nitro): Promise<void>;
/**
 * Adds an `instrument.server.mjs` import to the top of the server entry file.
 *
 * This is meant as an escape hatch and should only be used in environments where
 * it's not possible to `--import` the file instead as it comes with a limited
 * tracing experience, only collecting http traces.
 */
export declare function addSentryTopImport(nitro: Nitro): Promise<void>;
/**
 * This function modifies the Rollup configuration to include a plugin that wraps the entry file with a dynamic import (`import()`)
 * and adds the Sentry server config with the static `import` declaration.
 *
 * With this, the Sentry server config can be loaded before all other modules of the application (which is needed for import-in-the-middle).
 * See: https://nodejs.org/api/module.html#enabling
 */
export declare function addDynamicImportEntryFileWrapper({ nitro, rollupConfig, sentryPluginOptions, }: {
    nitro: Nitro;
    rollupConfig: RollupConfig;
    sentryPluginOptions: Omit<SentrySolidStartPluginOptions, 'experimental_entrypointWrappedFunctions'> & Required<Pick<SentrySolidStartPluginOptions, 'experimental_entrypointWrappedFunctions'>>;
}): Promise<void>;
//# sourceMappingURL=addInstrumentation.d.ts.map