import { AppThunk } from './../store';
import { createSlice } from '@reduxjs/toolkit';

export interface OfflineCourseState {
  courseName: string;
  courseId:string;
  chapterName: string;
  chapterId:string;
  lessonId:string;
  lessonName: string;
  link: string;
  courseDuration: number;
  chapterDuration: number;
  lessonDuration: number;
}

const offlineSlice = createSlice({
  name: 'offline',
  initialState: {
    offlineList: <any>[],
  },
  reducers: {
    fillList: (state, action) => {
    },
    updateItemState: (state, action) => {
    },
    updateItemProgress: (state, action) => {
      state.offlineList = action.payload;
    },
    deleteItemVideo: (state, action) => {
      state.offlineList = action.payload;
    },
    addItemVideo: (state, action) => {
      const item: OfflineCourseState = action.payload;
      state.offlineList.push(item);
      console.log(state.offlineList);
      console.log('====sss========');
    }
  }
});

export default offlineSlice.reducer;
export const {
  fillList,
  updateItemState,
  updateItemProgress,
  deleteItemVideo,
  addItemVideo
} = offlineSlice.actions;

export const addVideo = (courseId: string, courseName: string, chapterId: string, chapterName: string, lessonId: string, lessonName: string, link: string, courseDuration: number, chapterDuration: number, lessonDuration: number): AppThunk => {
  return (dispatch, getSate) => {
    const list:OfflineCourseState[] = getSate().offline.offlineList;
    let isExist = false;
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if (element.link === link) {
        isExist = true;
        break;
      }
    }
    if (isExist) {
      return;
    }

    let video: OfflineCourseState = {
      courseName,
      courseId,
      chapterId,
      chapterName,
      lessonId,
      lessonName,
      courseDuration,
      chapterDuration,
      lessonDuration,
      link
    };
    dispatch(addItemVideo(video))
  }
}

export const deleteVideo = (lessonId: string): AppThunk => {
  return (dispatch, getSate) => {
    const list:OfflineCourseState[] = JSON.parse(JSON.stringify(getSate().offline.offlineList));
    let index = -1;
    console.log(list);
    console.log('ddadad====');
    console.log(lessonId);
    index = list.findIndex(element => element.lessonId == lessonId);
    if (index > -1) {
      list.splice(index, 1);
    }
    console.log(list);
    dispatch(deleteItemVideo(list));
  }
}
