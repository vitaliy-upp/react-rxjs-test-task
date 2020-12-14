const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev
console.log('Dev', isDev)

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all',
		},
	}
	if (isProd) {
		config.minimizer = [new OptimizeCssAssetsPlugin(), new TerserWebpackPlugin()]
		return config
	}
}

const filename = (extension) =>
	isDev ? `[name].${extension}` : `[name].[hash].${extension}`

const cssLoaders = (loader) => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: isDev,
				reloadAll: isProd,
			},
		},
		'css-loader',
	]
	if (loader) loaders.push(loader)
	return loaders
}

const jsLoaders = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: babelOptions(),
		},
	]

	if (isDev) loaders.push('eslint-loader')
	return loaders
}

const babelOptions = (preset) => {
	const options = {
		presets: ['@babel/preset-env'],
		plugins: ['@babel/plugin-proposal-class-properties'],
	}
	if (preset) options.presets.push(preset)
	return options
}

module.exports = {
	mode: 'development',
	entry: ['@babel/polyfill', './src/index.tsx'],
	output: {
		filename: `./static/js/${filename('js')}`,
		path: path.resolve(__dirname, 'build'),
	},
	resolve: {
		extensions: ['.js', '.json', '.png', '.svg', '.xml', '.ts', '.jsx', '.tsx'],
		alias: {
			'@Components': path.resolve(__dirname, './src/Components'),
			'@Interfaces': path.resolve(__dirname, './src/Interfaces'),
			'@': path.resolve(__dirname, './src'),
		},
	},
	optimization: optimization(),
	devServer: {
		port: 4200,
		hot: isDev,
		historyApiFallback: true,
	},
	devtool: isDev ? 'source-map' : '',
	plugins: [
		new HTMLWebpackPlugin({
			template: './public/index.html',
			minify: {
				collapseWhitespace: isProd,
			},
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, './public/favicon.ico'),
					to: path.resolve(__dirname, 'build'),
				},
			],
		}),
		new MiniCssExtractPlugin({
			filename: `static/css/${filename('css')}`,
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/,
				use: cssLoaders(),
			},
			{
				test: /\.sass$/,
				use: cssLoaders('sass-loader'),
			},
			{
				test: /\.less$/,
				use: cssLoaders('less-loader'),
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: `static/image/${filename('[ext]')}`,
						},
					},
				],
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: `static/fonts/${filename('[ext]')}`,
						},
					},
				],
			},
			{
				test: /\.xml$/,
				use: ['xml-loader'],
			},
			{
				test: /\.csv$/,
				use: ['csv-loader'],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: jsLoaders(),
			},
			{
				test: /\.jsx$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: babelOptions('@babel/preset-react'),
				},
			},
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: ['ts-loader'],
			},
		],
	},
}
