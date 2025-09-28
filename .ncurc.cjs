const { defineConfig } = require('npm-check-updates')

module.exports = defineConfig({
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
  cooldown: 1, // days
})
