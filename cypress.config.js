const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  env: {
    baseUrl: 'http://tonkiang.us',
    excludeChannels:['热门', '单音轨', '画中画'],
  },
});
