import type { ResponseMiddleware } from '@solidjs/start/middleware';
import type { FetchEvent } from '@solidjs/start/server';
export type ResponseMiddlewareResponse = Parameters<ResponseMiddleware>[1] & {
    __sentry_wrapped__?: boolean;
};
/**
 * Returns an `onBeforeResponse` solid start middleware handler that adds tracing data as
 * <meta> tags to a page on pageload to enable distributed tracing.
 */
export declare function sentryBeforeResponseMiddleware(): (event: FetchEvent, response: ResponseMiddlewareResponse) => Promise<void>;
//# sourceMappingURL=middleware.d.ts.map