import { execSync } from 'node:child_process'
import process from 'node:process'
import babelPlugin from '@rolldown/plugin-babel'
import emotion from '@rolldown/plugin-emotion'
import typedScssModules from '@tsjam/typed-scss-modules'
import react from '@vitejs/plugin-react'
import postcssMediaMinmax from 'postcss-media-minmax'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import Inspect from 'vite-plugin-inspect'
import monkey, { cdn } from 'vite-plugin-monkey'
import z from 'zod'
import { name as packageName, version as packageVersion } from './package.json'

const isDev = process.env.NODE_ENV === 'development'
if (isDev) {
  // only needed in dev mode
  typedScssModules(`${__dirname}/src/**/{*.module.scss,_*.scss}`, {
    watch: true,
  })
}

// version
let scriptVersion = packageVersion
if (process.env.RELEASE) {
  // release Actions
} else {
  // local & nightly Actions
  // use `git describe`
  // https://stackoverflow.com/questions/8595391/how-to-show-git-commit-using-number-of-commits-since-a-tag
  const gitDescribe = process.env.GHD_DESCRIBE || execSync(`git describe`).toString().trim() // e.g v0.19.2-6-g0230769
  scriptVersion = gitDescribe.slice(1) // rm prefix v

  // v0.0.1-:commit_num-:commit_hash 居然比 v0.0.1 小
  // 变成 v0.0.1.:commit_num-:commit_hash
  scriptVersion = scriptVersion.replace(/^(\d+\.\d+\.\d+)-/, (match, p1) => `${p1}.`)
}

// minify
const minify = (() => {
  // via argv
  if (process.argv.includes('--minify')) return true
  if (process.argv.includes('--no-minify')) return false

  // env.MINIFY
  if (process.env.MINIFY) {
    const parsed = z.stringbool().safeParse(process.env.MINIFY)
    if (parsed.success) return parsed.data
  }

  // GreasyFork: default no minify
  if (process.env.RELEASE) return false

  return true
})()

const miniSuffix = minify ? '.mini' : ''
const fileName = `${packageName}${miniSuffix}.user.js`
const metaFileName = `${packageName}${miniSuffix}.meta.js`
const willExternalAntd = false //  !minify

const branchBaseUrl = (branch: string) =>
  `https://raw.githubusercontent.com/magicdawn/Bilibili-Gate/refs/heads/${branch}/`

let downloadURL: string | undefined
let updateURL: string | undefined
if (isDev) {
  // noop
} else if (process.env.RELEASE) {
  const baseUrl = branchBaseUrl('release')
  downloadURL = `${baseUrl}${fileName}`
  updateURL = `${baseUrl}${metaFileName}`
} else {
  const baseUrl = branchBaseUrl('release-nightly')
  downloadURL = `${baseUrl}${fileName}`
  updateURL = `${baseUrl}${metaFileName}`
}

