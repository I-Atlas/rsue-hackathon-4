const config = require('vitest/config');

module.exports = config.defineConfig({
  test: {
    testTimeout: Infinity,
  },
});
