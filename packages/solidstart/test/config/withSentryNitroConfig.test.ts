import type { Nitro } from 'nitropack';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withSentryNitroConfig } from '../../src/config/withSentryNitroConfig';

const addInstrumentationFileToBuildMock = vi.fn();
const addSentryTopImportMock = vi.fn();
const addDynamicImportEntryFileWrapperMock = vi.fn();

vi.mock('../../src/config/addInstrumentation', () => ({
  addInstrumentationFileToBuild: (...args: unknown[]) => addInstrumentationFileToBuildMock(...args),
  addSentryTopImport: (...args: unknown[]) => addSentryTopImportMock(...args),
  addDynamicImportEntryFileWrapper: (...args: unknown[]) => addDynamicImportEntryFileWrapperMock(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('withSentryNitroConfig()', () => {
  const nitroOptions = {
    options: {
      buildDir: '/path/to/buildDir',
      output: {
        serverDir: '/path/to/serverDir',
      },
      preset: 'vercel',
    },
  } as unknown as Nitro;

  const rollupConfig = { plugins: [] };

  it('returns a nitro config with rollup hooks', () => {
    const config = withSentryNitroConfig();
    expect(config.hooks).toBeDefined();
    expect((config.hooks as any).rollup.before).toEqual(expect.any(Function));
  });

  it('preserves the original nitro config properties', () => {
    const config = withSentryNitroConfig({ preset: 'vercel', minify: true });
    expect(config.preset).toBe('vercel');
    expect(config.minify).toBe(true);
    expect((config.hooks as any).rollup.before).toEqual(expect.any(Function));
  });

  it('adds instrumentation file to build by default (no autoInjectServerSentry)', async () => {
    const config = withSentryNitroConfig({}, {});
    await (config.hooks as any).rollup.before(nitroOptions, rollupConfig);

    expect(addInstrumentationFileToBuildMock).toHaveBeenCalledWith(nitroOptions);
    expect(addSentryTopImportMock).not.toHaveBeenCalled();
    expect(addDynamicImportEntryFileWrapperMock).not.toHaveBeenCalled();
  });

  it('adds instrumentation file and top-level import when autoInjectServerSentry is "top-level-import"', async () => {
    const config = withSentryNitroConfig({}, { autoInjectServerSentry: 'top-level-import' });
    await (config.hooks as any).rollup.before(nitroOptions, rollupConfig);

    expect(addInstrumentationFileToBuildMock).toHaveBeenCalledWith(nitroOptions);
    expect(addSentryTopImportMock).toHaveBeenCalledWith(nitroOptions);
    expect(addDynamicImportEntryFileWrapperMock).not.toHaveBeenCalled();
  });

  it('uses dynamic import wrapper when autoInjectServerSentry is "experimental_dynamic-import"', async () => {
    const config = withSentryNitroConfig({}, { autoInjectServerSentry: 'experimental_dynamic-import' });
    await (config.hooks as any).rollup.before(nitroOptions, rollupConfig);

    expect(addDynamicImportEntryFileWrapperMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nitro: nitroOptions,
        rollupConfig,
        sentryPluginOptions: expect.objectContaining({
          autoInjectServerSentry: 'experimental_dynamic-import',
          experimental_entrypointWrappedFunctions: ['default', 'handler', 'server'],
        }),
      }),
    );
    expect(addInstrumentationFileToBuildMock).not.toHaveBeenCalled();
    expect(addSentryTopImportMock).not.toHaveBeenCalled();
  });

  it('preserves user-defined rollup.before hook', async () => {
    const userHook = vi.fn();
    const config = withSentryNitroConfig(
      { hooks: { rollup: { before: userHook } } },
      { autoInjectServerSentry: 'top-level-import' },
    );
    await (config.hooks as any).rollup.before(nitroOptions, rollupConfig);

    expect(addInstrumentationFileToBuildMock).toHaveBeenCalledWith(nitroOptions);
    expect(addSentryTopImportMock).toHaveBeenCalledWith(nitroOptions);
    expect(userHook).toHaveBeenCalledWith(nitroOptions, rollupConfig);
  });

  it('preserves other user-defined hooks', () => {
    const closeMock = vi.fn();
    const config = withSentryNitroConfig({ hooks: { close: closeMock } }, {});
    expect((config.hooks as any).close).toBe(closeMock);
  });

  it('uses custom experimental_entrypointWrappedFunctions when provided', async () => {
    const config = withSentryNitroConfig(
      {},
      {
        autoInjectServerSentry: 'experimental_dynamic-import',
        experimental_entrypointWrappedFunctions: ['myHandler'],
      },
    );
    await (config.hooks as any).rollup.before(nitroOptions, rollupConfig);

    expect(addDynamicImportEntryFileWrapperMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sentryPluginOptions: expect.objectContaining({
          experimental_entrypointWrappedFunctions: ['myHandler'],
        }),
      }),
    );
  });
});
