import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { ipcRenderer } from 'electron';
import { I18nextProvider } from 'react-i18next';
import { history, configuredStore } from './store';
import './global/app.global.css';
import './global/app.global.scss';
import '@material/react-text-field/dist/text-field.css';
import client from './configs/i18next.config.client';
import Api from './api/Api';

const store = configuredStore();

const i18n = client.default;

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const initialI18nStore = ipcRenderer.sendSync('get-initial-translations');

ipcRenderer.on('language-changed', (event, message) => {
  console.log(message);
  console.log(i18n);
  console.log(i18n.default);
  console.log(i18n.hasResourceBundle(message.language, message.namespace));
  if (!i18n.hasResourceBundle(message.language, message.namespace)) {
    i18n.addResourceBundle(
      message.language,
      message.namespace,
      message.resource
    );
  }

  i18n.changeLanguage(message.language);
});

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default;
  // console.log(i18n);
  // console.log('===========');
  render(
    <I18nextProvider
      i18n={i18n}
      initialI18nStore={initialI18nStore}
      initialLanguage="zh"
    >
      <AppContainer>
        <Root store={store} history={history} />
      </AppContainer>
    </I18nextProvider>,
    document.getElementById('root')
  );
});

Api.configureURL(true);
