const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/core/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: /src/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'codeAnalysis.js',
    path: path.resolve(__dirname, 'build')
  },
  target: 'node',
  optimization: {
    usedExports: true,
  },
}
