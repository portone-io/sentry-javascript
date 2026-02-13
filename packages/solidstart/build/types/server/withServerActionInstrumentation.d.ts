/**
 * Wraps a server action (functions that use the 'use server' directive)
 * function body with Sentry Error and Performance instrumentation.
 */
export declare function withServerActionInstrumentation<A extends (...args: unknown[]) => unknown>(serverActionName: string, callback: A): Promise<ReturnType<A>>;
//# sourceMappingURL=withServerActionInstrumentation.d.ts.map