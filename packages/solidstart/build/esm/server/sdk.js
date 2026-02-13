import { applySdkMetadata } from '@sentry/core';
import { init as init$1 } from '@sentry/node';
import { filterLowQualityTransactions } from './utils.js';

/**
 * Initializes the server side of the Solid Start SDK
 */
function init(options) {
  const opts = {
    ...options,
  };

  applySdkMetadata(opts, 'solidstart', ['solidstart', 'node']);
  filterLowQualityTransactions(opts);

  return init$1(opts);
}

export { init };
//# sourceMappingURL=sdk.js.map
