const path = require('path');

module.exports = {
  entry: {
    'main': './src/main.ts',
    'UpdateTextNodeWorker': './src/UpdateTextNodeWorker.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    "jquery": "$",
    "babylonjs": "BABYLON"
  }
};