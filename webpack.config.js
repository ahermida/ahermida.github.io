const nodeExternals = require('webpack-node-externals');

const client = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ['es2017'],
        },
      }
    ],
  },
  externals: [nodeExternals()],
  stats: {
    warnings: false,
  },
  node: {
    __dirname: false,
  },
  entry: "./game.js",
  output: { path: __dirname, filename: "game.es5.js" },
  target: "web",
};


module.exports = [
  client
];
