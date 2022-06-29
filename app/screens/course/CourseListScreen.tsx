import React, { useEffect } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { compose } from 'redux';
import ReactLoading from 'react-loading';
import routes from '../../constants/routes.json';
import {
  updateRootIndex,
  fetchCategoryList,
  updateCategoryIndex,
  LoadStatusProps,
  fetchMoreCourseList,
  resetCourseList,
} from '../../features/courseListSlice';

interface CourseListScreenProps {
  rootIndex: number;
  categoryIndex: number;
  categoryList: any[];
  allList: any[];
  t: any;
  markList: LoadStatusProps[][];
  lng: 'en' | 'zh' | 'fr';
}

interface ParamsProps {
  catrgoryID: string;
}

function CourseListScreen(props: CourseListScreenProps) {
  const rootCategoryList = [
    'all',
    'discipline_course',
    'tvet_course',
    'professional_course',
  ];
  const { catrgoryID } = useParams<ParamsProps>();
  const {
    t,
    rootIndex,
    categoryIndex,
    categoryList,
    allList,
    markList,
    lng,
  } = props;
  const dispatch = useDispatch();
  const { hasMore, loadingMore, loadedFailure } = markList[rootIndex][
    categoryIndex
  ];

  useEffect(() => {
    dispatch(updateRootIndex(rootCategoryList.indexOf(catrgoryID)));
    if (categoryList.length === 0) {
      console.log(rootCategoryList.indexOf(catrgoryID));
      dispatch(fetchCategoryList());
    }
  }, [catrgoryID]);

  useEffect(() => {
    if (categoryList.length > 0) {
      dispatch(updateCategoryIndex(categoryIndex, true));
      dispatch(resetCourseList(false));
      dispatch(fetchCategoryList(true));
    }
  }, [lng]);

  function renderRootCatrgoryList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < categoryList.length + 1; i += 1) {
      if (i === props.rootIndex) {
        elements.push(
          <div className="filter-title active" key={i}>
            {i === 0 ? t('all') : categoryList[i - 1]['name']}
          </div>
        );
      } else {
        elements.push(
          <div
            className="filter-title"
            key={i}
            role="button"
            tabIndex={i}
            onClick={() => {
              dispatch(updateRootIndex(i));
            }}
            onKeyDown={() => {}}
          >
            {i === 0 ? t('all') : categoryList[i - 1]['name']}
          </div>
        );
      }
    }
    return elements;
  }

  function renderCategoryList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    if (rootIndex > 0 && categoryList.length > 0) {
      const list = categoryList[rootIndex - 1]['children'];
      for (let i = 0; i < list.length + 1; i += 1) {
        if (i === props.categoryIndex) {
          elements.push(
            <div className="filter-title active" key={i}>
              {i === 0 ? t('all') : list[i - 1]['name']}
            </div>
          );
        } else {
          elements.push(
            <div
              className="filter-title"
              key={i}
              role="button"
              tabIndex={i}
              onClick={() => {
                dispatch(updateCategoryIndex(i));
              }}
              onKeyDown={() => {}}
            >
              {i === 0 ? t('all') : list[i - 1]['name']}
            </div>
          );
        }
      }
    }
    return elements;
  }

  function isNewCourse(date: string): boolean {
    const time1 = new Date(date);
    const days = Math.floor(
      (Date.now() - time1.getTime()) / 1000 / 60 / 60 / 24
    );
    return days < 31;
  }

  function renderAllList() {
    const elements: JSX.Element[] = [];
    if (rootIndex === -1) {
      return <div />;
    }
    if (allList[rootIndex][categoryIndex] === null) {
      for (let i = 0; i < 12; i += 1) {
        elements.push(<div className="section-item" key={i} />);
      }
    } else if (allList[rootIndex][categoryIndex].length > 0) {
      for (let i = 0; i < allList[rootIndex][categoryIndex].length; i += 1) {
        const item = allList[rootIndex][categoryIndex][i];
        elements.push(
          <CourseItem
            index={i}
            key={i}
            courseID={item.id}
            sortName={t(item.rootCategoryCode)}
            coverURL={item.imageAddress}
            sourceName={item.educationName}
            courseName={item.name}
            sourceLng={item.language}
            isNew={isNewCourse(item.createdDate)}
          />
        );
      }
    } else {
      elements.push(
        <div className="section-empty">
          <img alt="icon-empty" src="images/icon_course_empty.png" />
          <p className="empty-text">{t('empty_information')}</p>
        </div>
      );
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
              // onRequestMore();
              dispatch(fetchMoreCourseList());
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
              // onRequestMore();
              dispatch(fetchMoreCourseList());
            }}
          >
            <span>
              {t('load_failed')}, {t('click_to_retry')}
            </span>
            <img alt="img-more" src="images/icon_load_more.png" />
          </button>
        </div>
      );
    }
    return <div />;
  }

  return (
    <div className="course-list-container">
      <div className="course-header">{t('all_course')}</div>
      <div className="category-container">
        <div className="category-list">{renderRootCatrgoryList()}</div>
        <div className="category-list">{renderCategoryList()}</div>
      </div>
      <div className="course-section">{renderAllList()}</div>
      {renderHasMore()}
      {renderLoading()}
      {renderLoadedFailure()}
    </div>
  );
}

interface CourseItemProps {
  courseID: string;
  sortName: string;
  coverURL: string;
  courseName: string;
  sourceName: string;
  sourceLng: string;
  isNew: boolean;
  index: number;
}

function CourseItem(props: CourseItemProps): JSX.Element {
  const {
    index,
    courseID,
    sortName,
    isNew,
    coverURL,
    courseName,
    sourceName,
    sourceLng,
  } = props;
  const history = useHistory();
  return (
    <div
      role="button"
      tabIndex={index}
      className="section-item"
      onKeyDown={() => {}}
      onClick={() => {
        setTimeout(() => {
          history.push(routes.COURSE + courseID);
        }, 150);
      }}
    >
      <div className="item-top">
        <img className="item-cover" src={coverURL} alt="item-cover" />
        {isNew ? (
          <img src="images/new.png" alt="item-tag" className="item-tag" />
        ) : (
          <div />
        )}
        <div
          className="item-sort"
          style={{ backgroundImage: `url('images/bg_sort.png')` }}
        >
          {sortName}
        </div>
      </div>
      <div className="item-main">
        <div className="item-name">{courseName}</div>
        <div className="item-source">
          <p className="source-name">
            <span>{sourceName}</span>
          </p>
          <p className="source-lng">{sourceLng}</p>
        </div>
      </div>
    </div>
  );
}

function makeMapStateToProps() {
  return function (state: any) {
    return {
      rootIndex: state.courseList.rootIndex,
      categoryIndex: state.courseList.categoryIndex,
      categoryList: state.courseList.categoryList,
      allList: state.courseList.allList,
      markList: state.courseList.markList,
    };
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(CourseListScreen) as React.ComponentType;
