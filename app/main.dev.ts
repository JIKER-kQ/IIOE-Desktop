import { LogManager } from './program/LogManager';
import Seven from 'node-7z';
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import config from './configs/app.config';
import CourseDAO from './program/CourseDAO';
import OfflineDAO from './program/OfflineDAO';

const i18n = require('./configs/i18next.config').default;
const {download} = require('electron-dl');

var knex = require("knex")({
	client: "sqlite3",
	connection: {
		filename: path.join(__dirname, 'database.sqlite')
	}
});

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

process.on('uncaughtException', function (error) {
  // Handle the error
  LogManager.appLog('error', 'exit==================' + JSON.stringify(error));
  if (error.hasOwnProperty('errno') || error.hasOwnProperty('code')) {
    LogManager.appLog('error', 'crash exit==================' + JSON.stringify(error));
    app.exit(1);
  }

});

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  splashWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  splashWindow.loadURL(`file://${__dirname}/SplashScreen.html`);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            webSecurity: false,
            nodeIntegration: true,
            allowRunningInsecureContent: true,
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
            webSecurity: false,
            nodeIntegration: true,
            allowRunningInsecureContent: true,
          },
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    setTimeout(() => {
      splashWindow?.destroy();
    }, 2000);

    setTimeout(() => {
      CourseDAO.queryAll(mainWindow!);
      OfflineDAO.queryAll(mainWindow!);
    }, 1000);
    // mainWindow.webContents.openDevTools();
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  LogManager.appLog('info', '======start');
  LogManager.appLog('error', '======start');


  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  i18n.on('loaded', (loaded: any) => {
    mainWindow?.webContents
      .executeJavaScript('localStorage.getItem("lang");', true)
      .then((lang) => {
        console.log('======s=x=====' + lang);
        i18n.changeLanguage(lang || 'en');
        i18n.off('loaded', () => {});
      });
  });

  i18n.on('languageChanged', (lng: any) => {
    // menuFactoryService.buildMenu(app, win, i18n);
    console.log('========sss=====sss=');

    console.log(i18n.default.getResourceBundle('zh', 'translation'));
    if (mainWindow) {
      console.log('========sss=====sss=lll');
      mainWindow.webContents.send('language-changed', {
        language: lng,
        namespace: config.namespace,
        resource: i18n.default.getResourceBundle(lng, config.namespace),
      });
    }
  });

  ipcMain.on('splash-load-success', (event, message) => {
    mainWindow!.loadURL(`file://${__dirname}/app.html`);
  });

  ipcMain.on('insert_course', (event, message) => {
    const DownloadManager  = require('./program/DownloadManager').default;

    CourseDAO.insertVideo(message['cover'], message['courseID'],
      message['chapterID'], message['lessonID'],
      message['videoUrl'], message['courseName'],
      message['chapterName'], message['lessonName'],
      message['duration'], message['now'],
      message['sort']);
    DownloadManager.download(mainWindow!, message['videoUrl']);
  });

  ipcMain.on('delete_course', (event, message) => {
    const DownloadManager  = require('./program/DownloadManager').default;
    // console.log('sssss====');
    // console.log(message);
    DownloadManager.deleteVideo(mainWindow!, message['videoUrl']);
  });

  ipcMain.on('pause_course', (event, message) => {
    const DownloadManager  = require('./program/DownloadManager').default;
    DownloadManager.pauseVideo(mainWindow!, message['videoUrl']);
  });

  ipcMain.on('resume_course', (event, message) => {
    const DownloadManager  = require('./program/DownloadManager').default;
    DownloadManager.resumeVideo(mainWindow!, message['videoUrl']);
  });

  ipcMain.on('offline-sync-insert', (event, message) => {
    console.log(message);
    LogManager.appLog('info', JSON.stringify(message));
    const OfflineManager  = require('./program/OfflineManager').default;
    OfflineManager.readJson(mainWindow, message['url']);
  });

  ipcMain.on('delete_offline_course', (event, message) => {
    const OfflineManager  = require('./program/OfflineManager').default;
    OfflineManager.deleteVideo(mainWindow, message['lessonId']);
  });

  ipcMain.on('download-file', async (event, url) => {
    console.log('ssss====sss');
    const win = BrowserWindow.getFocusedWindow();
    console.log(await download(win, url, {"saveAs": true, "openFolderWhenDone": true}));
 });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindow);
} else {
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

require('dns').resolve('www.apple.com', function(err) {
  if (err) {
    global.hasNetwork = false;
    console.log("No connection");
  } else {
    global.hasNetwork = true;
    console.log("Connected");
  }
});

// const zh = i18n.getResourceBundle('zh', config.namespace);
// const en = i18n.getResourceBundle('en', config.namespace);
// const zh = null;
// const en = null;

ipcMain.on('get-initial-translations', (event, arg) => {
  i18n.loadLanguages(['zh', 'en', 'fr'], (err, t) => {
    console.log('=======start');
    console.log(i18n);
    const initial = {
      zh: {
        translation: i18n.default.getResourceBundle('zh', config.namespace),
      },
      en: {
        translation: i18n.default.getResourceBundle('en', config.namespace),
      },
      fr: {
        translation: i18n.default.getResourceBundle('fr', config.namespace),
      },
    };
    console.log(initial);
    event.returnValue = initial;
  });
});
