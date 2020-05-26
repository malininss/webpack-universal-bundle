// Встроенные в node.js модуль для работы с путями
const path = require('path');

 // Плагин для работы с HTML
const HTMLWebpackPlugin = require('html-webpack-plugin');

// Плагин для очистки рабочей папки
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

// Плагин для копирования файлов и папок из src в dist без изменений
const CopyWebpackPlugin = require('copy-webpack-plugin') 

// Плагин для подключения скриптов отдельными файлами, а не в HTML
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// Плагин для оптимизации и минификации CSS
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

// Плагин для минификации JS
const TerserWebpackPlugin = require('terser-webpack-plugin');

// Плагин, для анализа бандла, идущего в продакшн
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer'); 


// Создаём переменную isDev, с помощью которой будем задавать определенные параметры сборки в зависимости сборки (dev)
// Например, нужен для MiniCssExtractPlugin, HTMLWebpackPlugin, devServer. 
// Задаётся с помощью пакета cross-env в package.json при запуске скриптов
const isDev = process.env.NODE_ENV === 'development'
// Аналогичная переменная, только используется для сборки в прод
const isProd = !isDev;


// Отладочное сообщение, выдаётся в консоли при сборке:
console.log('Is dev:', isDev); 


// Функция, для возврата конфига параметров оптимизации. Вызывается ниже
const optimization = () => {
  const config = {
    splitChunks: {
      // Если в каких-то скриптах подключаются одинаковые библиотеки, они выносятся в vendors и подключаются один раз
      chunks: 'all'
    },
  }

  // Если сборка идёт в продакшн, минифицируем CSS и JS
  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config;
}


// Функция, для возврата параметров для babel. Вызывается ниже
const babelOptions = (preset) => { 
  const opts = {
    presets: [
      // Пресет настройки babel.
      // Нужно установить @babel/preset-env и @babel/polyfill с флагом -D и добавить в package.json "browserslist": "> 0.25%, not dead"
      '@babel/preset-env',
    ],
    plugins: [
      // Плагин для поддержки классов
      '@babel/plugin-proposal-class-properties' 
    ]
  };

  // В функцию можно опередать дополнительный пресет, тогда он вернётся в финальном конфиге
  if (preset) {
    opts.presets.push(preset);
  }
  return opts;
};


// Шаблон filename для формировния js и css файлов. исользуется ниже.
// Говорит, что, если мы в режиме разработки, хэши не нужны
const filename = extention => isDev ? `[name].${extention}` : `[name].[hash].${extention}`;


// Загрузчик scss, less лоадеров, чтобы не дублировать код
const cssLoaders = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        // hmr - hot module replacement.
        // Означет, что можем менять определенные сущности без перезагрузки страницы. Бывает нужно в режиме разработки.
        // По умолчанию всегда true, используется только в режиме разработки из-а переменной isDev
        hmr: isDev,
        reloadAll: true            
      },
    },
    'css-loader'
  ]

  if (extra) {
    loaders.push(extra);
  }
  
  return loaders;
}

// Функция для использлования eslint для файлов js.
// Нужно установить библиотеки: eslint-loader, babel-eslint, eslint и создать в корне проекта файл .eslintrc
const jsLoaders = () => {

  // Стандартные значения
  const loaders = [{
    loader: 'babel-loader',
    options: babelOptions()
  }];

  // Если в режиме разработки, то добавляем eslint
  if (isDev) {
    loaders.push('eslint-loader');
  }

  return loaders;
}


