import type { HashRouter, MemoryRouter, Router as BaseRouter, StaticRouter } from '@solidjs/router';
export type RouterType = typeof BaseRouter | typeof HashRouter | typeof MemoryRouter | typeof StaticRouter;
/**
 * On the client, router hooks are used to start navigation spans.
 * This creates a matching structure that's purely pass-through to avoid hydration errors.
 */
export declare function withSentryRouterRouting(Router: RouterType): RouterType;
//# sourceMappingURL=solidrouter.d.ts.map