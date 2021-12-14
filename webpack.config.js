const path = require('path');

module.exports = {
  mode: 'production',
  entry: ['./src/js/index.js'],
  output: {
    filename: 'script.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
