export declare const SENTRY_WRAPPED_ENTRY = "?sentry-query-wrapped-entry";
export declare const SENTRY_WRAPPED_FUNCTIONS = "?sentry-query-wrapped-functions=";
export declare const SENTRY_REEXPORTED_FUNCTIONS = "?sentry-query-reexported-functions=";
export declare const QUERY_END_INDICATOR = "SENTRY-QUERY-END";
/**
 * Strips the Sentry query part from a path.
 * Example: example/path?sentry-query-wrapped-entry?sentry-query-functions-reexport=foo,SENTRY-QUERY-END -> /example/path
 *
 * Only exported for testing.
 */
export declare function removeSentryQueryFromPath(url: string): string;
/**
 * Extracts and sanitizes function re-export and function wrap query parameters from a query string.
 * If it is a default export, it is not considered for re-exporting.
 *
 * Only exported for testing.
 */
export declare function extractFunctionReexportQueryParameters(query: string): {
    wrap: string[];
    reexport: string[];
};
/**
 * Constructs a code snippet with function reexports (can be used in Rollup plugins as a return value for `load()`)
 */
export declare function constructFunctionReExport(pathWithQuery: string, entryId: string): string;
//# sourceMappingURL=utils.d.ts.map