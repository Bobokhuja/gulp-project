const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    app: './src/js/index.js',
  },
  output: {
    filename: 'script.js',
  },
}