// use @vitejs/plugin-react in build
// for use emotion babel plugin
// https://emotion.sh/docs/babel#features-which-are-enabled-with-the-babel-plugin
const babel = babelPlugin({
  plugins: ['@emotion/babel-plugin'],
})

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  define: {
    __SCRIPT_VERSION__: JSON.stringify(scriptVersion),
  },

  resolve: {
    tsconfigPaths: true,
  },

  css: {
    postcss: {
      plugins: [
        // transform `@media (width >= 1000px)` => `@media (min-width: 1000px)`
        postcssMediaMinmax(),
      ],
    },

    modules: {
      localsConvention: 'camelCaseOnly',
    },

    preprocessorOptions: {
      // `sass-embedded` for vite, `sass` for typed-scss-modules
      // https://sass-lang.com/documentation/breaking-changes/mixed-decls/
      scss: {},
    },
  },

  build: {
    // target: 'es2025',
    emptyOutDir: process.env.CI || process.env.KEEP_DIST ? false : true,
    minify,
    cssMinify: minify,
  },

  // Set this to 0.0.0.0 or true to listen on all addresses, including LAN and public addresses.
  // server: { host: true },
  // preview: { host: true },

  plugins: [
    AutoImport({
      dts: 'src/auto-imports.d.ts',
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      ],
      resolvers: [
        IconsResolver({
          prefix: 'Icon',
          extension: 'jsx',
          alias: {
            // prevent `IconIconPark` double `Icon`
            'park-outline': 'icon-park-outline',
            'park-solid': 'icon-park-solid',
            'park-twotone': 'icon-park-twotone',
          },
        }),
      ],
    }),
    Icons({ compiler: 'jsx', jsx: 'react' }),

    react({ jsxImportSource: '@emotion/react' }),
    emotion(),
    UnoCSS(),

    monkey({
      entry: './src/index.ts',
      userscript: {
        'name': 'Bilibili-Gate',
        'description': 'Bilibili 自定义首页',
        // 'description': 'Add app like recommend part to bilibili homepage',
        'version': scriptVersion,
        'namespace': 'https://magicdawn.fun',
        'icon': 'https://www.bilibili.com/favicon.ico',
        'author': 'magicdawn',
        'supportURL': 'https://github.com/magicdawn/Bilibili-Gate/issues',
        'homepageURL': 'https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate',
        downloadURL,
        updateURL,
        'license': 'MIT',
        'match': [
          'https://www.bilibili.com/',
          'https://www.bilibili.com/?*',
          'https://www.bilibili.com/index.html',
          'https://www.bilibili.com/index.html?*',
          'https://www.bilibili.com/video/*',
          'https://www.bilibili.com/list/watchlater?*',
          'https://www.bilibili.com/bangumi/play/*',
          'https://space.bilibili.com/*',
          'https://search.bilibili.com/*',
        ],
        'connect': ['app.bilibili.com'],
        'grant': [
          'GM.xmlHttpRequest', // axios gm adapter use
        ],
        'run-at': 'document-body', // default: violentmonkey: document-end; tampermonkey: document-idle
        'tag': ['bilibili'],
        ...(command === 'build'
          ? {
              // 'inject-into': 'content', // https://violentmonkey.github.io/api/metadata-block/#inject-into
              // 'sandbox': 'JavaScript', // https://www.tampermonkey.net/documentation.php?locale=en#meta:sandbox
            }
          : undefined),
      },

      server: {
        prefix: false, // 一样的, 避免切换
        open: true,
        mountGmApi: true,
      },

      build: {
        fileName,
        metaFileName: process.env.CI ? metaFileName : undefined,

        // unpkg is not stable
        // https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate/discussions/197900

        externalGlobals: {
          'axios': cdn.npmmirror('axios', 'dist/axios.min.js'),
          'ua-parser-js': cdn.npmmirror('UAParser', 'dist/ua-parser.min.js'),
          'localforage': cdn.npmmirror('localforage', 'dist/localforage.min.js'),
          'pinyin-match': cdn.npmmirror('PinyinMatch', 'dist/main.js'),
          'spark-md5': cdn.npmmirror('SparkMD5', 'spark-md5.min.js'),

          // !TODO when https://github.com/magicdawn/Bilibili-Gate/issues/204 resolved
          // external antd, antd-deps
          ...(willExternalAntd
            ? // + react, react-dom
              {
                // 'react': cdn.npmmirror('React', 'umd/react.production.min.js'),
                // 'react-dom': cdn.npmmirror('ReactDOM', 'umd/react-dom.production.min.js'),
                // 'react': [
                //   'React',
                //   (version, name, _importName = '', resolveName = '') =>
                //     // `https://unpkg.com/react-umd@${version}/dist/react.umd.js`,
                //     `http://localhost:3000/react.umd.js`,
                // ],
                // 'react-dom': [
                //   'ReactDOM',
                //   (version, name, _importName = '', resolveName = '') =>
                //     // `https://unpkg.com/react-umd@${version}/dist/react-dom.umd.js`,
                //     `http://localhost:3000/react-dom.umd.js`,
                // ],
                // 'react-dom/client': [
                //   'ReactDOMClient',
                //   (version, name, _importName = '', resolveName = '') =>
                //     // `https://unpkg.com/react-umd@${version}/dist/react-dom.umd.js`,
                //     `http://localhost:3000/react-dom-client.umd.js`,
                // ],

                // 'framer-motion': cdn.npmmirror('Motion', 'dist/framer-motion.js'),

                // antd deps = [react, react-dom, dayjs]
                'dayjs': cdn.npmmirror('dayjs', 'dayjs.min.js'),
                'dayjs/plugin/duration': cdn.npmmirror('dayjs_plugin_duration', 'plugin/duration.js'),
                // https://github.com/ant-design/ant-design/issues/45262
                '@ant-design/cssinjs': cdn.npmmirror('antdCssinjs', 'dist/umd/cssinjs.min.js'),
                'antd': cdn.npmmirror('antd', 'dist/antd.js'),
              }
            : {}),
        },
      },
    }),

    // visualize
    process.env.NODE_ENV === 'production' &&
      process.argv.includes('--analyze') &&
      analyzer({
        openAnalyzer: true,
        analyzerPort: 'auto',
      }),

    mode === 'development' && Inspect(),
  ].filter(Boolean),
}))
