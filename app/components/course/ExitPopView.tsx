import React from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

interface ExitPopViewProps {
  onRquestClose: () => void;
  onRequestConfirm: () => void;
}

interface ExitPopViewAllProps extends ExitPopViewProps {
  t: any;
}

function ExitPopView(props: ExitPopViewAllProps):JSX.Element {
  const { onRquestClose, onRequestConfirm, t} = props;
  return (
    <div className="exit-pop-view">
      <div className="exit-content">
        <div className="exit-top">{t('exit_study_plan')}</div>
        <div className="exit-desc">{t('exit_study_plan_desc')}</div>
        <div className='exit-main'>
          <img src="images/icon_exit_pop.png" alt="icon_exit_pop" />
        </div>
        <div className="exit-bottom">
          <button
            className="button-exit-cancel"
            onClick={()=> {
              onRquestClose && onRquestClose();
            }}
          >{t('cancel')}</button>
          <div className="line"/>
          <button
            className="button-exit-confirm"
            onClick={()=> {
              onRequestConfirm && onRequestConfirm()
            }}
          >{t('giveup')}</button>
        </div>
      </div>
    </div>
  );
}

function makeMapStateToProps() {
  return function() {
    return {

    };
  }
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(ExitPopView) as React.ComponentType<ExitPopViewProps>;
