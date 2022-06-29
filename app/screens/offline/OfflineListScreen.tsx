import React, { useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { useHistory } from 'react-router';
import routes from '../../constants/routes.json';
import { deleteVideo, OfflineCourseState } from '../../features/offlineSlice';
import { ipcRenderer } from 'electron';
import { toast, ToastContainer } from 'react-toastify';

interface OfflineDetailScreenProps {
  offlineList: OfflineCourseState[],
  t: any
}

interface DownloadCourseModel {
  courseName: string,
  courseId: string,
  courseDuration: number,
  chapterList: DownloadChapterModel[]
}

interface DownloadChapterModel {
  chapterId: string,
  chapterName: string,
  chapterDuration: number,
  lessonList: DownloadLessonModel[]
}

interface DownloadLessonModel {
  lessonName: string,
  lessonId: string,
  lessonDuration: number
}


function OfflineListScreen(props: OfflineDetailScreenProps) {
  const [selectList, setSelectList] = useState<string[]>([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const {offlineList, t} = props;

  function _renderItem(item: DownloadCourseModel, index: number):JSX.Element {
    return (
      <div className="offline-item" tabIndex={index}>
        <button
          className="button-select"
          onClick={() => {
            const list = selectList;
            if (list.indexOf(item.courseId) > -1) {
              list.splice(list.indexOf(item.courseId) , 1)
            }
            else {
              list.push(item.courseId)
            }
            setSelectList(JSON.parse(JSON.stringify(list)));
          }}
        >
          {
            selectList.indexOf(item.courseId) > -1 ?
            <img src="images/icon_video_selected.png" alt="select" />
            :
            <img src="images/icon_select.png" alt="select" />
          }

        </button>
        <button
          className="offline-item-main"
          onClick={()=> {
            history.push(routes.OFFLINEDETAIL + item.courseId);
          }}>
          <span className="course-name">{item.courseName}</span>
          <span className="course-time">{_convertTime(item.courseDuration)}</span>
        </button>
      </div>
    );
  }

  function _renderList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    console.log('ssss==')
    console.log(offlineList);
    console.log(serialList(offlineList));
    for (let i = 0; i < serialList(offlineList).length; i++) {
      elements.push(_renderItem(serialList(offlineList)[i], i));
    }
    return elements;
  }

  function serialList(soureceList:OfflineCourseState[]): DownloadCourseModel[] {
    const courseIdList: string[] = [];
    const chapterIdList: string[] = [];
    const secondList: any[] = [];
    const list: DownloadCourseModel[] = [];
    for (let i = 0; i < soureceList.length; i++) {
      const element = soureceList[i];
      if (courseIdList.indexOf(element.courseId) == -1) {
        courseIdList.push(element.courseId);
      }
      if (chapterIdList.indexOf(element.chapterId) == -1) {
        chapterIdList.push(element.chapterId);
        secondList.push({
          'courseId': element.courseId,
          'chapterId': element.chapterId
        })
      }
    }

    for (let i = 0; i < courseIdList.length; i++) {
      const chapterList: DownloadChapterModel[] = [];
      let courseName = '';
      let courseDuration = 0;
      for (let j = 0; j < secondList.length; j++) {
        let chapterName = '';
        let chapterDuration = 0;
        const lessonList: DownloadLessonModel[] = [];
        if (secondList[j].courseId == courseIdList[i]) {
          for (let k = 0; k < soureceList.length; k++) {
            const element = soureceList[k];
            if (element.courseId == courseIdList[i] && element.chapterId == chapterIdList[j]) {
              courseName = element.courseName;
              chapterName = element.chapterName;
              chapterDuration = element.chapterDuration;
              courseDuration = element.courseDuration;
              lessonList.push(
                {
                  lessonName: soureceList[k].lessonName,
                  lessonId: soureceList[k].lessonId,
                  lessonDuration:  soureceList[k].lessonDuration,
                }
              )
            }
          }
          chapterList.push(
            {
              chapterName: chapterName,
              chapterId : chapterIdList[j],
              lessonList: lessonList,
              chapterDuration: chapterDuration
            }
          )
        }
      }

      const course: DownloadCourseModel = {
        courseName: courseName,
        courseId: courseIdList[i],
        chapterList: chapterList,
        courseDuration: courseDuration
      }
      list.push(course);
    }
    return list;
  }

  function _convertTime(time: number) {
    var hour = Math.floor(time / 60 / 60);
    var minute =  Math.floor(time / 60) % 60;
    var seconds = time % 60;
    return (hour < 10 ? '0' + hour.toString() : hour.toString()) + ':' + (minute < 10 ? '0' + minute.toString() : minute.toString()) + ':' + (seconds < 10 ? '0' + seconds.toString() : seconds.toString())
  }

  return (
    <div className="offline-list-container">
      <div className="offline-list-header">
        <button
          className="btn_delete"
          onClick={() => {
            if (selectList.length === 0) {
              toast(t('select_videos'),  {
                position: "bottom-center",
                autoClose: 1500,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: false,
              });
              return;
            }
            const lessonIdList: string[] = [];
            for (let i = 0; i < offlineList.length; i++) {
              if (selectList.indexOf(offlineList[i].courseId) > -1) {
                lessonIdList.push(offlineList[i].lessonId);
              }
            }
            for (let i = 0; i < lessonIdList.length; i++) {
              const element = lessonIdList[i];
              const params = {
                lessonId: element
              }
              dispatch(deleteVideo(element));
              ipcRenderer.send("delete_offline_course", params);
            }
          }}
        >
          <img src="images/icon_tab_delete.png" alt="btn_all_pause" />
          <span>{t('delete')}</span>
        </button>
      </div>
      <div className="offline-list-section">
        <div className="offline-list-section-header">{t('home')}</div>
        <div className="offline-list-field">
          {_renderList()}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}


function makeMapStateToProps() {
  return function(state: any) {
    return {
      offlineList: state.offline.offlineList,
    };
  }
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(OfflineListScreen) as React.ComponentType;
