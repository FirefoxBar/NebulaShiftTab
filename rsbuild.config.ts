import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import { getDistDir } from './scripts/browser-config/get-path';
import { pluginManifest } from './scripts/rsbuild/manifest.plugin';

const targetBrowser = String(process.env.TARGET_BROWSER) || 'firefox';

const isDev = process.env.NODE_ENV === 'development';

function findRoot(pkg: string) {
  let dir = require.resolve(pkg);
  while (true) {
    const j = path.join(dir, 'package.json');
    if (existsSync(j)) {
      return dir;
    } else {
      dir = path.dirname(dir);
    }
    if (dir === '/') {
      return;
    }
  }
}

function getGlobalVars() {
  const obj = {
    IS_DEV: isDev,
    TARGET_BROWSER: targetBrowser,
    SEMI_ROOT: findRoot('@douyinfe/semi-ui'),
    IS_FIREFOX: targetBrowser === 'firefox',
    IS_CHROME: targetBrowser === 'chrome',
  };
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, JSON.stringify(value)]),
  );
}

export default defineConfig({
  source: {
    define: getGlobalVars(),
  },
  output: {
    manifest: false,
    polyfill: 'off',
    filenameHash: false,
    legalComments: 'inline',
    distPath: {
      root: `./${getDistDir(targetBrowser)}`,
      html: './',
      js: 'assets/js',
      css: 'assets/css',
    },
    externals: [
      ({ request }, callback) => {
        // remove some pkgs from semi
        if (
          !isDev &&
          [
            'lottie-web',
            'prismjs',
            'remark-gfm',
            '@mdx-js/mdx',
            '@douyinfe/semi-json-viewer-core',
          ].includes(request || '')
        ) {
          return callback(undefined, '{}', 'var');
        }
        callback();
      },
    ],
  },
  dev: {
    writeToDisk: true,
    hmr: false,
    liveReload: false,
    lazyCompilation: false,
  },
  performance: {
    // bundleAnalyze: {
    //   analyzerMode: 'static',
    //   openAnalyzer: false,
    // },
  },
  tools: {
    rspack: {
      node: {
        global: false,
      },
    },
  },
  environments: {
    background: {
      source: {
        entry: {
          background: {
            import: './src/background/index.ts',
            html: false,
          },
        },
      },
      output: {
        distPath: {
          js: '.',
        },
        target: 'web',
        copy: [
          {
            from: './public',
            to: '.',
          },
        ],
      },
      performance: {
        chunkSplit: {
          strategy: 'all-in-one',
        },
      },
      tools: {
        rspack: {
          output: {
            asyncChunks: false,
          },
        },
      },
      plugins: [pluginManifest()],
    },
    web: {
      source: {
        entry: {
          'new-tab': './src/new-tab/index.tsx',
        },
      },
      performance: {
        chunkSplit: {
          strategy: 'split-by-experience',
        },
      },
      html: {
        title: 'Nebula Shift Tab',
        tags: [
          {
            tag: 'link',
            attrs: {
              rel: 'icon',
              href: '/icons/logo.png',
            },
            head: true,
          },
        ],
      },
      plugins: [pluginReact(), pluginLess()],
    },
  },
});
