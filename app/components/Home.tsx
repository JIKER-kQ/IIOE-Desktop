import React from 'react';
import { withNamespaces } from 'react-i18next';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import i18n from '../configs/i18next.config.client';

function Home(props: any): JSX.Element {
  const { t } = props;
  const toggle = (lng: any) => i18n.changeLanguage(lng);
  return (
    <div className="home">
      <div className="container" data-tid="container">
        <h2>{t('helloMessage')}</h2>
        <Link to={routes.COUNTER}>to Counter</Link>
        <button type="button" onClick={() => toggle('zh')}>
          {t('button')}
        </button>
        <button type="button" onClick={() => toggle('en')}>
          {t('button')}
        </button>
      </div>
    </div>
  );
}

export default withNamespaces()(Home);
