import Post from './Post'; // Пример импорта .js файла
import json from './assets/json.json' // Пример импорта json
import './styles/styles.css'; // Пример импорта .css
import AngularLogo from './assets/image.png' // Пример импорта картинок
import xml from './assets/data.xml' // Пример импорта XML
import csv from './assets/data.csv' // Пример импорта csv-файла


const post = new Post('Webpack Post Title', AngularLogo);
console.log('Post to string:', post.toString());
console.log('JSON:', json);
console.log('XML', xml);
console.log('csv', csv);