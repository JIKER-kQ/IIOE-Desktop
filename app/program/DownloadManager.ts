import { LogManager } from './LogManager';
import { BrowserWindow, session, DownloadItem, app } from "electron";
import CourseDAO from "./CourseDAO";
import path from 'path';

interface DwonloadVideoState {
  speed: number,
  item: DownloadItem
}

class DownloadManager {
  private static _shareManager: DownloadManager;
  private _downloadList: DwonloadVideoState[] = [];
  private mainWindow: BrowserWindow | null = null;
  private deleteList: string[] = [];

  private initDownloader() {
    session.defaultSession.on('will-download', (event, item, webContents) => {
      if (this.videoIsExist(decodeURI(item.getURL()))) {
        return;
      }
      this._downloadList.push({
        speed: 0,
        item: item
      });
      var savePath = path.join(app.getAppPath(), 'download', item.getFilename());
      item.setSavePath(savePath)

      LogManager.appLog('info', '======savePath' + savePath);

      var time = Date.now();
      var prevReceiveBytes = 0;

      item.on('updated', (e, state)=> {
        const progress = item.getReceivedBytes() * 1.0 / item.getTotalBytes()
        const recevieBytes = (item.getReceivedBytes() - prevReceiveBytes) / 1024.0;
        const duration = (Date.now() - time) / 1000;
        let speeds = 0;
        if (duration > 0) {
          speeds = recevieBytes / duration;
        }
        time = Date.now();
        prevReceiveBytes = item.getReceivedBytes();

        try {
          for (let i = 0; i < this._downloadList.length; i++) {
            const element = this._downloadList[i];
            if (element.item && decodeURI(element.item.getURL() )== decodeURI(item.getURL())) {
              element.speed = speeds;
              break;
            }
          }
        } catch (error) {
          LogManager.appLog('error', 'updated error=======' + JSON.stringify(error));
        }

        if (state === 'interrupted') {
          LogManager.appLog('error', '===== updated error=======' + JSON.stringify(e));
        }

        console.log('===llllkkkkkk progress======' + progress.toFixed(3) + state);
        this.mainWindow!.webContents.send('video-progress-update', {
          url: decodeURI(item.getURL()),
          speeds,
          progress,
          totalBytes: item.getTotalBytes(),
          state: item.isPaused() ? 'paused': state
        });
        CourseDAO.updateVideo(decodeURI(item.getURL()), Math.floor(progress * 10000), item.getTotalBytes());
      });


      item.on('done', (e, state) => {
        console.log('-----=kkkkkk=====')
        const progress = item.getReceivedBytes() * 1.0 / item.getTotalBytes()
        if (state === 'completed') {
          this.mainWindow!.webContents.send('video-progress-update', {
            url: decodeURI(item.getURL()),
            speeds: 0,
            progress: 1,
            totalBytes: item.getTotalBytes(),
            state
          });
          CourseDAO.updateVideo(decodeURI(item.getURL()), Math.floor(progress * 10000), item.getTotalBytes());
        }
        else if (state === 'interrupted') {
          this.mainWindow!.webContents.send('video-progress-update', {
            url: decodeURI(item.getURL()),
            speeds: 0,
            progress,
            totalBytes: item.getTotalBytes(),
            state
          });
          LogManager.appLog('error', 'done error=======' + JSON.stringify(item));
        }
      });
    })
  }

  /**
   * download
   */
  public download(mainWindow: BrowserWindow, url: string) {
    this.mainWindow = mainWindow;
    if (this.videoIsExist(url)) {
      return;//医护列表
    }
    if (this.deleteList.indexOf(url) > -1) {
      this.deleteList.splice(this.deleteList.indexOf(url), 1);
    }
    mainWindow.webContents.downloadURL(url);
  }

