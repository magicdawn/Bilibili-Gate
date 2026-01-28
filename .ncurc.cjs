const { defineConfig } = require('npm-check-updates')

module.exports = defineConfig({
  reject: [
    'axios',
    'ua-parser-js', // v1 is enough
  ],
  dep: ['prod', 'dev', 'optional'],
  cooldown: 1, // days
})
