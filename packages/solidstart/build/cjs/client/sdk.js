Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const solid = require('@sentry/solid');

// Treeshakable guard to remove all code related to tracing

/**
 * Initializes the client side of the Solid Start SDK.
 */
function init(options) {
  const opts = {
    defaultIntegrations: getDefaultIntegrations(options),
    ...options,
  };

  core.applySdkMetadata(opts, 'solidstart', ['solidstart', 'solid']);

  return solid.init(opts);
}

function getDefaultIntegrations(options) {
  const integrations = solid.getDefaultIntegrations(options);

  // This evaluates to true unless __SENTRY_TRACING__ is text-replaced with "false",
  // in which case everything inside will get tree-shaken away
  if (typeof __SENTRY_TRACING__ === 'undefined' || __SENTRY_TRACING__) {
    // We add the default BrowserTracingIntegration here always.
    // We can do this, even if `solidRouterBrowserTracingIntegration` is
    // supplied as integration in `init` by users because it will win
    // over the default integration by virtue of having the same
    // `BrowserTracing` integration name and being added later.
    integrations.push(solid.browserTracingIntegration());
  }

  return integrations;
}

exports.init = init;
//# sourceMappingURL=sdk.js.map
