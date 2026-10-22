const { VueLoaderPlugin } = require('vue-loader')
var path = require('path');

module.exports = {
  resolve: { alias: { vue: 'vue/dist/vue.esm.js' } },
  mode: 'production',
  entry: './src/admin-app.js',
  devtool: 'source-map',
  watch: true,
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
         test:/\.(s*)css$/,
         use:['style-loader','css-loader']
     },
     {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'dist/fonts/'
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
      {
        // Only run `.js` files through Babel
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ]
  },
  output: {
    path: path.resolve(__dirname, 'assets/js/apps'),
    filename: 'admin-app.js'
  },
  optimization: {
      minimize: true
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
