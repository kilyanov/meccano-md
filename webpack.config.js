const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    return {
        entry: './src/index.js',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader', 'eslint-loader']
                },
                {
                    test: /\.(css|scss)$/,
                    use: [
                        'css-hot-loader',
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'assets/images/[hash].[ext]'
                        }
                    }, {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                        },
                    }],
                },
                {
                    test: /\.(ttf|eot|woff|woff2)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'assets/fonts/[name].[ext]',
                    },
                }
            ]
        },
        resolve: {
            extensions: ['*', '.js', '.jsx']
        },
        output: {
            path: __dirname + '/web',
            publicPath: '/',
            filename: 'bundle.js'
        },
        plugins: [
            new CleanWebpackPlugin('web', {}),
            new webpack.HotModuleReplacementPlugin(),
            new MiniCssExtractPlugin({filename: 'styles.css'}),
            new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify(argv.mode)}),
            new HtmlWebpackPlugin({
                inject: false,
                hash: true,
                template: './src/index.html',
                filename: 'index.html'
            }),
            new webpack.ProvidePlugin({
                'window._': 'lodash',
                _: 'lodash',
                'window.moment': 'moment',
                moment: 'moment',
                Bem: 'react-bem-helper'
            })
        ],
        devServer: {
            headers: {'Access-Control-Allow-Origin': '*'},
            contentBase: './web',
            hot: true,
            port: 5001,
            historyApiFallback: true
        }
    }
};
