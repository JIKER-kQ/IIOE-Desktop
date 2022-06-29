import React, { useState } from 'react';
import { remote } from 'electron';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { compose } from 'redux';
import { updatePopupSatus } from '../features/settingsSlice';
import { logout, changeLanguage } from '../features/user/userSlice';
import routes from '../constants/routes.json';
// import i18n from '../configs/i18next.config.client';

interface SliderBarProps {
  token: string;
  router: any;
  showSettings: boolean;
  online: boolean,
  user: any,
  lng: 'en' | 'zh' | 'fr';
  t: any;
}

function SliderBar(props: SliderBarProps): JSX.Element {
  // eslint-disable-next-line react/prop-types
  const { token, router, showSettings, lng, t, online, user } = props;
  // eslint-disable-next-line react/prop-types
  const login = token != null && token.length > 0;
  const appVersion = require('electron').remote.app.getVersion();
  const videoPlay = router.location.pathname.indexOf('video') > -1;
  const dispatch = useDispatch();
  const history = useHistory();
  const [index, setIndex] = useState(0);

  function renderLanguageList(): JSX.Element[] {
    const list = ['English', '中文', 'Français'];
    const languageList = ['en', 'zh', 'fr'];
    const elements: JSX.Element[] = [];
    for (let i = 0; i < list.length; i += 1) {
      if (languageList.indexOf(lng) === i) {
        elements.push(
          <div className="language-item">
            <span className="active-text">{list[i]}</span>
            <img alt="selected" src="images/icon_language_selected.png" />
          </div>
        );
      } else {
        elements.push(
          <div
            className="language-item"
            role="button"
            tabIndex={i}
            onKeyDown={() => {}}
            onClick={() => {
              // toggle(languageList[i]);
              dispatch(changeLanguage(languageList[i]));
            }}
          >
            <span>{list[i]}</span>
          </div>
        );
      }
    }
    return elements;
  }

  function renderPopup(): JSX.Element {
    if (!showSettings) {
      return <div />;
    }
    return (
      <div className="popup-container">
        <div className="popup-first-left">
          <div className="item first-item">
            <button
              type="button"
              className="button-language"
              onClick={(e: any) => {
                e.stopPropagation();
              }}
            >
              <div className="sub-item">
                <img src="images/icon_laguage.png" alt="language" />
                <span>{t('switch_language')}</span>
              </div>
              <img
                className="icon-right"
                src="images/icon_direction_right.png"
                alt="direction-right"
              />
            </button>
            <div className="language-list">{renderLanguageList()}</div>
          </div>
          {
            online ?
            <div className="item">
              <button
                type="button"
                className="button-logout"
                onClick={() => {
                  dispatch(logout());
                }}
              >
                <div className="sub-item">
                  <img src="images/icon_logout.png" alt="language" />
                  <span>{t('logout')}</span>
                </div>
              </button>
            </div>
            :
            <div/>
          }
          <div className="version-item">
            {t('version_code')}：{appVersion}
          </div>
        </div>
      </div>
    );
  }

  return (remote.getGlobal("hasNetwork") && login && !videoPlay) || !remote.getGlobal("hasNetwork") ? (
    <div className="slider-container">
      <div className="top-slider-bar">
        <div className="slider-top">
          {
            online ?
            <button className="avatar" type="button" onClick={()=> {
              if (online) {
                history.push(routes.ME);
              }
            }}>
              {
                login && user != null && user['headPhoto'] != null && user['headPhoto'].length > 0 ?
                <img src={user['headPhoto']} alt="avatar" />
                :
               <img src="images/avatar.png" alt="avatar" />
              }
            </button>
            :
            <div/>
          }

          <button className="tab-item" type="button">
            {
              online ?
              <button onClick={()=>{
                setIndex(0);
                history.push(routes.HOME)
              }}>
                <img src={index == 0 ? "images/course.png":"images/icon_normal_course.png"} alt="avatar" />
              </button>
              :
              <img src="images/icon_offline.png" alt="avatar" />
            }

          </button>
          <button className="tab-item" type="button">
            {
              online ?
              <button onClick={()=>{
                setIndex(1);
                history.push(routes.LIBRARY)
              }}>
                <img src={index == 1 ? "images/icon_library_active.png": "images/icon_library.png"} alt="avatar" />
              </button>
              :
              <div/>
            }

          </button>
          <button className="tab-item about" type="button">
            {
              online ?
              <button onClick={()=>{
                setIndex(2);
                history.push(routes.ABOUTUS)
              }}>
                <img src={index == 2 ? "images/icon_about_active.png": "images/icon_about.png"} alt="avatar" />
              </button>
              :
              <div/>
            }

          </button>
        </div>
        <button
          className="settings-item"
          type="button"
          onClick={(e) => {
            console.log('=======');
            if (!showSettings) {
              dispatch(updatePopupSatus(true));
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <img src="images/icon_settings.png" alt="settings" />
        </button>
      </div>
      {renderPopup()}
    </div>
  ) : (
    <div />
  );
}

function makeMapStateToProps() {
  return function (state: any) {
    return {
      token: state.user.token,
      user: state.user.user,
      router: state.router,
      showSettings: state.settings.show,
      online: state.settings.online,
    };
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(SliderBar) as React.ComponentType;
