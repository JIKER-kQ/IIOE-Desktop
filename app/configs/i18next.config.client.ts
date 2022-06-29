const i18n = require('i18next');

const { reactI18nextModule } = require('react-i18next');

const config = require('./app.config');

const i18nextOptions = {
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  lng: 'zh',
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  react: {
    wait: false,
  },
  debug: true,
};

i18n.use(reactI18nextModule);

// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n.init(i18nextOptions, (err, t) => {
    if (err) return console.log('something went wrong loading', err);
    t('key'); // -> same as i18next.t
  });
}

export default i18n;
