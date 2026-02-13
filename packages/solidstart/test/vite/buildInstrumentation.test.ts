import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeBuildInstrumentationFilePlugin } from '../../src/vite/buildInstrumentationFile';

const fsAccessSyncMock = vi.fn();

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    accessSync: (...args: unknown[]) => fsAccessSyncMock(...args),
  };
});

const consoleWarnSpy = vi.spyOn(console, 'warn');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('makeBuildInstrumentationFilePlugin()', () => {
  it('returns a plugin with correct metadata', () => {
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();

    expect(buildInstrumentationFilePlugin.name).toEqual('sentry-solidstart-build-instrumentation-file');
    expect(buildInstrumentationFilePlugin.apply).toEqual('build');
    expect(buildInstrumentationFilePlugin.enforce).toEqual('post');
    expect(buildInstrumentationFilePlugin.configEnvironment).toEqual(expect.any(Function));
  });

  it('adds the instrumentation file for the ssr environment', () => {
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();
    const config = {
      build: {
        rollupOptions: {
          input: ['/path/to/entry1.js', '/path/to/entry2.js'],
        },
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const result = buildInstrumentationFilePlugin.configEnvironment('ssr', config);
    expect(result?.build?.rollupOptions?.input).toEqual(
      expect.arrayContaining([expect.stringContaining('instrument.server.ts')]),
    );
  });

  it('adds the correct custom instrumentation file', () => {
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin({
      instrumentation: './src/myapp/instrument.server.ts',
    });
    const config = {
      build: {
        rollupOptions: {
          input: ['/path/to/entry1.js'],
        },
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const result = buildInstrumentationFilePlugin.configEnvironment('ssr', config);
    expect(result?.build?.rollupOptions?.input).toEqual(
      expect.arrayContaining([expect.stringContaining('myapp/instrument.server.ts')]),
    );
  });

  it('does not modify config for non-ssr environments', () => {
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();
    const config = {
      build: {
        rollupOptions: {
          input: ['/path/to/entry1.js'],
        },
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const clientResult = buildInstrumentationFilePlugin.configEnvironment('client', config);
    expect(clientResult).toBeUndefined();

    // @ts-expect-error - configEnvironment is always defined
    const serverFnsResult = buildInstrumentationFilePlugin.configEnvironment('server-fns', config);
    expect(serverFnsResult).toBeUndefined();
  });

  it('handles string input by converting to array', () => {
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();
    const config = {
      build: {
        rollupOptions: {
          input: '/path/to/entry.js',
        },
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const result = buildInstrumentationFilePlugin.configEnvironment('ssr', config);
    expect(Array.isArray(result?.build?.rollupOptions?.input)).toBe(true);
    expect(result?.build?.rollupOptions?.input).toHaveLength(2);
    expect(result?.build?.rollupOptions?.input[0]).toBe('/path/to/entry.js');
  });

  it('handles Record input by adding entry', () => {
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();
    const config = {
      build: {
        rollupOptions: {
          input: { main: '/path/to/entry.js' },
        },
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const result = buildInstrumentationFilePlugin.configEnvironment('ssr', config);
    expect(result?.build?.rollupOptions?.input).toHaveProperty('main', '/path/to/entry.js');
    expect(result?.build?.rollupOptions?.input).toHaveProperty('instrument.server');
  });

  it('handles undefined input', () => {
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();
    const config = {
      build: {
        rollupOptions: {},
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const result = buildInstrumentationFilePlugin.configEnvironment('ssr', config);
    expect(Array.isArray(result?.build?.rollupOptions?.input)).toBe(true);
    expect(result?.build?.rollupOptions?.input).toHaveLength(1);
  });

  it("doesn't modify the config if the instrumentation file doesn't exist", () => {
    fsAccessSyncMock.mockImplementationOnce(() => {
      throw new Error("File doesn't exist.");
    });
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();
    const config = {
      build: {
        rollupOptions: {
          input: ['/path/to/entry1.js'],
        },
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const result = buildInstrumentationFilePlugin.configEnvironment('ssr', config);
    expect(result).toBeUndefined();
  });

  it("logs a warning if the instrumentation file doesn't exist", () => {
    const error = new Error("File doesn't exist.");
    fsAccessSyncMock.mockImplementationOnce(() => {
      throw error;
    });
    const buildInstrumentationFilePlugin = makeBuildInstrumentationFilePlugin();
    const config = {
      build: {
        rollupOptions: {
          input: ['/path/to/entry1.js'],
        },
      },
    };

    // @ts-expect-error - configEnvironment is always defined
    const result = buildInstrumentationFilePlugin.configEnvironment('ssr', config);
    expect(result).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Sentry SolidStart Plugin] Could not access `./src/instrument.server.ts`, please make sure it exists.',
      error,
    );
  });
});
