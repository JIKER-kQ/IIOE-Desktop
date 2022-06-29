import React from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

interface ImportPopViewProps {
  progress: number,
  onRquestClose: () => void;
}

interface ImportPopViewAllProps extends ImportPopViewProps {
  t: any;
}

function ImportPopView(props:ImportPopViewAllProps) {
  const { progress, onRquestClose, t } = props;
  return (
    <div className="import-pop-view">
      <div className="import-content">
        <h4>{t('import_progress')}</h4>
        {
          progress < 100 ?
          <div className="progress-bar-field">
            <div className="progress-bar">
              <div className="progress-bar-value" style={{width: progress.toString() + '%'}}/>
            </div>
            <span>{progress.toString()}%</span>
          </div>
          :
          <div className="success-field">
            <img alt="img-import-success" src="images/icon_import_success.png" />
            <p className="import-desc">{t('import_success')}</p>
            <button
             className="complete-button"
             onClick={() => {
               onRquestClose && onRquestClose();
             }}
            >{t('import_complete')}</button>
          </div>
        }
      </div>
    </div>
  );
}

function makeMapStateToProps() {
  return function () {
    return {
    };
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(ImportPopView) as React.ComponentType<ImportPopViewProps>;
