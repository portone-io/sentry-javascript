import type { Plugin } from 'vite';
import type { SentrySolidStartPluginOptions } from './types';
/**
 * Various Sentry vite plugins to be used for SolidStart.
 *
 * Usage in `vite.config.ts`:
 * ```typescript
 * import { defineConfig } from "vite";
 * import { solidStart } from "@solidjs/start/config";
 * import { sentrySolidStartVite } from "@sentry/solidstart/config";
 *
 * export default defineConfig({
 *   plugins: [
 *     sentrySolidStartVite({ org: '...', project: '...' }),
 *     solidStart({ ... }),
 *   ],
 * });
 * ```
 */
export declare function sentrySolidStartVite(options?: SentrySolidStartPluginOptions): Plugin[];
//# sourceMappingURL=sentrySolidStartVite.d.ts.map