  /**
   * delete video
   */
  public deleteVideo(mainWindow: BrowserWindow, url: string) {
    this.mainWindow = mainWindow;
    console.log('outside ======== downloading')
    if (this.deleteList.indexOf(url) > -1) {
      return;
    }
    this.deleteList.push(url);
    if (this.videoIsExist(url)) {
      for (let i = 0; i < this._downloadList.length; i++) {
        LogManager.appLog('info', url);
        console.log(url);
        LogManager.appLog('info','inside ======== downloading');
        console.log(decodeURI(this._downloadList[i].item.getURL()));
        LogManager.appLog('info', decodeURI(this._downloadList[i].item.getURL()));
        if (decodeURI(this._downloadList[i].item.getURL()) == url && this._downloadList[i].item.getState() != 'completed') {
          this._downloadList[i].item.cancel();
          console.log('delete======== downloading');
          LogManager.appLog('info', url + 'downloading');
          this._downloadList.splice(i, 1);
          // setTimeout(() => {
          //   var fs = require('fs');
          //   var urljoin = require('url-join');
          //   var savePath = urljoin(app.getAppPath(), 'download' , this._downloadList[i].item.getFilename());
          //   if (fs.existsSync(savePath)) {
          //     fs.unlinkSync(savePath);
          //   }
          // }, 1000);
          break;
        }
        else if (decodeURI(this._downloadList[i].item.getURL()) == url && this._downloadList[i].item.getState() == 'completed') {
          var fs = require('fs');
          var urljoin = require('url-join');
          var savePath = urljoin(app.getAppPath(), 'download', this._downloadList[i].item.getFilename());
          if (fs.existsSync(savePath)) {
            fs.unlinkSync(savePath);
          }
          LogManager.appLog('info', url + 'downloaded');
          this._downloadList.splice(i, 1);
          break;
        }
      }
    }
    else {
      LogManager.appLog('info', "videoIsnotExist=========="+ url);
      for (let i = 0; i < this._downloadList.length; i++) {
        LogManager.appLog('info', "notExist=========="+ decodeURI(this._downloadList[i].item.getURL()));
      }
      console.log("videoIsnotExist"+ url);
      if (this.getFilename(url).length > 0) {
        var urljoin = require('url-join');
        var savePath = urljoin(app.getAppPath(), 'download' , this.getFilename(url));
        var fs = require('fs');
        if (fs.existsSync(savePath)) {
          fs.unlinkSync(savePath);
        }
      }
    }

    CourseDAO.deleteVideo(url);
  }

  /**
   * pause video
   */
  public pauseVideo(mainWindow: BrowserWindow, url: string) {
    this.mainWindow = mainWindow;
    if (this.videoIsExist(url)) {
      for (let i = 0; i < this._downloadList.length; i++) {
        if (decodeURI(this._downloadList[i].item.getURL())  == url && this._downloadList[i].item.getState() != 'completed') {
          this._downloadList[i].item.pause();
          break;
        }
      }
    }
  }

  /**
   * resume course
   */
  public resumeVideo(mainWindow: BrowserWindow, url: string) {
    if (this.videoIsExist(url)) {
      for (let i = 0; i < this._downloadList.length; i++) {
        if (decodeURI(this._downloadList[i].item.getURL())  == url && this._downloadList[i].item.getState() != 'completed') {
          this._downloadList[i].item.resume();
          break;
        }
      }
    }
    else {
      this.download(mainWindow, url);
    }
  }

  /**
   * video isExist
   */
  public videoIsExist(url: string): boolean {
    var isExist = false;
    try {
      for (let i = 0; i < this._downloadList.length; i++) {
        const element = this._downloadList[i];
        if (decodeURI(element.item.getURL()) === url) {
          isExist = true;
          break;
        }
      }
    } catch (error) {
    }

    return isExist;
  }

  getFilename(url: string): string{
    if (url)
    {
        var m = url.toString().match(/.*\/(.+?)\./);
        if (m && m.length > 1)
        {
          return url.split('/').pop() ?? '';
        }
    }
    return "";
  }

  /**
   *  get downloadList
   */
  public get downloadList() {
    return this._downloadList;
  }

  /**
   * static get Instance
   */
  public static get Instance() {
    if (!this._shareManager) {
      this._shareManager = new this();
      this.Instance.initDownloader();
    }
    return this._shareManager;
  }
}

export default DownloadManager.Instance;
