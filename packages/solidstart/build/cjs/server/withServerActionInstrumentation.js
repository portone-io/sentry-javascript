Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');
const node = require('@sentry/node');
const utils = require('./utils.js');

/**
 * Wraps a server action (functions that use the 'use server' directive)
 * function body with Sentry Error and Performance instrumentation.
 */
async function withServerActionInstrumentation(
  serverActionName,
  callback,
) {
  const activeSpan = node.getActiveSpan();

  if (activeSpan) {
    const spanData = node.spanToJSON(activeSpan).data;

    // In solid start, server function calls are made to `/_server` which doesn't tell us
    // a lot. We rewrite the span's route to be that of the sever action name but only
    // if the target is `/_server`, otherwise we'd overwrite pageloads on routes that use
    // server actions (which are more meaningful, e.g. a request to `GET /users/5` is more
    // meaningful than overwriting it with `GET doSomeFunctionCall`).
    if (spanData && !spanData['http.route'] && spanData['http.target'] === '/_server') {
      activeSpan.setAttribute('http.route', serverActionName);
      activeSpan.setAttribute(node.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'component');
    }
  }

  try {
    return await node.startSpan(
      {
        op: 'function.server_action',
        name: serverActionName,
        attributes: {
          [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.function.solidstart',
          [node.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'component',
        },
      },
      async span => {
        const result = await core.handleCallbackErrors(callback, error => {
          if (!utils.isRedirect(error)) {
            span.setStatus({ code: core.SPAN_STATUS_ERROR, message: 'internal_error' });
            node.captureException(error, {
              mechanism: {
                handled: false,
                type: 'auto.function.solidstart',
              },
            });
          }
        });

        return result;
      },
    );
  } finally {
    await core.flushIfServerless();
  }
}

exports.withServerActionInstrumentation = withServerActionInstrumentation;
//# sourceMappingURL=withServerActionInstrumentation.js.map
