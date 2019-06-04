'use strict';
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const config = require('./config');

module.exports = () => ({
  devtool: 'inline-source-map',
  entry: {
    content: './source/content',
    frame: './source/frame',
    iframe: './source/iframe',
    background: './source/background',
    intercept: './source/intercept',
    options: './source/options'
  },
  output: {
    path: path.join(__dirname, 'distribution'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          context: '',
          useRelativePath: true
        }
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true // true outputs JSX tags
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: '*',
        context: 'source',
        ignore: ['*.js', '*.woff', '*.woff2', '*.ttf', '*.eot']
      },
      {
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
      },
      { from: '*', context: 'source/libs/assets/fonts', to: 'fonts' }
    ]),
    new ExtractTextPlugin('vandal.css', {
      allChunks: true
    }),
    new webpack.DefinePlugin({ ...config })
  ],
  optimization: {
    // Without this, function names will be garbled and enableFeature won't work
    concatenateModules: true,

    // Automatically enabled on prod; keeps it somewhat readable for AMO reviewers
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          mangle: false,
          compress: false,
          output: {
            beautify: true,
            indent_level: 2 // eslint-disable-line camelcase
          }
        }
      })
    ]
  }
});
