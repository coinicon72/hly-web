const path = require("path");
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  // entry: ["./src/index.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].js"
  },
  devServer: {
    contentBase: "./public",
    port: 3000
  },
  plugins: [
    // new CleanWebpackPlugin(['dist']),
    // new HtmlWebpackPlugin({
    //   title: 'Hot Module Replacement'
    // }),
     new webpack.NamedModulesPlugin(),
     new webpack.HotModuleReplacementPlugin()
  ],
   module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              camelCase: true,
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.html?$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]
  }
};