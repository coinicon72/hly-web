const path = require("path");
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');


const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin")

const WebpackAutoInject = require('webpack-auto-inject-version');

module.exports = {
  devtool: 'source-map',
  // devtool: 'inline-source-map',
  // entry: ["./src/index.js"],
  mode: 'production',

  output: {
    path: path.resolve(__dirname, "dist"),
    // path: path.resolve(__dirname, "public"),
    // publicPath: '/public/'
    publicPath: '/',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: "./public",
    port: 3000,
    historyApiFallback: true,
  },
  plugins: [
    new WebpackAutoInject({
      // components: {
      //   AutoIncreaseVersion: false
      // }
    }),

    // support react env variables
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        // 'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'REACT_APP_SERVER_URL': JSON.stringify('http://175.6.57.235:8081'),
        // 'REACT_APP_SERVER_URL': JSON.stringify('http://localhost:8081'),
      }
    }),
    
    // // new CleanWebpackPlugin(['dist']),
    // // new HtmlWebpackPlugin({
    // //   template: './public/index.html'
    // // }),
    // // new webpack.NamedModulesPlugin(),
    // // new webpack.HotModuleReplacementPlugin(),
    // new ExtractTextPlugin("bundle.css", { allChunks: false }),
    // new webpack.optimize.AggressiveMergingPlugin(),
    // new webpack.optimize.OccurrenceOrderPlugin(),
    // // new webpack.optimize.DedupePlugin(),
    // new CompressionPlugin({
    //   // asset: "[path].gz[query]",
    //   // algorithm: "gzip",
    //   test: /\.js$|\.css$|\.html$/,
    //   threshold: 10240,
    //   // minRatio: 0
    // })
  ],
  optimization: {
    // minimizer: [
    //   new UglifyJsPlugin({
    //     uglifyOptions: {
    //       mangle: {
    //         keep_fnames: true,
    //       },
    //       sourceMap: true,
    //       compress: {
    //         drop_console: true,
    //         conditionals: true,
    //         unused: true,
    //         comparisons: true,
    //         dead_code: true,
    //         if_return: true,
    //         join_vars: true,
    //         warnings: false
    //       },
    //       output: {
    //         comments: false
    //       }
    //     },
    //   }),
    // ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            // import {} from xxx and ['env', { modules: false }] are the keys to support tree shaking
            presets: [['env', { modules: false }], 'react', 'stage-2'],
            // presets: ["es2015", 'react', 'stage-2']
          }
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
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        // loader: 'file?name=public/fonts/[name].[ext]'
        loader: 'file-loader'
      }
    ]
  }
};