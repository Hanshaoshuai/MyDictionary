const webpack = require("webpack");
const path = require('path');
const autoprefixer=require("autoprefixer")
const HtmlWebpackPlugin = require ('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OpenBrowserPlugin = require ('open-browser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const GenerateAssetPlugin = require('generate-asset-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var config = {
	entry:"./entry.js",
	output:{
		path: __dirname + '/dist',
		filename:'js/[name].js'
	},
	devServer: {
		contentBase: './dist',
		host: 'localhost',
		port:9000,
		historyApiFallback: false,
		proxy:{
			'/api1': {
		    	target: 'http://xkgwsj.duapp.com/indexm.php/',
		   		pathRewrite: {'^/api1': ''},
		   		changeOrigin: true
			},
			'/api': {
			    target: 'http://images.sctvgo.com/',
			   	pathRewrite: {'^/api': ''},
			   	changeOrigin: true
			}
		   
		}
		
	},
	module:{
		loaders:[
			{
			  	test: /\.css$/,
			  	exclude: /node_modules/,
				use: ExtractTextPlugin.extract({
				  	fallback: 'style-loader',
				  	use: [
				    	'css-loader',
				    	{
					      	loader: "postcss-loader",
					      	options: {
					        	plugins: [autoprefixer]
					      	}
				    	}
				  	]
				})
			},
			{
			  	test: /\.scss$/,
			  	exclude: /node_modules/,
			 	use: ExtractTextPlugin.extract({
				  	fallback: 'style-loader',
				  	use: [
					    'css-loader','sass-loader',
					    {
					      	loader: "postcss-loader",
					      	options: {
					        	plugins: [autoprefixer]
					      	}
					    }
					]
				})
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				include: path.resolve(__dirname, 'src'),
				exclude: __dirname + '/node_modules/',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
				include: path.resolve(__dirname, 'src'),
			},
			{
				test: /\.(png|jpg|gif|svg)$/i,
				loader: [{
						loader: 'url-loader',
						query: {
							limit: 8192,
							name: 'img/[name].[ext]'
						}
					},
					'image-webpack-loader'
				],
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.json$/,
				loader: [{
					loader: 'json-loader',
					query: {
						name: 'static/[name].json'
					}
				}],
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'fonts/[name]-[hash:7].[ext]'
				},
				include: path.resolve(__dirname, 'src')
			}
		]
	},
	//plugins: {
	//  autoprefixer
	//},
	plugins: [
	    new webpack.BannerPlugin('这个就是我们调用了webpack自带的插件，我们給bundle.js的头部添加了注释信息'),
	    new HtmlWebpackPlugin({
			template: 'index.ejs',
			filename: 'index.html',
			title: 'webpack'
		}),
		new ExtractTextPlugin({
//			filename: './css/[name]-[hash:5].css',
			filename: 'css/main.css',
			allChunks: true,
			ignoreOrder: true
		}),
		new CleanWebpackPlugin(['dist']),
		new OpenBrowserPlugin({
			url: 'http://localhost:9000'
		})
//	    new GenerateAssetPlugin({
//			filename: 'static/test.json', //输出到根目录下的test.json文件
//			template: './src/static/ajax.json',
//			fn: (compilation, cb) => {
//				cb('', createServerConfig(compilation));
//			},UglifyJs
//			extraFiles: []
//		}),
		/*new CopyWebpackPlugin([{
			from: './src/common/js/jquery.js',
			to: './js/jquery.js'
		}].concat(new Mpc().mpcJson)),*/
//		autoprefixer
//		new ImageminPlugin({
//			//			disable: process.env.NODE_ENV !== 'production',
//			pngquant: {
//				quality: '90-100'
//			}
//		}),
//		new webpack.optimize.UglifyJsPlugin(),
//		new UglifyJSPlugin(),
	]
}

module.exports = config;