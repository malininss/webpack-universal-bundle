const path = require('path'); // Встроенные в node.js модуль для работы с пути
const HTMLWebpackPlugin = require('html-webpack-plugin'); // Плагин для работы с HTML
const {CleanWebpackPlugin} = require('clean-webpack-plugin'); // Плагин для отчистки рабочей папки

module.exports = {
  context: path.resolve(__dirname, 'src') , // Указываем, от какой папки указны пути ниже. То есть не ./src/index.js, а  ./index.js
  mode: 'development',
  entry: {
    main: './index.js',
    analytics: './analytics.js'
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html'
    }),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/, // как только вебпак встречает в импортах css, загружаем модуль ниже
        use: ['style-loader', 'css-loader'] // webpack идёт справа налево. Сначала css-loader, затем style-loader. Лоадеры нужно предварительно установить. В данном случае стили подключается непосредственно в html тег style, а не ссылкой
      },
      {
        test: /\.(png|jpg|svg|gif)/,
        use: ['file-loader'] // лоадер для загрузки изображений
      },
      {
        test: /\.(ttf|woff}woff2|eot)$/,
        use: ['file-loader'] // Обрабатываем шрифты
      },
      {
        test: /\.xml$/,
        use: ['xml-loader'] // планиг для чтения xml-файлов
      },
      {
        test: /\.csv$/,
        use: ['csv-loader'] // планиг для чтения csv-файлов
      }
    ]
  }
}