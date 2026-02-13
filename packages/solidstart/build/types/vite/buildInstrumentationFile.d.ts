import type { Plugin } from 'vite';
import type { SentrySolidStartPluginOptions } from './types';
/**
 * A Sentry plugin for SolidStart to build the server
 * `instrument.server.ts` file.
 *
 * Uses the Vite 7 Environment API (`configEnvironment`) to only add the
 * instrumentation file to the SSR environment build.
 */
export declare function makeBuildInstrumentationFilePlugin(options?: SentrySolidStartPluginOptions): Plugin;
//# sourceMappingURL=buildInstrumentationFile.d.ts.map