// Пример скрипта, который должен подключиться отдельно.
// Пример подключения jquery.

import * as $ from 'jquery';

const createAnalytics = (): object => {
  let counter = 0;
  let destroyed: boolean = false;

  console.log('test');
  
  const listener = ():number => counter++;

  $(document).on('click', listener);

  return {
    destroy() {
      $(document).off('click', listener);
      destroyed = true;
    },

    getClicks() {
      if (destroyed) {
        return `Analytics is destroed. Total clicks is ${counter}`;
      }
      return counter;
    }
  }
}

window['analytics'] = createAnalytics();