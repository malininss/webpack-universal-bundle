const createAnalytics = () => {
  let counter = 0;
  let destroyed = false;

  console.log('test');
  
  const listener = () => {
    counter++;
  }

  document.addEventListener('click', listener);

  return {
    destroy() {
      document.removeEventListener('click', listener);
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

window.analytics = createAnalytics();