import { LogManager } from './LogManager';
import OfflineDAO from "./OfflineDAO";
import { BrowserWindow, app } from 'electron';

class OfflineManager {
  private static _shareManager: OfflineManager;

  /**
   * read Json
   */
  public readJson(mainWindow: BrowserWindow, path: String):void {
    const fs = require('fs');
    // console.log(path);
    // console.log('read json===============')
    if (fs.existsSync(path)) {
      const map = JSON.parse(fs.readFileSync(path));
      const courseName = map['name'];
      const courseId =  map['id'];
      const courseDuration = map['duration'];
      const list: any[] = [];
      for (let i = 0; i < map['directories'].length; i++) {
        const element =  map['directories'][i];
        const chapterName = element['name'];
        const chapterId = element['id'];
        const chapterDuration = element['duration'];
        for (let j = 0; j < element['lessons'].length; j++) {
          const video = element['lessons'][j];
          const lessonId = video['id'];
          const lessonName = video['name'];
          const link = video['videoAddress'];
          const lessonDuration = video['duration'];
          LogManager.appLog('info', JSON.stringify(video));
          OfflineDAO.insertVideo(mainWindow, courseId, chapterId, lessonId,
          link, courseName, chapterName, lessonName, courseDuration, chapterDuration,
          lessonDuration, i === map['directories'].length - 1 && j === element['lessons'].length - 1);
          list.push({
            courseId,
            chapterId,
            lessonId,
            courseName,
            chapterName,
            lessonName,
            courseDuration,
            chapterDuration,
            lessonDuration,
            link
          });
        }
      }
      mainWindow!.webContents.send('offline-import-course', {
        list: list
      });
      LogManager.appLog('info', JSON.stringify(list));

      fs.unlinkSync(path);
    }
  }

  /**
   * deleteVideoByCourse
   */
  public deleteVideo(mainWindow: BrowserWindow, lessonID: string) {
    setTimeout(() => {
      var fs = require('fs');
      var urljoin = require('url-join');
      var savePath = urljoin(app.getAppPath(), 'offline', lessonID + '.mp4');
      if (fs.existsSync(savePath)) {
        fs.unlinkSync(savePath);
      }
    }, 500);
    OfflineDAO.deleteVideo(lessonID);
  }


  /**
   * static get Instance
   */
  public static get Instance() {
    if (!this._shareManager) {
      this._shareManager = new this();
      // this.Instance.initDownloader();
    }
    return this._shareManager;
  }
}

export default OfflineManager.Instance;
