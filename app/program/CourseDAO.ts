import path from 'path';
import { Knex, knex } from "knex";
import { BrowserWindow } from 'electron';

class CourseDAO {
  private static _shareConfig: CourseDAO;
  private database: Knex | null = null;

  private initDB() {
    const { app } = require('electron');
    this.database = knex({
      client: "sqlite3",
      connection: {
        filename: path.join(app.getAppPath(), 'download_course.sqlite')
      },
      useNullAsDefault: true
    });
  }

  public queryAll(mainWindow: BrowserWindow) {
    let result = this.database!.from("video")

    result.then(function(rows){
      console.log('--------======kk----')
      // console.log(row);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const params = {
          coverURL: row['coverURL'],
          link: row['link'],
          duration: row['duration'],
          courseID: row['courseId'],
          chapterID: row['chapterId'],
          lessonID: row['lessonId'],
          courseName: row['courseName'],
          chapterName: row['chapterName'],
          lessonName: row['lessonName'],
          completeTime: row['completeTime'],
          progress: row['progress'] / 10000.0,
          totalBytes: row['totalBytes']
        }

        mainWindow!.webContents.send('video-add-local', params);
      }
		})
  }

  public deleteVideo(url: String) {
    console.log(url);
    this.database!('video').where({ link:url }).del().then(function(result) {
      console.log('success ========kkk')
    }).catch((error) => {
      console.log('fail ========kkk')
      console.log(error);
    });
  }

  public insertVideo(coverURL: String, courseId: String, chapterId: String, lessonId: String, link:String, courseName: String, chapterName: String, lessonName: String, duration: number, completeTime: number, sort: number) {
    this.database!('video').insert({coverURL:coverURL, link:link, duration:duration, lessonId:lessonId, courseName:courseName, chapterName:chapterName, lessonName:lessonName, courseId:courseId, chapterId:chapterId, completeTime:completeTime, sort:sort, progress:0, totalBytes:0 }).then(function(result) {
      console.log('success ========')
    }).catch((error) => {
      console.log('fail ========')
      console.log(error);
    });
  }

  /**
   * updateVideo
   */
  public updateVideo(url: String, progress: number, totalBytes: number) {
    this.database!('video').where({ link:  url}).update({progress: progress,totalBytes:totalBytes}).then(function(result) {
      console.log('success ========kkk')
    }).catch((error) => {
      console.log('fail ========kkk')
      console.log(error);
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

export default CourseDAO.Instance;
