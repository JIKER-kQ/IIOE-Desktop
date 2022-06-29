import React, { useRef, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { ipcRenderer } from 'electron';
import ImportPopView from '../../components/course/ImportPopView';
import { addVideo, OfflineCourseState } from '../../features/offlineSlice';
import { DownloadCourseState } from '../../features/downloadSlice';
import { useHistory } from 'react-router';
import routes from '../../constants/routes.json';
import Seven from 'node-7z'
import sevenBin from '7zip-bin'

interface OfflineScreenProps {
  offlineList: OfflineCourseState[],
  downloadList: DownloadCourseState[],
  t: any
}

function OfflineScreen(props: OfflineScreenProps): JSX.Element {
  const intervalRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();
  const history = useHistory();
  const {offlineList, downloadList, t} = props;

  ipcRenderer.on('offline-insert-success', (event, message) => {
    console.log(message);
    console.log('=========kkkkk====== insert-success =======');

    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(100);
  })

  ipcRenderer.on('offline-import-course', (event, message) => {
    console.log(message);
    console.log('=========kkkkk====== import-success =======');
    const list = message['list'];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (!videoIsExist(element['lessonId'])) {
        dispatch(addVideo(element['courseId'], element['courseName'], element['chapterId'],
        element['chapterName'], element['lessonId'], element['lessonName'],
        element['link'], element['courseDuration'], element['chapterDuration'], element['lessonDuration']));
      }
      else {
        console.log('repeat...........');
      }
    }
  })

  function videoIsExist(leesonId: string) {
    let isExist = false;
    for (let i = 0; i < offlineList.length; i++) {
      const element = offlineList[i];
      if (element.lessonId === leesonId) {
        isExist = true;
        break;
      }
    }
    return isExist;
  }


  function random(high,low) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
  }

  function startTimer() {
    // let result = progress + 1;
    setProgress(progress => progress + 1);
    intervalRef.current = setInterval(()=> {
      console.log('-----sss===');
      setProgress((progress)=> {
        const result = progress + random(1, 3);
        if (result > 97) {
          console.log('ssss work=====')
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return result;
      });
      // console.log(increase);

    }, 1000);
  }

  function selectZip() {
    const app = require('electron').remote;
    var dialog = app.dialog;
    const path = require ('path');

    dialog.showOpenDialog({
      filters: [{name: '.ZIP Files', extensions: ['zip']}],
    }).then((fileNames) => {
      if (fileNames.filePaths.length > 0) {
        console.log(fileNames);
        console.log(fileNames.filePaths[0]);
        startTimer();
        const app = require('electron').remote.app;
        uncompress(fileNames.filePaths[0], path.join(app.getAppPath(), 'offline'));
      }
    });
  }

  function uncompress(ZIP_FILE_PATH, DESTINATION_PATH){
    console.log(ZIP_FILE_PATH);
    console.log(DESTINATION_PATH);
    const app = require('electron').remote;
      const path = require ('path');
    // ipcRenderer.send("offline-sync-insert", {
    //   'url': path.join(app.app.getAppPath(), 'offline", "course.json'),
    //   'from': ZIP_FILE_PATH,
    //   'to': DESTINATION_PATH
    // });
    // var child = spawn('unzip', ['-P','5&7NgI%B^@dEk&n0oYNgKdf3XsOc6*66', '-d', DESTINATION_PATH, '-o', ZIP_FILE_PATH ]);
    // const pathTo7zip = '/usr/local/bin/7z';
    const child = Seven.extractFull(ZIP_FILE_PATH, DESTINATION_PATH, {
      password: '5&7NgI%B^@dEk&n0oYNgKdf3XsOc6*66',
      overwrite: 'a',
      $bin: path.join(app.app.getAppPath(), sevenBin.path7za)
    })
    console.log(path.join(app.app.getAppPath(), sevenBin.path7za));
    console.log('====================================');
    // console.log('====================================');
    // // child.on('close', (code) => {
    // //   const app = require('electron').remote;
    // //   const path = require ('path');
    // //   ipcRenderer.send("offline-sync-insert", {'url': path.join(app.app.getAppPath(), 'offline/course.json')});
    // //   console.log('==========close===========');
    // //   console.log('ssssss');
    // // });
    child.on('error', (error) => {
      console.error(`ps stderr: ${error}`);
      console.log(error);
    });
    child.on('end', (code) => {
      var urljoin = require('url-join');
      ipcRenderer.send("offline-sync-insert", {'url': urljoin(DESTINATION_PATH, 'course.json')});
      console.log('==========exit===========');
      console.log('ssssss----------');
    });
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

  return (
    <div className="offline-container">
      <img className="offline-image" src="images/image_offline_cover.png" alt="image_offline_cover" />
      <button
        className="import-button"
        onClick={()=> {
          selectZip()
        }}>{t('import_course')}</button>
      <p className="import-text">{t('import_hint')}</p>
      <div className="handle-section">
        {
          offlineList.length > 0 ?
          <button className="imported-list-button" onClick={()=> {history.push(routes.OFFLINELIST);}}>{t('imported_list')}</button>
          :
          <div/>
        }
        {
          fetchDownloadedList().length > 0 ?
          <button className="downloaded-list-button" onClick={()=> {history.push(routes.DOWNLOADLIST);}}>{t('downloaded_list')}</button>
          :
          <div/>
        }
      </div>

      {
        progress > 0 ?
        <ImportPopView
        progress={progress}
        onRquestClose={()=> {
          setProgress(0);
          history.push(routes.OFFLINELIST);
        }}
        />
        :
        <div/>
      }
    </div>
  )
}

function makeMapStateToProps() {
  return function (state: any) {
    return {
      offlineList: state.offline.offlineList,
      downloadList: state.download.downloadList
    };
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(OfflineScreen) as React.ComponentType;
