import React, { useEffect } from 'react';
import { remote } from 'electron';
import { withNamespaces } from 'react-i18next';
import { useHistory } from 'react-router';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { fetchProfile, login } from '../features/user/userSlice';

interface HeaderProps {
  token: string;
  user: { string: any };
  router: any;
}

function Header(props: HeaderProps): JSX.Element {
  const history = useHistory();
  const dispatch = useDispatch();
  // eslint-disable-next-line react/prop-types
  const { token, user, router } = props;
  const isMac = require('electron').remote.process.platform === 'darwin';

  // eslint-disable-next-line react/prop-types
  const isLogin = token && token.length > 0;
  const videoPlay = router.location.pathname.indexOf('video') > -1;

  console.log('======== render header');
  // console.log(router);

  useEffect(() => {
    // console.log(token);
    // eslint-disable-next-line react/prop-types
    if (token !== null && token !== '' && user === null) {
      // console.log('fectch========');
      dispatch(fetchProfile());
    }
  }, [token]);

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (history.location.pathname !== '/login' && localToken == null) {
      if (remote.getGlobal("hasNetwork")) {
        history.push('/login');
      }
    }

    if (!isLogin && localToken != null) {
      dispatch(login(localToken));
    }
  }, [token]);

  function renderRightSection(): JSX.Element {
    return isMac ? (
      <div className="right-section" />
    ) : (
      <div className="right-section">
        <button
          type="button"
          className="minimize"
          onClick={() => {
            // eslint-disable-next-line global-require
            require('electron').remote.getCurrentWindow().minimize();
          }}
        >
          <img src="images/icon_minimize.png" alt="minimize" />
        </button>
        <button
          type="button"
          className="full"
          onClick={() => {
            // eslint-disable-next-line global-require
            const electron = require('electron');
            if (electron.remote.getCurrentWindow().isMaximized()) {
              electron.remote.getCurrentWindow().unmaximize();
            } else {
              electron.remote.getCurrentWindow().maximize();
            }
          }}
        >
          <img src="images/icon_full.png" alt="full" />
        </button>
        <button
          type="button"
          className="close"
          onClick={() => {
            // eslint-disable-next-line global-require
            const electron = require('electron');
            electron.remote.getCurrentWindow().close();
          }}
        >
          <img src="images/icon_close.png" alt="close" />
        </button>
      </div>
    );
  }

  return isLogin || !remote.getGlobal("hasNetwork") ? (
    <div className="top-header">
      <div className="left-section">
        {videoPlay ? (
          <div />
        ) : (
          <img
            className="header-logo"
            src="images/header_logo.png"
            alt="logo"
          />
        )}
        {router.location.pathname === '/' || videoPlay ? (
          <div />
        ) : (
          <button
            type="button"
            onClick={() => {
              history.goBack();
            }}
          >
            <img src="images/icon_back.png" alt="back-button" />
          </button>
        )}
      </div>
      {renderRightSection()}
    </div>
  ) : (
    <div className="auth-header">
      <div className="header-logo" />
      {renderRightSection()}
    </div>
  );
}

function makeMapStateToProps() {
  return function (state: any) {
    return {
      token: state.user.token,
      user: state.user.user,
      router: state.router,
    };
  };
}

export default compose(withNamespaces(), connect(makeMapStateToProps))(Header) as React.ComponentType;
