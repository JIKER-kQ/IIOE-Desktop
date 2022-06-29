import React, { useRef, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { useHistory } from 'react-router';
import routes from '../../constants/routes.json';
// import { deleteVideo, OfflineCourseState } from '../../features/offlineSlice';
import { ipcRenderer } from 'electron';
import { toast, ToastContainer } from 'react-toastify';
import DeletePopView from '../../components/course/DeletePopView';
import { deleteVideo, DownloadCourseState } from '../../features/downloadSlice';

interface DownloadedListScreennProps {
  downloadList: DownloadCourseState[],
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


function DownloadedListScreen(props: DownloadedListScreennProps) {
  const [selectList, setSelectList] = useState<string[]>([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const {downloadList, t} = props;
  const [deletePopview, setDeletePopview] = useState<boolean>(false);
  const deleteUrlList = useRef<string[]>([]);

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
            history.push(routes.DOWNLOADDETAIL + item.courseId);
          }}>
          <span className="course-name">{item.courseName}</span>
          <span className="course-time">{_convertTime(item.courseDuration)}</span>
        </button>
      </div>
    );
  }

  function _renderList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    // console.log('ssss==')
    // console.log(offlineList);
    // console.log(serialList(offlineList));
    for (let i = 0; i < serialList(fetchDownloadedList()).length; i++) {
      elements.push(_renderItem(serialList(fetchDownloadedList())[i], i));
    }
    return elements;
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
                  lessonDuration:  soureceList[k].lessonTime,
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
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: false,
              });
              return;
            }
            // const urlList: string[] = [];
            deleteUrlList.current = [];
            for (let i = 0; i < fetchDownloadedList().length; i++) {
              if (selectList.indexOf(fetchDownloadedList()[i].courseId) > -1) {
                deleteUrlList.current.push(fetchDownloadedList()[i].link);
              }
            }
            // for (let i = 0; i < urlList.length; i++) {
            //   const element = urlList[i];
            //   const params = {
            //     videoUrl: element
            //   }
            //   dispatch(deleteVideo(element));
            //   ipcRenderer.send("delete_course", params);
            // }
            setDeletePopview(true);
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
      {
        deletePopview ?
        <DeletePopView
          // deleteList={deleteUrlList}
          onRequestConfirm={()=> {
            setDeletePopview(false);
            setSelectList([]);
            for (let i = 0; i < deleteUrlList.current.length; i++) {
              const element = deleteUrlList.current[i];
              const params = {
                videoUrl: element,
              }
              dispatch(deleteVideo(element))
              ipcRenderer.send("delete_course", params);
            }
            deleteUrlList.current = [];
          }}
          onRquestClose={()=> {
            setDeletePopview(false);
          }}
        />
        :
        <div/>
      }
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
)(DownloadedListScreen) as React.ComponentType;
