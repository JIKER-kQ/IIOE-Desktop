import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import counterReducer from './features/counter/counterSlice';
// eslint-disable-next-line import/no-cycle
import userReducer from './features/user/userSlice';
// eslint-disable-next-line import/no-cycle
import homeReducer from './features/homeSlice';
// eslint-disable-next-line import/no-cycle
import versionReducer from './features/versionSlice';
// eslint-disable-next-line import/no-cycle
import courseListSlice from './features/courseListSlice';
// eslint-disable-next-line import/no-cycle
import settingsSlice from './features/settingsSlice';
// eslint-disable-next-line import/no-cycle
import meReducer from './features/meSlice';
import downloadSlice from './features/downloadSlice';
import offlineSlice from './features/offlineSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter: counterReducer,
    user: userReducer,
    home: homeReducer,
    version: versionReducer,
    courseList: courseListSlice,
    settings: settingsSlice,
    me: meReducer,
    download: downloadSlice,
    offline: offlineSlice
  });
}
