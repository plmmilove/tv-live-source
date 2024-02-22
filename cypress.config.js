const { defineConfig } = require("cypress");
const cyAwaitPreprocessor = require('cypress-await/src/preprocessor-sync-mode')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('file:preprocessor', cyAwaitPreprocessor())
      config.env = {
        ...process.env,
        ...config.env
      }
      return config
    },
  },

  env: {
    baseUrl: 'http://tonkiang.us',
    excludeChannels:['热门', '单音轨', '画中画'],
  },
});
