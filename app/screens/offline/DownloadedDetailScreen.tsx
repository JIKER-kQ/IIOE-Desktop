import React from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { compose } from 'redux';
// import { OfflineCourseState } from '../../features/offlineSlice';
import routes from '../../constants/routes.json';
import { DownloadCourseState } from '../../features/downloadSlice';


interface DownloadedDetailScreenProps {
  downloadList: DownloadCourseState[]
}

interface ParamsProps {
  courseID: string;
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
  lessonDuration: number,
  link: string
}

function DownloadedDetailScreen(props:DownloadedDetailScreenProps) {
  const { courseID } = useParams<ParamsProps>();
  const { downloadList }  = props;
  const history = useHistory();

  function serialList(soureceList:DownloadCourseState[]): DownloadCourseModel[] {
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
              chapterDuration = element.lessonTime;
              courseDuration += element.lessonTime;
              lessonList.push(
                {
                  lessonName: soureceList[k].lessonName,
                  lessonId: soureceList[k].lessonId,
                  lessonDuration: soureceList[k].lessonTime,
                  link: soureceList[k].link
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

  function fetchDownloadedList(): DownloadCourseState[] {
    const sourceList: DownloadCourseState[] = [];
    for (let i = 0; i < downloadList.length; i++) {
      if (downloadList[i].status == 'completed') {
        sourceList.push(downloadList[i]);
      }
    }
    return sourceList;
  }

  function _renderList() {
    const list = serialList(fetchDownloadedList());
    const elements: JSX.Element[] = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (element.courseId == courseID) {
        const chapterList = element.chapterList;
        for (let j = 0; j < chapterList.length; j++) {
          elements.push(_renderChapterItem(chapterList[j]));
        }
        break;
      }
    }
    return elements;
  }

  function _renderChapterItem(item: DownloadChapterModel) {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < item.lessonList.length; i++) {
      const element = item.lessonList[i];
      elements.push(
        _renderVideoItem(element)
      );
    }
    return (
      <div className="chapter-item">
        <div className="chapter-item-name">
          <span>{item.chapterName}</span>
        </div>
        <div className="lesson-list">
          {elements}
        </div>
      </div>
    )
  }

  function _renderVideoItem(item:DownloadLessonModel) {
    return (
      <button
        className="video-item"
        onClick={()=> {
          history.push(routes.LOCALPLAYER + getFilename(item.link));
          // history.push(routes.OFFLINEPLAYER + item.lessonId);
        }}>
        <img alt="con-button-play" src="images/icon_lesson_play.png" />
        <span className="lesson-name">{item.lessonName}</span>
        <span className="lesson-time"> {convertDuration(item.lessonDuration)}</span>
      </button>
    );
  }

  function getFilename(url){
    if (url)
    {
        var m = url.toString().match(/.*\/(.+?)\./);
        if (m && m.length > 1)
        {
          return url.split('/').pop();
        }
    }
    return "";
  }

  function convertDuration(time:number) {
    var minute = Math.floor(time / 60);
    var seconds = time % 60;
    return minute.toString() + "'" + seconds.toString() + '"';
  }

  return (
    <div className="offline-detail-container">
      {_renderList()}
    </div>
  )
}

function makeMapStateToProps() {
  return function(state: any) {
    return {
      downloadList: state.download.downloadList
    };
  }
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(DownloadedDetailScreen) as React.ComponentType;
