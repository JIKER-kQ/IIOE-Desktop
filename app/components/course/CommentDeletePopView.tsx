import React from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

interface CommentDeletePopViewProps {
  onRquestClose: () => void;
  onRequestConfirm: () => void;
}

interface CommentDeletePopViewAllProps extends CommentDeletePopViewProps {
  t: any;
}

function CommentDeletePopView(props: CommentDeletePopViewAllProps):JSX.Element {
  const { onRquestClose, onRequestConfirm, t} = props;
  return (
    <div className="delete-pop-view">
      <div className="delete-content">
        <div className="delete-top">
          <span>{t('hint')}</span>
          <button onClick={()=> {
            onRquestClose && onRquestClose();
          }}>
            <img src="images/icon_pop_close.png" alt="icon-close" />
          </button>
        </div>
        <div className="delete-warning">
          <img src="images/icon_pop_warning.png" alt="icon-delete" />
        </div>
        <div className="delete-desc">{t('delete_comment_desc')}?</div>
        <div className="delete-bottom">
          <button
            className="button-delete-cancel"
            onClick={()=> {
              onRquestClose && onRquestClose();
            }}
          >{t('cancel')}</button>
          <div className="line"/>
          <button
            className="button-delete-confirm"
            onClick={()=> {
              onRequestConfirm && onRequestConfirm()
            }}
          >{t('confirm')}</button>
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
)(CommentDeletePopView) as React.ComponentType<CommentDeletePopViewProps>;
