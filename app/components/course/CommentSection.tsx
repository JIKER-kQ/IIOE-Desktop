import React from 'react';
import { withNamespaces } from 'react-i18next';
import ReactLoading from 'react-loading';
import { connect } from 'react-redux';
import { compose } from 'redux';

export interface CommentProps {
  id: String,
  time: string;
  headPhoto: string;
  studentName: string;
  studentId: string;
  content: string;
  score: number;
}

interface CommentSectionProps {
  commentRef: any;
  commentList: CommentProps[];
  commentText: String;
  loadingMore: boolean;
  loadedFailure: boolean;
  hasMore: boolean;
  userID: String;
  commentCount: number;
  onRequestMore: () => void;
  onDeleteComment:(String, number)=>void
}

interface CommentSectionAllProps extends CommentSectionProps {
  t: any;
}

function CommentSection(props: CommentSectionAllProps): JSX.Element {
  const {
    commentList,
    commentText,
    commentRef,
    hasMore,
    loadingMore,
    loadedFailure,
    commentCount,
    onRequestMore,
    onDeleteComment,
    userID,
    t,
  } = props;

  function renderStarList(score: number): JSX.Element[] {
    const elements: JSX.Element[] = [];
    if (score === 0 || score === null) {
      return elements;
    }
    for (let i = 0; i < 5; i += 1) {
      let imageName = 'images/star.png';
      if (i * 2 < score) {
        imageName = 'images/star_active.png';
      }
      elements.push(
        <div className="star-item">
          <img alt="star" src={imageName} />
        </div>
      );
    }
    return elements;
  }

  function renderCommentList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < commentList.length; i += 1) {
      const item = commentList[i];
      const time1 = new Date(item.time);
      const day =
        time1.getDate() < 10 ? `0${time1.getDate()}` : time1.getDate();
      const month =
        time1.getMonth() + 1 < 10
          ? `0${time1.getMonth() + 1}`
          : time1.getMonth() + 1;
          console.log(item.studentId)
          console.log(userID)
      if (item.studentId === userID) {
        elements.push(
          <div className="comment-item">
            <div className="item-header">
              <div className="item-top">
                <div className="item-avatar">
                  <img
                    src={item.headPhoto ?? 'images/avatar.png'}
                    alt="item-avatar"
                  />
                </div>
                <div className="item-top-right">
                  <div className="item-name">{item.studentName}</div>
                  <div className="item-time">
                    {month}/{day}/{time1.getFullYear()}
                  </div>
                </div>
              </div>
              <div className="star-list">
                <button onClick={()=> {
                  onDeleteComment(item.id, i)
                }}>
                  <img src="images/icon_comment_delete.png" alt="delete" />
                  <p>{t('delete')}</p>
                </button>
              </div>
            </div>
            <div className="item-content">{item.content}</div>
          </div>
        );
      }
      else {
        elements.push(
          <div className="comment-item">
            <div className="item-header">
              <div className="item-top">
                <div className="item-avatar">
                  <img
                    src={item.headPhoto ?? 'images/avatar.png'}
                    alt="item-avatar"
                  />
                </div>
                <div className="item-top-right">
                  <div className="item-name">{item.studentName}</div>
                  <div className="item-time">
                    {month}/{day}/{time1.getFullYear()}
                  </div>
                </div>
              </div>
              <div className="star-list">{renderStarList(item.score)}</div>
            </div>
            <div className="item-content">{item.content}</div>
          </div>
        );
      }
    }
    return elements;
  }

  function renderHasMore(): JSX.Element {
    if (hasMore && !loadingMore && !loadedFailure) {
      return (
        <div className="more-field">
          <button
            type="button"
            className="has-more-button"
            onClick={() => {
              onRequestMore();
            }}
          >
            <span>{t('see_more')}</span>
            <img alt="img-more" src="images/icon_load_more.png" />
          </button>
        </div>
      );
    }
    return <div />;
  }

  function renderLoading(): JSX.Element {
    if (hasMore && loadingMore && !loadedFailure) {
      return (
        <div className="more-field">
          <div className="icon-loading">
            <ReactLoading
              type="spokes"
              color="#0175D2"
              height={50}
              width={50}
            />
          </div>
        </div>
      );
    }
    return <div />;
  }

  function renderLoadedFailure(): JSX.Element {
    if (hasMore && !loadingMore && loadedFailure) {
      return (
        <div className="more-field">
          <button
            type="button"
            className="has-more-button"
            onClick={() => {
              onRequestMore();
            }}
          >
            <span>{t('load_failed')}, {t('click_to_retry')}</span>
            <img alt="img-more" src="images/icon_load_more.png" />
          </button>
        </div>
      );
    }
    return <div />;
  }

  return (
    <div className="section-comment" ref={commentRef}>
      {commentCount === 0 ? (
        <div className="comment-header">{commentText}</div>
      ) : (
        <div className="comment-header">
          {commentText} ( {commentCount} )
        </div>
      )}
      <div className="comment-list">{renderCommentList()}</div>
      {renderHasMore()}
      {renderLoading()}
      {renderLoadedFailure()}
    </div>
  );
}

function makeMapStateToProps() {
  return function () {
    return {};
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(CommentSection) as React.ComponentType<CommentSectionProps>;

