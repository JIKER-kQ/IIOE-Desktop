import React, { useEffect, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { HomeApi } from '../api/HomeApi';
import { fillVersionData } from '../features/versionSlice';

interface VerisonPopViewProps {
  nowVersion: string;
  macURL: string;
  windowsURL: string;
  desc: string;
  t: any;
}

function VerisonPopView(props: VerisonPopViewProps): JSX.Element {
  const appVersion = require('electron').remote.app.getVersion();
  const { nowVersion, macURL, windowsURL, desc, t } = props;
  const dispatch = useDispatch();
  const [show, setShow] = useState(true);
  useEffect(() => {
    const mac = require('electron').remote.process.platform === 'darwin';
    HomeApi.version(mac)
      .then((response: any) => {
        dispatch(
          fillVersionData(
            response.version,
            mac ? response.downloadAddress : '',
            mac ? '' : response.downloadAddress,
            response.description
          )
        );
        return 0;
      })
      .catch((error: any) => {
        console.log(error);
      });
  }, []);

  function compareVersion(a: String, b: String) {
    if (a === b) {
      return 0;
    }

    const aComponents = a.split('.');
    const bComponents = b.split('.');

    const len = Math.min(aComponents.length, bComponents.length);

    // loop while the components are equal
    for (let i = 0; i < len; i += 1) {
      if (parseInt(aComponents[i], 10) > parseInt(bComponents[i], 10)) {
        return 1;
      }

      if (parseInt(aComponents[i], 10) < parseInt(bComponents[i], 10)) {
        return -1;
      }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (aComponents.length > bComponents.length) {
      return 1;
    }

    if (aComponents.length < bComponents.length) {
      return -1;
    }
    return 0;
  }

  return compareVersion(nowVersion, appVersion) > 0 && show ? (
    <div className="VerisonPopView">
      <div className="content">
        <img alt="version-update-top" src="images/bg_version_update.png" />
        <div className="title">{t('version_update')}</div>
        <div className="version">{nowVersion}</div>
        <div className="header-title">{t('update_content')}：</div>
        <div className="desc">{desc}</div>
        <div className="button-container">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              setShow(false);
            }}
          >
            {t('cancel')}
          </button>
          <div className="line" />
          <button
            type="button"
            className="btn-update"
            onClick={() => {
              setShow(false);
              // eslint-disable-next-line global-require
              const { shell } = require('electron');
              const mac = require('electron').remote.process.platform === 'darwin';
              if (mac) {
                shell.openExternal(macURL);
              } else {
                shell.openExternal(windowsURL);
              }
            }}
          >
            {t('update_now')}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
}

function makeMapStateToProps() {
  return function (state: any) {
    return {
      nowVersion: state.version.nowVersion,
      macURL: state.version.macURL,
      windowsURL: state.version.windowsURL,
      desc: state.version.desc,
    };
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(VerisonPopView) as React.ComponentType;
