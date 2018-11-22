var path = require("path");
var webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

var API_HOST = {
  production: JSON.stringify('wss://booterbro.tk'),
  development: JSON.stringify('ws://localhost:8081')
}
var environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  entry: {
    main: "./src/minus8.js"
  },
  output: {
    path: path.resolve(__dirname, "./build/www"),
    // publicPath: "dist/",
    filename: "build.js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Minus8',
    }),
    new webpack.DefinePlugin({
      'API_HOST': API_HOST[environment]
    })
  ],
  module: {
    rules: [{
        test: /\.scss$/,
        use: ["vue-style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          loaders: {}
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|txt)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]"
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js"
    },
    extensions: ["*", ".js", ".vue", ".json"]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    proxy: {
      "/server": {
        target: "http://localhost:8081"
      },
    }
  },
  performance: {
    hints: false
  },
  devtool: "#eval-source-map"
};

if (process.env.NODE_ENV === "production") {
  module.exports.devtool = "#source-map";
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}
