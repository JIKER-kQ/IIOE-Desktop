import React, { useEffect } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import ReactLoading from 'react-loading';
import { compose } from 'redux';
import routes from '../../constants/routes.json';
import { fetchHistory, fetchStudy, LoadStatusProps, updateSelectedIndex, resetAllData } from '../../features/meSlice';
import { spawn } from 'child_process';
import { ipcRenderer } from 'electron';
import DownloadSection from '../../components/me/DownloadSection';
import { DownloadCourseState } from '../../features/downloadSlice';
import { fetchProfile } from '../../features/user/userSlice';

interface MeProps {
  t: any;
  studyStatus: LoadStatusProps,
  historyStatus: LoadStatusProps,
  historyList: any[],
  historySum: number,
  studySum: number,
  studyList: any[],
  selectedIndex: number;
  lng: 'en' | 'zh' | 'fr';
  user: any;
  downloadList: DownloadCourseState[];
}

function MeScreen(props: MeProps): JSX.Element {
  const dispatch = useDispatch();
  const { t, lng, historyList, studyList, historySum, studySum, selectedIndex, user, studyStatus, historyStatus, downloadList } = props;

  useEffect(()=> {
    if (studyList != null || historyList != null) {
      dispatch(resetAllData());
    }
    // if (selectedIndex === 1) {
      dispatch(fetchStudy(true));
    // }
    // else {
      dispatch(fetchHistory(true));
    // }
      dispatch(fetchProfile());

  }, [lng]);

  ipcRenderer.on('result', (event, result) => {
    console.log('======s=ss====')
    console.log(result);
  });

  function isNewCourse(date: string): boolean {
    const time1 = new Date(date);
    const days = Math.floor(
      (Date.now() - time1.getTime()) / 1000 / 60 / 60 / 24
    );
    return days < 31;
  }

  function renderList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    let list = historyList;
    console.log('=====00000-=======');
    console.log(list);
    if (selectedIndex === 1) {
      list = studyList;
    }
    if (list == null) {
      elements.push(<div/>);
    }
    else if (list.length === 0) {
      elements.push(
        <div className="section-empty">
          <img alt="icon-empty" src="images/icon_course_empty.png" />
          <p className="empty-text">{t('empty_information')}</p>
        </div>
      );
    } else {
      for (
        let i = 0;
        i < list.length;
        i += 1
      ) {
        const item = list[i];
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

  function renderSectionContent() {
    return (
      <DownloadSection/>
    );
  }

  function uncompress(ZIP_FILE_PATH, DESTINATION_PATH){
    console.log(ZIP_FILE_PATH);
    console.log(DESTINATION_PATH);
    var newFile = spawn('unzip', [ '-P','5&7NgI%B^@dEk&n0oYNgKdf3XsOc6*66', '-d', DESTINATION_PATH, ZIP_FILE_PATH ]);
    console.log('====================================');
    console.log(newFile);
    console.log('====================================');
    // var DecompressZip = require('decompress-zip');
    // var unzipper = new DecompressZip(ZIP_FILE_PATH);

    // // Add the error event listener
    // unzipper.on('error', function (err) {
    //     console.log('Caught an error', err);
    // });

    // // Notify when everything is extracted
    // unzipper.on('extract', function (log) {
    //     console.log('Finished extracting', log);
    // });

    // // Notify "progress" of the decompressed files
    // unzipper.on('progress', function (fileIndex, fileCount) {
    //     console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
    // });

    // // Unzip !
    // unzipper.extract({
    //     path: DESTINATION_PATH
    // });
  }

  function renderHasMore(): JSX.Element {
    let status = historyStatus;
    if (selectedIndex === 1) {
      status = studyStatus;
    }
    if (status.hasMore && !status.loadingMore && !status.loadedFailure) {
      return (
        <div className="more-field">
          <button
            type="button"
            className="has-more-button"
            onClick={() => {
              // onRequestMore();
              if (selectedIndex === 1) {
                dispatch(fetchStudy());
              }
              else {
                dispatch(fetchHistory());
              }
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
    let status = historyStatus;
    if (selectedIndex === 1) {
      status = studyStatus;
    }
    if (status.hasMore && status.loadingMore && !status.loadedFailure) {
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
    let status = historyStatus;
    if (selectedIndex === 1) {
      status = studyStatus;
    }
    if (status.hasMore && !status.loadingMore && status.loadedFailure) {
      return (
        <div className="more-field">
          <button
            type="button"
            className="has-more-button"
            onClick={() => {
              if (selectedIndex === 1) {
                dispatch(fetchStudy());
              }
              else {
                dispatch(fetchHistory());
              }
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
    <div className="me-container">
      <div className="me-header">
        <div className="avatar-section">
          <div className="avatar-field">
            <img src={user && user.headPhoto && user.headPhoto.length > 0 ? user.headPhoto : "images/icon_me_avatar.png" } alt="avatar-image" />
          </div>
          <div className="user-outline">
            <p className="user-name"> {user ? user.name.firstName + ' ' + user.name.lastName : ''}</p>
            {
              user && user.education.approvalStatus === "CERTIFIED" ?
              <div className="school-field">
                <img src={user.education.logo} alt="school-image" />
                <p className="school-name">{user.education.name}</p>
              </div>
              :
              <div className="school-field"/>
            }
          </div>
        </div>
        <div className="sort-section">
          <div
            className={selectedIndex === 0 ? "sort-active-item" : "sort-item"}
            tabIndex={0}
            onKeyDown={() => {}}
            onClick={() => {
              dispatch(updateSelectedIndex(0));
              if (historyList == null) {
                dispatch(fetchHistory(true));
              }
            }}
          >
            <p className="num">{historySum.toString()}</p>
            <p className="title">{t('course_history')}</p>
            <div className="line"></div>
          </div>
          <div className="vertical-line"/>
          <div
            className={selectedIndex === 1 ? "sort-active-item" : "sort-item"}
            tabIndex={1}
            onKeyDown={() => {}}
            onClick={() => {
              dispatch(updateSelectedIndex(1));
              if (studyList == null) {
                dispatch(fetchStudy(true));
              }
            }}
          >
            <p className="num">{studySum.toString()}</p>
            <p className="title">{t('study_plan')}</p>
            <div className="line"></div>
          </div>
          <div className="vertical-line"/>
          <div
            className={selectedIndex === 2 ? "sort-active-item" : "sort-item"}
            tabIndex={1}
            onKeyDown={() => {}}
            onClick={() => {
              dispatch(updateSelectedIndex(2));
              if (studyList == null) {
                dispatch(fetchStudy(true));
              }
              // selectZip();
            }}
          >
            <p className="num">{downloadList.length.toString()}</p>
            <p className="title">{t('my_download')}</p>
            <div className="line"></div>
          </div>
        </div>
      </div>
      <div className="me-content">
        {
          selectedIndex == 2 ?
          renderSectionContent()
          :
          <div className="section-list">
            {renderList()}
          </div>
        }
        {selectedIndex  < 2 ? renderHasMore() : <div />}
        {selectedIndex  < 2 ? renderLoading() : <div />}
        {selectedIndex  < 2 ?  renderLoadedFailure() : <div />}
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
  return function(state: any) {
    return {
      user: state.user.user,
      historyList: state.me.historyList,
      studyList: state.me.studyList,
      studySum: state.me.studySum,
      historySum: state.me.historySum,
      studyStatus: state.me.studyStatus,
      historyStatus: state.me.historyStatus,
      selectedIndex: state.me.selectedIndex,
      downloadList: state.download.downloadList
    };
  }
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(MeScreen) as React.ComponentType;
