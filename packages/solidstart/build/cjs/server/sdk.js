Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const node = require('@sentry/node');
const utils = require('./utils.js');

/**
 * Initializes the server side of the Solid Start SDK
 */
function init(options) {
  const opts = {
    ...options,
  };

  core.applySdkMetadata(opts, 'solidstart', ['solidstart', 'node']);
  utils.filterLowQualityTransactions(opts);

  return node.init(opts);
}

exports.init = init;
//# sourceMappingURL=sdk.js.map
