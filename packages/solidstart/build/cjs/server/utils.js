Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const node = require('@sentry/node');

/**
 * Determines if a thrown "error" is a redirect Response which Solid Start users can throw to redirect to another route.
 * see: https://docs.solidjs.com/solid-router/reference/data-apis/response-helpers#redirect
 * @param error the potential redirect error
 */
function isRedirect(error) {
  if (error == null || !(error instanceof Response)) {
    return false;
  }

  const hasValidLocation = typeof error.headers.get('location') === 'string';
  const hasValidStatus = error.status >= 300 && error.status <= 308;
  return hasValidLocation && hasValidStatus;
}

/**
 * Filter function for low quality transactions
 *
 * Exported only for tests
 */
function lowQualityTransactionsFilter(options) {
  return Object.assign(
    (event => {
      if (event.type !== 'transaction') {
        return event;
      }
      // Filter out transactions for build assets
      if (event.transaction?.match(/^GET \/_build\//)) {
        options.debug && core.debug.log('SolidStartLowQualityTransactionsFilter filtered transaction', event.transaction);
        return null;
      }
      return event;
    }) ,
    { id: 'SolidStartLowQualityTransactionsFilter' },
  );
}

/**
 * Adds an event processor to filter out low quality transactions,
 * e.g. to filter out transactions for build assets
 */
function filterLowQualityTransactions(options) {
  node.getGlobalScope().addEventProcessor(lowQualityTransactionsFilter(options));
}

exports.filterLowQualityTransactions = filterLowQualityTransactions;
exports.isRedirect = isRedirect;
exports.lowQualityTransactionsFilter = lowQualityTransactionsFilter;
//# sourceMappingURL=utils.js.map
