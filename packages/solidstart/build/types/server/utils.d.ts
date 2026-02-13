import type { EventProcessor, Options } from '@sentry/core';
/**
 * Determines if a thrown "error" is a redirect Response which Solid Start users can throw to redirect to another route.
 * see: https://docs.solidjs.com/solid-router/reference/data-apis/response-helpers#redirect
 * @param error the potential redirect error
 */
export declare function isRedirect(error: unknown): boolean;
/**
 * Filter function for low quality transactions
 *
 * Exported only for tests
 */
export declare function lowQualityTransactionsFilter(options: Options): EventProcessor;
/**
 * Adds an event processor to filter out low quality transactions,
 * e.g. to filter out transactions for build assets
 */
export declare function filterLowQualityTransactions(options: Options): void;
//# sourceMappingURL=utils.d.ts.map