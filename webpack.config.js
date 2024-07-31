const path = require('path');

module.exports = {
  entry: './core/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'codeAnalysis.js',
    path: path.resolve(__dirname, 'build'),
  },
  target: 'node',
};