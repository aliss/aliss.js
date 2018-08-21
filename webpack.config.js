const path = require('path');

module.exports = {
  mode: "production",
  entry: './src/index.js',
  output: {
    filename: 'aliss.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize: true
  }
};