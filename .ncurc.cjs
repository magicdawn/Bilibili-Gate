module.exports = {
  reject: [
    'axios',
    // react v19
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
    // v1 is enough
    'ua-parser-js',
  ],
  dep: [
    'prod',
    'dev',
    'optional',
    // 'packageManager'
  ],
}
