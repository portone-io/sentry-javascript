import { splitProps, mergeProps } from 'solid-js';
import { createComponent } from 'solid-js/web';

// We use @sentry/solid/solidrouter on the client.
// On the server, we have to create matching components
// in structure to avoid hydration errors.

/** Pass-through component in case user didn't specify a root **/
function SentryDefaultRoot(props) {
  return props.children;
}

/**
 * On the client, router hooks are used in the router's root render prop.
 * This creates a matching structure that's purely pass-through to avoid hydration errors.
 */
function withSentryRouterRoot(Root) {
  const SentryRouterRoot = (props) => {
    return createComponent(Root, props);
  };

  return SentryRouterRoot;
}

/**
 * On the client, router hooks are used to start navigation spans.
 * This creates a matching structure that's purely pass-through to avoid hydration errors.
 */
function withSentryRouterRouting(Router) {
  const SentryRouter = (props) => {
    const [local, others] = splitProps(props, ['root']);
    // We need to wrap root here in case the user passed in their own root
    const Root = withSentryRouterRoot(local.root ? local.root : SentryDefaultRoot);

    return createComponent(Router, mergeProps({ root: Root }, others));
  };

  return SentryRouter;
}

export { withSentryRouterRouting };
//# sourceMappingURL=solidrouter.js.map
