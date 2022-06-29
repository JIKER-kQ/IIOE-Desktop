import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { withNamespaces } from 'react-i18next';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import routes from '../constants/routes.json';
import { fetchRecommend, updateIndex } from '../features/homeSlice';
import { resetCourseList } from '../features/courseListSlice';

interface HomeProps {
  tabIndex: number;
  recommendList: any[];
  allList: any[];
  t: any;
  lng: 'en' | 'zh' | 'fr';
}

function HomeScreen(props: HomeProps): JSX.Element {
  const dispatch = useDispatch();
  const history = useHistory();
  const { recommendList, allList, tabIndex, t, lng } = props;
  const [startIndex, setStartIndex] = useState(0);
  const rootCategoryList = [
    'all',
    'discipline_course',
    'tvet_course',
    'professional_course',
  ];

  useEffect(() => {
    dispatch(fetchRecommend());
  }, [lng]);

  useEffect(() => {
    dispatch(updateIndex(tabIndex, true));
  }, [lng]);

  function renderSortList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < rootCategoryList.length; i += 1) {
      if (i === props.tabIndex) {
        elements.push(
          <div className="filter-title active" key={i}>
            {t(rootCategoryList[i])}
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
              dispatch(updateIndex(i, false));
            }}
            onKeyDown={() => {}}
          >
            {t(rootCategoryList[i])}
          </div>
        );
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

  function renderRecommendList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    if (recommendList.length === 0) {
      for (let i = 0; i < 4; i += 1) {
        elements.push(<div className="section-item" key={i} />);
      }
    } else {
      for (
        let i = startIndex;
        i < recommendList.length && i < startIndex + 4;
        i += 1
      ) {
        const item = recommendList[i];
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
    }
    return elements;
  }

  function renderAllList() {
    const elements: JSX.Element[] = [];
    if (tabIndex === -1) {
      return <div />;
    }
    if (allList[tabIndex].length === 0) {
      for (let i = 0; i < 4; i += 1) {
        elements.push(<div className="section-item" key={i} />);
      }
    } else {
      for (let i = 0; i < allList[tabIndex].length && i < 12; i += 1) {
        const item = allList[tabIndex][i];
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
    }
    return elements;
  }

  return (
    <div className="home">
      <div className="section">
        <div className="section-header">
          <div className="section-title">{t('recommend_course')}</div>
          <button
            type="button"
            className="button-change"
            onClick={() => {
              if (startIndex + 4 >= recommendList.length) {
                setStartIndex(0);
              } else {
                setStartIndex(startIndex + 4);
              }
            }}
          >
            <img src="images/icon_change.png" alt="all" />
            <p>{t('change')}</p>
          </button>
        </div>
        <div className="section-list">{renderRecommendList()}</div>
      </div>
      <div className="section">
        <h6 className="section-title">{t('all_course')}</h6>
        <div className="section-filter">
          <div className="section-sort">{renderSortList()}</div>
          <button
            type="button"
            className="button-see-all"
            onClick={() => {
              dispatch(resetCourseList());
              setTimeout(() => {
                history.push(routes.COURSELIST + rootCategoryList[tabIndex]);
              }, 150);
            }}
          >
            <p>{t('view_all')}</p>
            <img src="images/icon_see_all.png" alt="all" />
          </button>
        </div>
        <div className="section-list">{renderAllList()}</div>
      </div>
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
        window.collectEvent('click_course_event', {
          from: 'home',
          course_id: courseID,
        });
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
      tabIndex: state.home.tabIndex,
      recommendList: state.home.recommendList,
      allList: state.home.allList,
    };
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(HomeScreen) as React.ComponentType;
