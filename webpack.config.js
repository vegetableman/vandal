const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const DotEnvPlugin = require("dotenv-webpack");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

module.exports = (_env, argv) => ({
  devtool: argv.mode === "development" ? "inline-source-map" : "source-map",
  entry: {
    content: "./source/content",
    frame: "./source/frame",
    iframe: "./source/iframe",
    background: "./source/background",
    intercept: "./source/intercept",
    options: "./source/options"
  },
  output: {
    path: path.join(__dirname, "distribution/build"),
    filename: "[name].js"
  },
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
        test: cssRegex,
        exclude: cssModuleRegex,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: cssModuleRegex,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                camelCase: true,
                getLocalIdent: getCSSModuleLocalIdent
              }
            }
          ]
        })
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          context: "",
          useRelativePath: true
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "*",
        context: "source",
        ignore: ["*.js", "*.woff", "*.woff2", "*.ttf", "*.eot"]
      },
      { from: "*", context: "source/libs/assets/fonts", to: "fonts" },
      { from: "*", context: "source/libs/assets/images", to: "images" },
      {
        from: require.resolve("webextension-polyfill")
      }
    ]),
    new ExtractTextPlugin("vandal.css", {
      allChunks: true
    }),
    new webpack.ProvidePlugin({
      _: "lodash"
    }),
    new DotEnvPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
    })
  ],
  optimization: {
    concatenateModules: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: true,
        terserOptions: {
          mangle: false,
          output: {
            beautify: true,
            indent_level: 4
          }
        }
      })
    ]
  }
});
