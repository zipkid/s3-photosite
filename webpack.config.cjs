// Import path for resolving file paths
var path = require("path");
module.exports = {
  // Specify the entry point for our app.
  entry: [path.join(__dirname, "src/index.js")],
  // Specify the output file containing our bundled code.
  output: {
    path: path.resolve('./web'),
    publicPath: './',
    filename: '[name].bundle.js',
    libraryTarget: 'var',
    library: 'EntryPoint'
  },
  // Enable WebPack to use the 'path' package.
  resolve:{
    fallback: { path: require.resolve("path-browserify")}
  },
  mode: 'development'
  // mode: 'production'
};