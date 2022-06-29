import { AppThunk } from './../store';
import { createSlice } from '@reduxjs/toolkit';

export interface DownloadCourseState {
  courseName: string;
  courseId:string;
  chapterName: string;
  chapterId:string;
  lessonId:string;
  lessonName: string;
  status: 'waiting' | 'progressing' | 'completed' | 'interrupted' | 'paused';
  progress: number;
  speed: number;
  link: string;
  totalBytes: number;
  lessonTime: number;
  completeTime: number;
}

const initialDownload: DownloadCourseState = {
  courseName: '',
  courseId: '',
  chapterName: '',
  chapterId: '',
  lessonId: '',
  lessonName: '',
  status: 'waiting',
  progress: 0,
  speed: 0,
  link: '',
  totalBytes: 0,
  lessonTime: 0,
  completeTime: 0
}

const downloadSlice = createSlice({
  name: 'download',
  initialState: {
    downloadList: <any>[],
  },
  reducers: {
    fillList: (state, action) => {
    },
    updateItemState: (state, action) => {
    },
    updateItemProgress: (state, action) => {
      state.downloadList = action.payload;
    },
    deleteItemVideo: (state, action) => {
      state.downloadList = action.payload;
    },
    addItemVideo: (state, action) => {
      const item: DownloadCourseState = action.payload;
      state.downloadList.push(item);
    }
  }
});

export default downloadSlice.reducer;
export const {
  fillList,
  updateItemState,
  updateItemProgress,
  deleteItemVideo,
  addItemVideo
} = downloadSlice.actions;

export const syncSqlite = (): AppThunk => {
  return (dispatch, getSate) => {

  }
}

export const addVideo = (courseId: string, courseName: string, chapterId: string, chapterName: string, lessonId: string, lessonName: string, link: string, lessonTime: number): AppThunk => {
  return (dispatch, getSate) => {
    let video: DownloadCourseState = {
      courseName,
      courseId,
      chapterId,
      chapterName,
      lessonId,
      lessonName,
      status: 'waiting',
      progress: -1,
      speed: 0,
      link,
      totalBytes: 0,
      lessonTime,
      completeTime: Math.floor(Date.now() / 1000)
    };
    dispatch(addItemVideo(video))
  }
}

export const addLocalVideo = (courseId: string, courseName: string, chapterId: string, chapterName: string, lessonId: string, lessonName: string, link: string, lessonTime: number, progress: number, totalBytes: number, completeTime: number):AppThunk => {
  return (dispatch, getSate) => {
    let video: DownloadCourseState = {
      courseName,
      courseId,
      chapterId,
      chapterName,
      lessonId,
      lessonName,
      status: Math.floor(progress) == 1 ? 'completed' : 'interrupted',
      progress: progress,
      speed: 0,
      link,
      totalBytes: totalBytes,
      lessonTime,
      completeTime: completeTime
    };
    dispatch(addItemVideo(video))
  }
}

export const deleteVideo = (url: string): AppThunk => {
  return (dispatch, getSate) => {
    const list:DownloadCourseState[] = JSON.parse(JSON.stringify(getSate().download.downloadList));
    let index = -1;
    index = list.findIndex(element => element.link == url);
    if (index > -1) {
      list.splice(index, 1);
    }
    dispatch(deleteItemVideo(list));
  }
}

export const updateProgress = (url: string, progress: number, speed: number, totalBytes: number, state: 'waiting' | 'progressing' | 'completed' | 'interrupted'): AppThunk => {
  return (dispatch, getSate) => {
    // console.log('updateProgress ============== ')
    // console.log(url)
    // console.log(progress)
    const list:DownloadCourseState[] = JSON.parse(JSON.stringify(getSate().download.downloadList));
    // console.log(list);
    for (let i = 0; i < list.length; i++) {
      // let element = list[i];
      if (list[i].link === url) {
        list[i].progress = progress;
        list[i].speed = speed;
        list[i].totalBytes = totalBytes;
        list[i].status = state;
        break;
      }
    }
    dispatch(updateItemProgress(list));
  }
}

export const updateState = (url: string, status: 'waiting' | 'progressing' | 'completed' | 'interrupted' | 'paused'): AppThunk => {
  return (dispatch, getSate) => {
    const list:DownloadCourseState[] = JSON.parse(JSON.stringify(getSate().download.downloadList));
    for (let i = 0; i < list.length; i++) {
      if (list[i].link === url) {
        list[i].status = status;
      }
    }
    dispatch(updateItemProgress(list));
  }
}
