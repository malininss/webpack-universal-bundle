// В index.js должны подключаться все библиотеки, стили и т.п.


// Обязательно импортируем babel
import './babel';

// Пример подключения jquery-библиотеки
import * as $ from 'jquery'

 // Пример импорта .js файла. Папка @models указывается в webpack.config.js в ключе alias
import Post from '@models/Post';

// Пример импорта .css, .scss, .less
import './styles/styles.css';
import './styles/scss.scss';
import './styles/less.less';

// Пример импорта картинки. 
// Расширение .png можно не указывать, т.к. мы его добавили в resolve extensions в webpack.config.js
import webpackLogo from './assets/image';

// Пример импорта json-файла
import json from './assets/json.json'

// Пример импорта XML
import xml from './assets/data.xml'

// Пример импорта CSV
import csv from './assets/data.csv'




// Пример создания экземпляра объекта класс Post, который мы импортировали в файл
const post = new Post('Webpack Post Title', webpackLogo);

// Пример использования jquery
$('pre').addClass('code').html(post.toString());

// Примеры работы с файлами:
console.log('Post to string:', post.toString());
console.log('JSON:', json);
console.log('XML', xml);
console.log('csv', csv);

 

