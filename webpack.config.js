const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const assetsPluginInstance = new AssetsPlugin({
    filename: './web/assets.json',
    fullPath: false
});

module.exports = (env, argv) => {
    const productionMode = argv.mode === 'production';

    return {
        entry: './src/index.js',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader' // ['babel-loader', 'eslint-loader']
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
                            bypassOnDebug: true
                        }
                    }]
                },
                {
                    test: /\.(ttf|eot|woff|woff2)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'assets/fonts/[name].[ext]'
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.jsx']
        },
        output: {
            path: path.join(__dirname, 'web'),
            publicPath: '/',
            filename: `bundle${argv.mode === 'production' ? '-[hash]' : ''}.js`
        },
        plugins: [
            new CleanWebpackPlugin('web', {
                exclude: [
                    'index.php',
                    'manifest.json',
                    'OneSignalSDKUpdaterWorker.js',
                    'OneSignalSDKWorker.js'
                ]
            }),
            new webpack.HotModuleReplacementPlugin(),
            new MiniCssExtractPlugin({filename: `styles${productionMode ? '-[hash]' : ''}.css`}),
            new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify(argv.mode)}),
            new HtmlWebpackPlugin({
                inject: false,
                hash: true,
                template: './src/index.html',
                filename: 'index.html'
            }),
            new CopyWebpackPlugin([
                {from: './src/assets/img/favicons/', to: `${__dirname}/web/favicons/`}
            ]),
            new webpack.ProvidePlugin({
                'window._': 'lodash',
                _: 'lodash',
                'window.moment': 'moment',
                moment: 'moment',
                Bem: 'react-bem-helper'
            }),
            assetsPluginInstance
        ],
        devServer: {
            headers: {'Access-Control-Allow-Origin': '*'},
            contentBase: path.join(__dirname, 'web'),
            hot: true,
            port: 5001,
            historyApiFallback: true
        }
    };
};
