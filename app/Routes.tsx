/* eslint react/jsx-props-no-spreading: off */
import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
// eslint-disable-next-line import/no-cycle
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import SliderBar from './components/SliderBar';
import CourseDetailScreen from './screens/course/CourseDetailScreen';
import CoursePlayScreen from './screens/course/CoursePlayScreen';
import VersionPopView from './containers/VersionPopView';
import CourseListScreen from './screens/course/CourseListScreen';
import MeScreen from './screens/me/MeScreen';
import VideoPlayerScreen from './screens/local/VideoPlayerScreen';
import { updateProgress, addLocalVideo } from './features/downloadSlice';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';
import { updateOnlineStatus } from './features/settingsSlice';
import OfflineScreen from './screens/offline/OfflineScreen';
import OfflineListScreen from './screens/offline/OfflineListScreen';
import OfflineDetailScreen from './screens/offline/OfflineDetailScreen';
import { addVideo } from './features/offlineSlice';
import { remote } from 'electron';
import DownloadedListScreen from './screens/offline/DownloadedListScreen';
import DownloadedDetailScreen from './screens/offline/DownloadedDetailScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import LibraryScreen from './screens/LibraryScreen';

const LazyPlaylistScreen = React.lazy(() =>
  import('./screens/local/PlayListScreen')
);

const LazyPlaylLoginScreen = React.lazy(() =>
  import('./screens/auth/LoginScreen')
);
const LoginScreen = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyPlaylLoginScreen {...props} />
  </React.Suspense>
);

const PlaylistScreen = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyPlaylistScreen {...props} />
  </React.Suspense>
);

export default function Routes() {
  const dispatch = useDispatch();

  ipcRenderer.on('video-progress-update', (event, message) => {
    // console.log(message);
    // console.log('=========lllll=============');
    dispatch(updateProgress(message['url'], message['progress'], message['speeds'], message['totalBytes'], message['state']));
  })

  ipcRenderer.on('video-add-local', (event, message) => {
    console.log(message);
    console.log('=========kkk=============');
    dispatch(addLocalVideo(message['courseID'],
    message['courseName'],
    message['chapterID'],message['chapterName'],
    message['lessonID'], message['lessonName'],
    message['link'],
    message['duration'],
    message['progress'],
    message['totalBytes'],
    message['completeTime']));
  });
  console.log('navigator.onLine ========')
  console.log(remote.getGlobal("hasNetwork"));

  ipcRenderer.on('offline-list-success', (event, message) => {
    console.log(message);
    console.log('=========kkkllll=============');
    const list = message['list'];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      dispatch(addVideo(element['courseId'], element['courseName'], element['chapterId'],
      element['chapterName'], element['lessonId'], element['lessonName'],
      element['link'], element['courseDuration'], element['chapterDuration'], element['lessonDuration']));
    }
  });

  useEffect(()=> {
    dispatch(updateOnlineStatus(remote.getGlobal("hasNetwork")));
  }, []);

  return (
    <App>
      <SliderBar />
      <div className="top-main">
        <Header />
        <Switch>
          <Route path={routes.LOCALPLAYLIST} component={PlaylistScreen} />
          {
            remote.getGlobal("hasNetwork") ?
            <Route exact path={routes.HOME} component={HomeScreen} />
            :
            <Route exact path={routes.HOME} component={OfflineScreen} />
          }

          <Route path={routes.LOGIN} component={LoginScreen} />
          <Route path={routes.ME} component={MeScreen} />
          <Route
            path={`${routes.COURSE}:courseID`}
            component={CourseDetailScreen}
          />
          <Route
            path={`${routes.COURSEVIDEO}:courseID/:chapterID`}
            component={CoursePlayScreen}
          />
          <Route
            path={`${routes.COURSELIST}:catrgoryID`}
            component={CourseListScreen}
          />
          <Route
            path={`${routes.LOCALPLAYER}:filename`}
            component={ VideoPlayerScreen }
          />
          <Route path={routes.OFFLINELIST} component={OfflineListScreen}/>
          <Route path={`${routes.OFFLINEDETAIL}:courseID`} component={OfflineDetailScreen}/>
          <Route path={routes.DOWNLOADLIST} component={DownloadedListScreen}/>
          <Route path={`${routes.DOWNLOADDETAIL}:courseID`} component={DownloadedDetailScreen}/>
          <Route
            path={`${routes.OFFLINEPLAYER}:lessonId`}
            component={ VideoPlayerScreen }
          />
          <Route path={routes.ABOUTUS} component={AboutUsScreen}/>
          <Route path={routes.LIBRARY} component={LibraryScreen}/>
        </Switch>
      </div>
      <VersionPopView />
    </App>
  );
}
