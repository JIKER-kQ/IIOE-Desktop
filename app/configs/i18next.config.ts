import path from 'path';
import { app } from 'electron';

const i18n = require('i18next');

// const app = require('electron').remote.app;
const i18nextBackend = require('i18next-node-fs-backend');
const config = require('./app.config');
const json = require('../locales/zh/translation.json');

console.log(json);

console.log(__dirname);
console.log(app.getAppPath());
console.log(path.dirname(process.resourcesPath));

const i18nextOptions = {
  backend: {
    // path where resources get loaded from
    loadPath: path.join(app.getAppPath(), 'locales/{{lng}}/{{ns}}.json'),

    // path to post missing resources
    addPath: path.join(app.getAppPath(), 'locales/{{lng}}/{{ns}}.missing.json'),

    // jsonIndent to use when storing json files
    jsonIndent: 2,
  },
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  react: {
    wait: false,
  },
  debug: true,
};

i18n.use(i18nextBackend);

// initialize if not already initialized
if (!i18n.isInitialized) {
  console.log('very-=========');
  i18n.init(i18nextOptions, (err, t) => {
    if (err) return console.log('something went wrong loading', err);
    t('key'); // -> same as i18next.t
  });
}

export default i18n;