// Функция для возврата массива плагинов. Вынесена отдельно для удобства
const plugins = () => {
  // Базовые настройки
  const base = [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        // Если сборка в продакшн, оптимизируем и минифицируем html
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin( {
      patterns: [
        {
          // Задаём параерты, какие файлы и папки копировать и куда
          from: path.resolve(__dirname, 'src/favicon.ico'), // Откуда копируем
          to: path.resolve(__dirname, 'dist') // Куда копируем
        }
      ]
    }),
    // Добавляем для того, чтобы css подключались отдельными файлами, а не в HTML
    new MiniCssExtractPlugin({
      filename: filename('css')
    })
  ]

  // Если идём в прод, подключаем библиотеку для просмотра статистики.
  // Показывает сколько занимает места та или иная библиотека
  if (isProd) {
    base.push(new BundleAnalyzerPlugin());
  }
  return base;

}

// Настроки самого webpack
module.exports = {
  // Указываем, от какой папки будут оуказаны пути ниже.
  // Например, можем писать не ./src/index.js, а ./index.js
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    // Если используем babel, ключ main должен быть массивом со значениеми '@babel/polyfill' и './index.js'.
    // Если babel не используем, то просто main: './index.js'
    main: ['@babel/polyfill','./index.js'],
    analytics: './analytics.ts'
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    // Extensions говорт вебпаку, какие расширения пинимаем по умолчанию при импорте (чтобы можно было не указывать расширения)
    extensions: ['.js', '.json', '.png'],
    // Alias позволяет добавить путь до папки с js-файлами, например, классами.
    // Используется при импорте, например: import from "@models/Post" (класс добавлен здесь для примера)
    alias: {
      '@models': path.resolve(__dirname, 'src/models'),
      '@': path.resolve(__dirname, 'src')
    } 
  },
  optimization: optimization(),
  // devServer - нужен для автоматической перезагрузки браузера.
  // Для использования нужно установить пакет webpack-dev-server и добавить скрипт start в package.json
  devServer: {
    port: 4200,
    // Hot добавляется в режиме разработки
    hot: isDev
  },
  // Если находимся в режиме разработки, добавляем карту источников.
  devtool: isDev ? 'source-map' : '',
  plugins: plugins(),
  module: {
    rules: [
      {
        // в ключе test с помощью регулярного выражения ищем файлы с расширениями.
        // Елси фаайлы найдены, то для них используется плагин (loader), указанный в use  ниже
        test: /\.css$/,

        // Если хотим, чтобы стили подключались в код HTML файлов, можно использоваться нижеуказанный use.
        // Все лоадеры нужно предварительно установить. Также лоадеры читаются справа налове (сначала применяется css-loader, потом style-loader);
        // use: ['style-loader', 'css-loader']

        // Если стили нужны в отдельном файле, используем MiniCssExtractPlugin.
        // Все параметры возвращаются из отдельной функции cssLoaders в начале этого скрипта
        use: cssLoaders()
      },
      {
        // лоадер для загрузки изображений
        test: /\.(png|jpg|svg|gif)/,
        use: ['file-loader']
      },
      {
        // Лоадер для загрузки и обработки шрифтов:
        test: /\.(ttf|woff}woff2|eot)$/,
        use: ['file-loader']
      },
      {
        // Лоадер для чтения и работы с xml-файлами
        test: /\.xml$/,
        use: ['xml-loader']
      },
      {
        // Лоадер для работы с csv-файлами
        test: /\.csv$/,
        use: ['csv-loader']
      },
      {
        // Лоадер для работы с SASS и SCSS
        // Предвариетельно нужно установить sass-loader и sass (npm i -D sass-loader, npm i -D sass)
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader')
      },
      {
        // Лоадер для работы с SASS и SCSS
        // Предвариетельно нужно установить less-loader и less (npm i -D less-loader, npm i -D less)
        test: /\.less$/, 
        use: cssLoaders('less-loader')
      },
      {
        // Лоадер для использования babel
        // Предвариетельно нужно установить npm install --save-dev babel-loader @babel/core
        test: /\.js$/, 
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        // Лоадер для работы с тайп-скриптом
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          // Пресет babel для поддержки TS. Нужно предварительно установить '@babel/preset-typescript
          options: babelOptions('@babel/preset-typescript')
        }
      }
    ]
  }
}