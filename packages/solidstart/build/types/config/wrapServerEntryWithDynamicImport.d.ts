import type { InputPluginOption } from 'rollup';
/** THIS FILE IS AN UTILITY FOR NITRO-BASED PACKAGES AND SHOULD BE KEPT IN SYNC IN NUXT, SOLIDSTART, ETC. */
export declare const SENTRY_WRAPPED_ENTRY = "?sentry-query-wrapped-entry";
export declare const SENTRY_WRAPPED_FUNCTIONS = "?sentry-query-wrapped-functions=";
export declare const SENTRY_REEXPORTED_FUNCTIONS = "?sentry-query-reexported-functions=";
export declare const QUERY_END_INDICATOR = "SENTRY-QUERY-END";
export type WrapServerEntryPluginOptions = {
    serverEntrypointFileName: string;
    serverConfigFileName: string;
    resolvedServerConfigPath: string;
    entrypointWrappedFunctions: string[];
    additionalImports?: string[];
    debug?: boolean;
};
/**
 * A Rollup plugin which wraps the server entry with a dynamic `import()`. This makes it possible to initialize Sentry first
 * by using a regular `import` and load the server after that.
 * This also works with serverless `handler` functions, as it re-exports the `handler`.
 *
 * @param config Configuration options for the Rollup Plugin
 * @param config.serverConfigFileName Name of the Sentry server config (without file extension). E.g. 'sentry.server.config'
 * @param config.serverEntrypointFileName The server entrypoint (with file extension). Usually, this is defined by the Nitro preset and is something like 'node-server.mjs'
 * @param config.resolvedServerConfigPath Resolved path of the Sentry server config (based on `src` directory)
 * @param config.entryPointWrappedFunctions Exported bindings of the server entry file, which are wrapped as async function. E.g. ['default', 'handler', 'server']
 * @param config.additionalImports Adds additional imports to the entry file. Can be e.g. 'import-in-the-middle/hook.mjs'
 * @param config.debug Whether debug logs are enabled in the build time environment
 */
export declare function wrapServerEntryWithDynamicImport(config: WrapServerEntryPluginOptions): InputPluginOption;
/**
 * Strips the Sentry query part from a path.
 * Example: example/path?sentry-query-wrapped-entry?sentry-query-functions-reexport=foo,SENTRY-QUERY-END -> /example/path
 *
 * **Only exported for testing**
 */
export declare function removeSentryQueryFromPath(url: string): string;
/**
 * Extracts and sanitizes function re-export and function wrap query parameters from a query string.
 * If it is a default export, it is not considered for re-exporting.
 *
 * **Only exported for testing**
 */
export declare function extractFunctionReexportQueryParameters(query: string): {
    wrap: string[];
    reexport: string[];
};
/**
 *  Constructs a comma-separated string with all functions that need to be re-exported later from the server entry.
 *  It uses Rollup's `exportedBindings` to determine the functions to re-export. Functions which should be wrapped
 *  (e.g. serverless handlers) are wrapped by Sentry.
 *
 *  **Only exported for testing**
 */
export declare function constructWrappedFunctionExportQuery(exportedBindings: Record<string, string[]> | null, entrypointWrappedFunctions: string[], debug?: boolean): string;
/**
 * Constructs a code snippet with function reexports (can be used in Rollup plugins as a return value for `load()`)
 *
 * **Only exported for testing**
 */
export declare function constructFunctionReExport(pathWithQuery: string, entryId: string): string;
//# sourceMappingURL=wrapServerEntryWithDynamicImport.d.ts.map