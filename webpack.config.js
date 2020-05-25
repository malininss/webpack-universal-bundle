const path = require('path'); // Встроенные в node.js модуль для работы с пути
const HTMLWebpackPlugin = require('html-webpack-plugin'); // Плагин для работы с HTML
const {CleanWebpackPlugin} = require('clean-webpack-plugin'); // Плагин для отчистки рабочей папки
const CopyWebpackPlugin = require('copy-webpack-plugin') // Плагин для копирования файлов и папок из src в dist без изменений
const MiniCssExtractPlugin = require('mini-css-extract-plugin')  // Если мы хотим, чтобы css скрипты подключались отедльными файлам, а не в HTML
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // Плагин для оптимизации и минификации CSS
const TerserWebpackPlugin = require('terser-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer'); // Для анализа бандла в прод


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
};

const babelOptions = (preset) => { // Опции для babel ниже
  const opts = {
    presets: [
      '@babel/preset-env', // Нужно установить этот пресет  '@babel/preset-env' и "npm i -D @babel/polyfill"! в packega.json добавить "browserslist": "> 0.25%, not dead"
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties' // Планин для поддержки статических функций в классах
    ]
  };

  if (preset) {
    opts.presets.push(preset);
  }
  
  return opts;

};

// Шаблон filename для формировния js и css файлов. исользуется ниже.
// Если мы в режиме разработкиЮ то хэши не нужны
const filename = extention => isDev ? `[name].${extention}` : `[name].[hash].${extention}`;


// Пишем загрузчик scss, less лоадеров, чтобы не дублировать код
const cssLoaders = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev, //hot module replacement. Означет, что можем менять определенные сущности без перезагрузки страницы. Бывает нужно в режиме разработки. По умолчанию тут всегда true, чтобы использовать только в режиме разработки нужно добавить переменную const isDev = process.env.NODE_ENV === 'development' в начале страницы
        reloadAll: true            },
    },
    'css-loader'
  ]

  if (extra) {
    loaders.push(extra);
  }
  
  return loaders;
}

// Нужно, чтообы использовать eslint для файлов js. Нужно установить библиотеки eslint-loader, babel-eslint, eslint и создать в корне проекта файл .eslintrc
const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: babelOptions()
  }];

  if (isDev) {
    loaders.push('eslint-loader');
  }

  return loaders;
}

const plugins = () => {
 const base = [
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
    filename: filename('css')
  }) // Если мы хотим, чтобы css скрипты подключались отедльными файлам, а не в HTML
]

if (isProd) {
  base.push(new BundleAnalyzerPlugin()); // библиотека, для просмотра статистики, сколько занимает та или иная библиотека
}
return base;

}

module.exports = {
  context: path.resolve(__dirname, 'src') , // Указываем, от какой папки указны пути ниже. То есть не ./src/index.js, а  ./index.js
  mode: 'development',
  entry: {
    main: ['@babel/polyfill','./index.js'], // Если используем babel, то тут массив и '@babel/polyfill'. Если нето, то просто  main: './index.js'
    analytics: './analytics.ts'
  },
  output: {
    filename: filename('js'),
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
  devtool: isDev ? 'source-map' : '', // Если мы в режиме разработки, добавляем карту, если нет, не добавляем
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.css$/, // как только вебпак встречает в импортах css, загружаем модуль ниже
        // use: ['style-loader', 'css-loader'] // webpack идёт справа налево. Сначала css-loader, затем style-loader. Лоадеры нужно предварительно установить. В данном случае стили подключается непосредственно в html тег style, а не ссылкой

        // Если мы хотим, чтобы стили были в отдельном айле, используем MiniCssExtractPlugin, как ниже:
        use: cssLoaders()
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
        use: ['xml-loader'] // плагин для чтения xml-файлов
      },
      {
        test: /\.csv$/,
        use: ['csv-loader'] // плагин для чтения csv-файлов
      },
      {
        test: /\.s[ac]ss$/, // Учимся обрабатывать scss. Можно поменять на лесс
        use: cssLoaders('sass-loader') // Чтобы работало, надо также установить sass-loader sass (npm i -D sass-loader, npm i -D sass);
      },
      {
        test: /\.less$/, // Учимся обрабатывать scss. Можно поменять на лесс
        use: cssLoaders('less-loader')// Чтобы работало, надо также установить sass-loader sass (npm i -D less-loader, npm i -D less);
      },
      {
        test: /\.js$/, // Загружаем бабел. Для этого нужно установить npm install --save-dev babel-loader @babel/core
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.ts$/, // Добавляем поддержку тайп-скрипта 
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: babelOptions('@babel/preset-typescript') // '@babel/preset-typescript' -  Пресет поддержки TS
        }
      }
    ]
  }
}