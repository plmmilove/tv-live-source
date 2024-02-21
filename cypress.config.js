const { defineConfig } = require("cypress");
const cyAwaitPreprocessor = require('cypress-await/src/preprocessor')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('file:preprocessor', cyAwaitPreprocessor())
    },
  },

  env: {
    baseUrl: 'http://tonkiang.us',
    excludeChannels:['热门', '单音轨', '画中画'],
  },
});
