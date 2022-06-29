import { LogManager } from './LogManager';
import path from 'path';
import { Knex, knex } from "knex";
import { BrowserWindow } from 'electron';

class OfflineDAO {
  private static _shareConfig: OfflineDAO;
  private database: Knex | null = null;

  private initDB() {
    const { app } = require('electron');
    this.database = knex({
      client: "sqlite3",
      connection: {
        filename: path.join(app.getAppPath(), 'offline.sqlite')
      },
      useNullAsDefault: true
    });
  }

  public queryAll(mainWindow: BrowserWindow) {
    let result = this.database!.from("video")

    result.then(function(rows){
      console.log('--------======kk----')
      mainWindow!.webContents.send('offline-list-success', {list: rows});
		})
  }

  public deleteVideo(lessonId: String) {
    console.log(lessonId);
    this.database!('video').where({ lessonId:lessonId }).del().then(function(result) {
      console.log('success ========kkk')
    }).catch((error) => {
      console.log('fail ========kkk')
      console.log(error);
    });
  }

  public insertVideo(mainWindow: BrowserWindow, courseId: String, chapterId: String, lessonId: String, link:String, courseName: String, chapterName: String, lessonName: String, courseDuration: number, chapterDuration: number, lessonDuration: number, last: boolean) {
    var that = this;
    LogManager.appLog('info', 'insertVideo=======');
    this.database!('video').where({lessonId:lessonId}).then(function(result) {
      if (result.length === 0) {
        that.database!('video').insert({link:link, lessonId:lessonId, courseName:courseName, chapterName:chapterName, lessonName:lessonName, courseId:courseId, chapterId:chapterId, courseDuration:courseDuration, chapterDuration:chapterDuration, lessonDuration:lessonDuration}).then(function(result) {
          if (last) {
            mainWindow!.webContents.send('offline-insert-success', {});
          }
        }).catch((error) => {
          console.log('fail ========')
          console.log(error);
          LogManager.appLog('error', JSON.stringify(error));
        });
      }
      else {
        if (last) {
          mainWindow!.webContents.send('offline-insert-success', {});
        }
        console.log('not insert======');
      }
    }).catch((error) => {
      LogManager.appLog('error', 'outer===' + JSON.stringify(error));
    });

  }

  /**
   * get Instance
   */
  public static get Instance() {
    if (!this._shareConfig) {
      this._shareConfig = new this();
      this._shareConfig.initDB();
    }
    return this._shareConfig;
  }
}

export default OfflineDAO.Instance;
