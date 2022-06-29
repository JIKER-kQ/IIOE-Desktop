import React, { useState, createRef } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { CourseApi } from '../../api/CourseApi';
import LoadingOverlay from 'react-loading-overlay';

interface RatePopViewProps {
  onRquestClose: () => void;
  courseID: String;
}

interface RatePopViewAllProps extends RatePopViewProps {
  t: any;
}

function RatePopView(props: RatePopViewAllProps): JSX.Element {
  const [star, setStar] = useState(0);
  const commentRef = createRef<HTMLTextAreaElement>();
  const { onRquestClose, courseID, t } = props;
  const [loading, setLoading] = useState<boolean>(false);

  function renderStarList(score: number): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < 5; i += 1) {
      let imageName = 'images/star.png';
      if (i * 2 < score) {
        imageName = 'images/star_active.png';
      }
      elements.push(
        <button className="star-item" key={i} onClick={() => { setStar((i + 1) * 2)}}>
          <img alt="star" src={imageName} />
        </button>
      );
    }
    return elements;
  }

  var placeholder = t('course_score_desc') + '....';
  return (
    <div className="rate-pop-container">
      <div className="rate-content">
        <div className="rate-title">{t('course_score')}</div>
        <div className="rate-desc">{t('course_score_desc')}</div>
        <div className="star-section">
          {renderStarList(star)}
        </div>
        <textarea ref={commentRef} placeholder={placeholder}></textarea>
        <div className="horizontal-line"></div>
        <div className="button-section">
            <button className="next-button" onClick={() => {
              onRquestClose && onRquestClose();
            }}>{t('next_time')}</button>
            <div className="vertical-line"></div>
            <button className="send-button" onClick={() => {
              if (star > 0 && commentRef.current!.value.length > 0) {
                setLoading(true);
                const params = {
                  'content':  commentRef.current!.value,
                  'score': star
                }
                CourseApi.scoreCourse(courseID, params)
                .then(() => {
                  setLoading(false);
                  onRquestClose && onRquestClose();
                  return 0;
                })
                .catch(() => {
                  setLoading(false);
                });
              }
            }}>{t('send')}</button>
        </div>
      </div>
      <LoadingOverlay active={loading} spinner />
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
)(RatePopView) as React.ComponentType<RatePopViewProps>;
