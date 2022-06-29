const config = {
  platform: process.platform,
  port: process.env.PORT ? process.env.PORT : 3000,
  title: 'PhraseApp Electron i18n',
  languages: ['en', 'zh', 'fr'],
  fallbackLng: 'en',
  namespace: 'translation',
};

export default config;
