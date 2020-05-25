const path = require('path'); // Встроенные в node.js модуль для работы с пути
const HTMLWebpackPlugin = require('html-webpack-plugin'); // Плагин для работы с HTML
const {CleanWebpackPlugin} = require('clean-webpack-plugin'); // Плагин для отчистки рабочей папки
const CopyWebpackPlugin = require('copy-webpack-plugin') // Плагин для копирования файлов и папок из src в dist без изменений
const MiniCssExtractPlugin = require('mini-css-extract-plugin')  // Если мы хотим, чтобы css скрипты подключались отедльными файлам, а не в HTML
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // Плагин для оптимизации и минификации CSS
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development' // Нужен для параметра hmr у MiniCssExtractPlugin, HTMLWebpackPlugin, devServer. Задаём с помощью пакета cross-env в package.json при запуске скриптов
const isProd = !isDev;

console.log('IS dev:', isDev); // Выведется при сборке

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all' // Если в каких-то скриптах подключаются одинаковые библиотеки, они выносятся в vendors и подключаются отдельно
    },
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config;
}

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
  resolve: {
    // Extensons Говорим вебпаку, какие расширения пинимаем по умолчанию при импорте (чтобы можно было не указывать расширения)
    extensions: ['.js', '.json', '.png'],
    // Alias позволяет добавить путь до папки с js-файлами, например, классами.
    // Используется при импорте, например: import from "@models/Post"
    alias: {
      '@models': path.resolve(__dirname, 'src/models'),
      '@': path.resolve(__dirname, 'src')
    } 
  },
  optimization: optimization(),
  // devServer - нужен для автоматической перезагрузки браузера. Для использования нужно установить пакет webpack-dev-server и добавить скрипт в package.json
  devServer: {
    port: 4200,
    hot: isDev // Добавляется если в режиме разработки
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProd // Оптимизируем html, если идём в продакшн
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin( {
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'), // Откуда копируем папку или файл
          to: path.resolve(__dirname, 'dist') // Куда копируем
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }) // Если мы хотим, чтобы css скрипты подключались отедльными файлам, а не в HTML
  ],
  module: {
    rules: [
      {
        test: /\.css$/, // как только вебпак встречает в импортах css, загружаем модуль ниже
        // use: ['style-loader', 'css-loader'] // webpack идёт справа налево. Сначала css-loader, затем style-loader. Лоадеры нужно предварительно установить. В данном случае стили подключается непосредственно в html тег style, а не ссылкой

        // Если мы хотим, чтобы стили были в отдельном айле, используем MiniCssExtractPlugin, как ниже:
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev, //hot module replacement. Означет, что можем менять определенные сущности без перезагрузки страницы. Бывает нужно в режиме разработки. По умолчанию тут всегда true, чтобы использовать только в режиме разработки нужно добавить переменную const isDev = process.env.NODE_ENV === 'development' в начале страницы
              reloadAll: true,
              publicPath: '/public/path/to/',
            },
          },
          'css-loader'
        ] 
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