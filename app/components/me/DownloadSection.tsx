import React, { useRef, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { useHistory } from 'react-router';
import routes from '../../constants/routes.json';
import { deleteVideo, DownloadCourseState } from '../../features/downloadSlice';
import { ipcRenderer } from 'electron';
import { ToastContainer, toast } from 'react-toastify';
import DeletePopView from '../course/DeletePopView';
import { CourseApi } from '../../api/CourseApi';

interface DownloadSectionProps {
  downloadList: DownloadCourseState[];
  t: any;
}

interface DownloadCourseModel {
  courseName: string,
  courseId: string,
  chapterList: DownloadChapterModel[]
}

interface DownloadChapterModel {
  chapterId: string,
  chapterName: string,
  lessonList: DownloadLessonModel[]
}

interface DownloadLessonModel {
  lessonName: string,
  lessonId: string,
  completeTime: number,
  speed: number,
  totalBytes: number,
  lessonTime: number,
  status: 'waiting' | 'progressing' | 'completed' | 'interrupted' | 'paused',
  progress: number,
  link: string
}

function DownloadSection(props: DownloadSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const history = useHistory();
  const dispatch = useDispatch();
  const { downloadList, t } = props;

  const [downloadingSelectedList, setDownloadingSelectedList] = useState<string[]>([]);
  const [downloadedSelectedList, setDownloadedSelectedList] = useState<string[]>([]);
  const [deletePopview, setDeletePopview] = useState<boolean>(false);

  const deleteUrlList = useRef<string[]>([]);

  function fetchDownloadingList(): DownloadCourseModel[] {
    const sourceList: DownloadCourseState[] = [];
    for (let i = 0; i < downloadList.length; i++) {
      if (downloadList[i].status != 'completed') {
        sourceList.push(downloadList[i]);
      }

    }
    return serialList(sourceList);
  }

  function fetchDownloadedList(): DownloadCourseModel[] {
    const sourceList: DownloadCourseState[] = [];
    for (let i = 0; i < downloadList.length; i++) {
      if (downloadList[i].status == 'completed') {
        sourceList.push(downloadList[i]);
      }

    }
    return serialList(sourceList);
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
    console.log(soureceList);

    for (let i = 0; i < courseIdList.length; i++) {
      const chapterList: DownloadChapterModel[] = [];
      let courseName = '';
      for (let j = 0; j < secondList.length; j++) {
        let chapterName = '';
        const lessonList: DownloadLessonModel[] = [];
        if (secondList[j].courseId == courseIdList[i]) {
          for (let k = 0; k < soureceList.length; k++) {
            const element = soureceList[k];
            if (element.courseId == courseIdList[i] && element.chapterId == chapterIdList[j]) {
              courseName = element.courseName;
              chapterName = element.chapterName;
              lessonList.push(
                {
                  lessonName: soureceList[k].lessonName,
                  lessonId: soureceList[k].lessonId,
                  speed: soureceList[k].speed,
                  totalBytes: soureceList[k].totalBytes,
                  lessonTime: soureceList[k].lessonTime,
                  status: soureceList[k].status,
                  completeTime: soureceList[k].completeTime,
                  progress: soureceList[k].progress,
                  link: soureceList[k].link
                }
              )
            }
          }
          chapterList.push(
            {
              chapterName: chapterName,
              chapterId : chapterIdList[j],
              lessonList: lessonList
            }
          )
        }
      }

      const course: DownloadCourseModel = {
        courseName: courseName,
        courseId: courseIdList[i],
        chapterList: chapterList
      }
      list.push(course);
    }
    console.log('======ddsada======');
    return list;
  }

  function renderButtonField(index: number) {
    const list = [t("downloaded_videos"), t('downloading_videos')];
    return (
      <button
        onClick={() => {
          if (index != selectedIndex) {
            setSelectedIndex(index);
          }
        }}>
        <span className={index == selectedIndex ? "active" : ""} >{list[index]}</span>
        <em className={index == selectedIndex ? "active" : ""}></em>
      </button>
    );
  }

  function _rendeDownloadedField() {
    const list = fetchDownloadedList();
    const elements: JSX.Element[] = [];
    for (let i = 0; i < list.length; i++) {
      elements.push(
        _renderCourseItem(list[i])
      );
    }
    return (
      <div className="downloaded-field">
        <div className="downloaded-header">
          <button
            className="btn_all"
            onClick={() => {
              if (downloadedSelectedList.length == downloadList.length) {
                setDownloadedSelectedList([]);
              }
              else {
                const list: string[] = [];
                for (let i = 0; i < downloadList.length; i++) {
                  list.push(downloadList[i].link);
                }
                setDownloadedSelectedList(list);
              }
            }}
          >
            <img src="images/icon_all_select.png" alt="btn_all_start" />
            <span>{t('select_all')}</span>
          </button>
          <button
            className="btn_delete"
            onClick={() => {
              if (downloadedSelectedList.length === 0) {
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
              deleteUrlList.current = [];
              for (let i = 0; i < downloadList.length; i++) {
                const element = downloadList[i];
                if (downloadedSelectedList.indexOf(element.link) > -1) {
                  deleteUrlList.current.push(element.link);
                }
              }
              setDeletePopview(true);
            }}
          >
            <img src="images/icon_tab_delete.png" alt="btn_all_pause" />
            <span>{t('delete')}</span>
          </button>
        </div>
        <div className="download-main">
          <p className="main-header">{t('home')}</p>
          <div className="course-list">
            {elements}
          </div>
        </div>
      </div>
    );
  }

  function _renderDowloadingField() {
    const list = fetchDownloadingList();
    const elements: JSX.Element[] = [];
    for (let i = 0; i < list.length; i++) {
      elements.push(
        _renderCourseItem(list[i])
      );
    }
    return (
      <div className="downloading-field">
        <div className="downloading-header">
          <button
            className="btn_all"
            onClick={() => {
              if (downloadingSelectedList.length === 0) {
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
              for (let i = 0; i < downloadList.length; i++) {
                const element = downloadList[i];
                if (downloadingSelectedList.indexOf(element.link) > -1 && element.status === 'paused') {
                  const params = {
                    videoUrl: element.link,
                  }
                  ipcRenderer.send("resume_course", params);
                }
              }
            }}
          >
            <img src="images/icon_start.png" alt="btn_all_start" />
            <span>{t('all_start')}</span>
          </button>
          <button
            className="btn_all"
            onClick={() => {
              if (downloadingSelectedList.length === 0) {
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
              for (let i = 0; i < downloadList.length; i++) {
                const element = downloadList[i];
                if (downloadingSelectedList.indexOf(element.link) > -1 && element.status === 'progressing') {
                  const params = {
                    videoUrl: element.link,
                  }
                  ipcRenderer.send("pause_course", params);
                }
              }
            }}
          >
            <img src="images/icon_pause.png" alt="btn_all_pause" />
            <span>{t('all_pause')}</span>
          </button>
          <button
            className="btn_all"
            onClick={() => {
              if (downloadingSelectedList.length === 0) {
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
              for (let i = 0; i < downloadList.length; i++) {
                const element = downloadList[i];
                if (downloadingSelectedList.indexOf(element.link) > -1) {
                  deleteUrlList.current.push(element.link);
                  // const params = {
                  //   videoUrl: element.link,
                  // }
                  // dispatch(deleteVideo(element.link))
                  // ipcRenderer.send("delete_course", params);
                }
              }
              setDeletePopview(true);
            }}
          >
            <img src="images/icon_clear.png" alt="btn_all_clear" />
            <span>{t('delete')}</span>
          </button>
        </div>
        <div className="download-main">
          <p className="main-header">{t('home')}</p>
          <div className="course-list">
            {elements}
          </div>
        </div>
      </div>
    );
  }

  function _renderCourseItem(item: DownloadCourseModel) {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < item.chapterList.length; i++) {
      const element = item.chapterList[i];
      elements.push(
        _renderChapterItem(element, item.courseId)
      )
    }
    return (
      <div className="course-item">
        <p className="course-name">{item.courseName}</p>
        <div className="chapter-list">
          {elements}
        </div>
      </div>
    );
  }

  function _renderChapterItem(item: DownloadChapterModel, courseID: string) {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < item.lessonList.length; i++) {
      const element = item.lessonList[i];
      elements.push(
        _renderVideoItem(element, courseID)
      )
    }
    return (
      <div className="chapter-item">
        <div className="chapter-name">{item.chapterName}</div>
        <div className="video-list">
          {elements}
        </div>
      </div>
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

  function renderProgressText(item: DownloadLessonModel):JSX.Element {
    let progress = (item.progress * 100).toFixed(2) + '%';
    let speedTxt = item.speed.toFixed(2) + 'KB/S';
    if (item.speed > 1024) {
      speedTxt = (item.speed / 1024).toFixed(1) + 'M/S'
    }
    else if (item.speed > 100) {
      speedTxt = item.speed.toFixed(0) + 'KB/S';
    }

    if (item.status == 'progressing') {
      return (
        <div className="progress">
          <div className="progress-bar">
            <div className="progress-bar-value" style={{width: progress}}/>
          </div>
          <em>{speedTxt}</em>
      </div>
      )
    }
    else if (item.status == 'paused') {
      return (
        <div className="progress">
          <span>{t('download_paused')}</span>
        </div>
      )
    }
    else if (item.status == 'interrupted') {
      return (
        <div className="progress">
          <span>{t('download_failed')}</span>
        </div>
      )
    }
    else {
      return (
        <div className="progress">
          <span>{t('download_waiting')}</span>
        </div>
      )
    }
  }

  function _renderVideoItem(item: DownloadLessonModel, courseID: string) {
    const completeTime = Math.floor(item.completeTime);
    var date = new Date(completeTime * 1000);
    var hours = date.getHours()  < 0 ? '0' +  date.getHours(): date.getHours().toString();
    // Minutes part from the timestamp
    var minutes =  date.getMinutes() < 0 ? '0' +  date.getMinutes(): date.getMinutes().toString();

    var month = (date.getMonth() + 1).toString();

    var year = date.getFullYear() + '';

    var day = date.getDay() + ''; ;

    if (item.status != 'completed') {
      return (
        <div className="video-item">
          <button
            className="button-select"
            onClick={() => {
              const list = downloadingSelectedList;
              if (list.indexOf(item.link) > -1) {
                list.splice(list.indexOf(item.link) , 1)
              }
              else {
                list.push(item.link)
              }
              setDownloadingSelectedList(JSON.parse(JSON.stringify(list)));
            }}
          >
            {
              downloadingSelectedList.indexOf(item.link) > -1 ?
              <img src="images/icon_video_selected.png" alt="select" />
              :
              <img src="images/icon_select.png" alt="select" />
            }

          </button>
          <div className="item-main">
            <div className="wrapper-left">
              <button
                className="video-selected"
                onClick={()=> {
                }}
              >
                <img src="images/icon_lesson_play.png" alt="video" />
              </button>
              <div className="video-name">{item.lessonName}</div>
              <div className="duration">{convertDuration(item.lessonTime)}</div>
            </div>
            {renderProgressText(item)}
            <div className="operation">
              {
                item.status === 'progressing' ?
                <button
                className="btn_control"
                onClick={() => {
                  const params = {
                    videoUrl: item.link,
                  }
                  ipcRenderer.send("pause_course", params);
                }}>
                  <img src="images/icon_download_pause.png" alt="icon_play_control" />
                </button>
                :
                <button
                className="btn_control"
                onClick={() => {
                  if (item.status === 'paused' || item.status === 'interrupted') {
                    const params = {
                      videoUrl: item.link,
                    }
                    console.log(params);
                    ipcRenderer.send("resume_course", params);
                  }
                }}>
                  <img src="images/icon_download_start.png" alt="icon_play_control" />
                </button>
              }
              <button
                className="btn_delete"
                onClick={()=> {
                  deleteUrlList.current = [];
                  deleteUrlList.current.push(item.link);
                  // const params = {
                  //   videoUrl: item.link,
                  // }
                  // ipcRenderer.send("delete_course", params);
                  // console.log(item.link)
                  // console.log('dadadada===');
                  // dispatch(deleteVideo(item.link))
                  setDeletePopview(true);

                }}>
                <img src="images/icon_download_delete.png" alt="icon_video_delete" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="video-item">
        <button
          className="button-select"
          onClick={()=> {
            const list = downloadedSelectedList;
            console.log(list);
            console.log('=======sss===');
            if (list.indexOf(item.link) > -1) {
              list.splice(list.indexOf(item.link) , 1)
            }
            else {
              list.push(item.link)
            }
            setDownloadedSelectedList(JSON.parse(JSON.stringify(list)));
          }}
        >
          {
              downloadedSelectedList.indexOf(item.link) > -1 ?
              <img src="images/icon_video_selected.png" alt="select" />
              :
              <img src="images/icon_select.png" alt="select" />
            }
        </button>
        <div className="item-main">
          <div className="wrapper-left">
            <button
              className="video-selected"
              onClick={()=> {
                CourseApi.courseAddHistory(courseID, item.lessonId);
                history.push(routes.LOCALPLAYER + getFilename(item.link));
              }}
            >
              <img src="images/icon_lesson_play.png" alt="video" />
            </button>
            <div className="video-name">{item.lessonName}</div>
            <div className="duration">{convertDuration(item.lessonTime)}</div>
          </div>
          <div className="size">{(item.totalBytes / 1024 / 1024).toFixed(1) + 'M'}</div>
          <div className="time">{year + '-' + month + '-'+ day + ' ' + hours + ':' + minutes}</div>
        </div>
      </div>
    );
  }


  return (
    <div className="download-section">
      <div className="download-header">
       { renderButtonField(0) }
       { renderButtonField(1) }
      </div>
      <div className="download-content">
        {selectedIndex === 0? _rendeDownloadedField(): _renderDowloadingField()}
      </div>
      <ToastContainer />
      {
        deletePopview ?
        <DeletePopView
          onRequestConfirm={()=> {
            setDeletePopview(false);
            var isDownloadingList = false;
            var isDownloadedList = false;
            for (let i = 0; i < deleteUrlList.current.length; i++) {
              const element = deleteUrlList.current[i];
              if (downloadingSelectedList.indexOf(element) > -1) {
                isDownloadingList = true;
              }
              if (downloadedSelectedList.indexOf(element) > -1) {
                isDownloadedList = true;
              }
            }

            if (isDownloadingList) {
              setDownloadingSelectedList([]);
            }
            if (isDownloadedList) {
              setDownloadedSelectedList([]);
            }

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
  );
}

function makeMapStateToProps() {
  return function(state: any) {
    return {
      user: state.user.user,
      downloadList: state.download.downloadList
    };
  }
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(DownloadSection) as React.ComponentType;
