import { applySdkMetadata } from '@sentry/core';
import { init as init$1, getDefaultIntegrations as getDefaultIntegrations$1, browserTracingIntegration } from '@sentry/solid';

// Treeshakable guard to remove all code related to tracing

/**
 * Initializes the client side of the Solid Start SDK.
 */
function init(options) {
  const opts = {
    defaultIntegrations: getDefaultIntegrations(options),
    ...options,
  };

  applySdkMetadata(opts, 'solidstart', ['solidstart', 'solid']);

  return init$1(opts);
}

function getDefaultIntegrations(options) {
  const integrations = getDefaultIntegrations$1(options);

  // This evaluates to true unless __SENTRY_TRACING__ is text-replaced with "false",
  // in which case everything inside will get tree-shaken away
  if (typeof __SENTRY_TRACING__ === 'undefined' || __SENTRY_TRACING__) {
    // We add the default BrowserTracingIntegration here always.
    // We can do this, even if `solidRouterBrowserTracingIntegration` is
    // supplied as integration in `init` by users because it will win
    // over the default integration by virtue of having the same
    // `BrowserTracing` integration name and being added later.
    integrations.push(browserTracingIntegration());
  }

  return integrations;
}

export { init };
//# sourceMappingURL=sdk.js.map
