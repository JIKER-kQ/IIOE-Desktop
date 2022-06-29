import { CourseApi } from './../api/CourseApi';
import { createSlice } from '@reduxjs/toolkit';
import { AppThunk } from '../store';

export interface LoadStatusProps {
  hasMore: boolean;
  loadingMore: boolean;
  loadedFailure: boolean;
  pageIndex: number;
}

const intialStatus: LoadStatusProps = {
  hasMore: false,
  loadingMore: false,
  loadedFailure: false,
  pageIndex: -1,
};

const meSlice = createSlice({
  name: 'me',
  initialState: {
    selectedIndex: 0,
    studyList: null,
    historyList: null,
    studyStatus: intialStatus,
    historyStatus: intialStatus,
    studySum: 0,
    historySum: 0
  },
  reducers: {
    fillHistory: (state, action) => {
      state.historyList = action.payload;
    },
    fillStudyPlan: (state, action) => {
      state.studyList = action.payload;
    },
    updateHistorySum: (state, action) => {
      state.historySum = action.payload;
    },
    updateStudySum: (state, action) => {
      state.studySum = action.payload;
    },
    updateFetchMore: (state, action) => {
      if (state.selectedIndex === 0) {
        state.historyStatus.loadingMore = action.payload;
      }
      else {
        state.studyStatus.loadingMore = action.payload;
      }
    },
    updateHasMore: (state, action) => {
      if (state.selectedIndex === 0) {
        state.historyStatus.hasMore = action.payload;
      }
      else {
        state.studyStatus.hasMore = action.payload;
      }
    },
    updatePageIndex: (state, action) => {
      if (state.selectedIndex === 0) {
        state.historyStatus.pageIndex = action.payload;
      }
      else {
        state.studyStatus.pageIndex = action.payload;
      }
    },
    updateLoadedFailure: (state, action) => {
      if (state.selectedIndex === 0) {
        state.historyStatus.loadedFailure = action.payload;
      }
      else {
        state.studyStatus.loadedFailure = action.payload;
      }
    },
    updateIndex: (state, action) => {
      state.selectedIndex = action.payload;
    },
    resetData: (state)=> {
      state.studyStatus = intialStatus;
      state.historyStatus = intialStatus;
      state.historyList = null;
      state.studyList = null;
    }
  }
});

export default meSlice.reducer;
export const { fillHistory, fillStudyPlan, updateHistorySum, updateStudySum, updateIndex, updateFetchMore, updateHasMore, updateLoadedFailure, updatePageIndex, resetData} = meSlice.actions;

export const fetchStudy = (refresh: boolean = false): AppThunk => {
  return (dispatch, getState) => {
    const params = {
      size: '8',
      page: refresh ? 0 : getState().me.studyStatus.pageIndex + 1
    };

    if (!refresh) {
      dispatch(updateFetchMore(true));
      dispatch(updateLoadedFailure(false));
    }

    CourseApi.coursePlan(params).then((response)=> {
      console.log('===999=====');
      console.log(response['content']);
      if (refresh) {
        dispatch(fillStudyPlan(response['content']));
      }
      else {
        if (getState().me.studyList) {
          let list: [] = getState().me.studyList!;
          dispatch(fillStudyPlan(list.concat(response['content'])));
        }

      }
      dispatch(updateStudySum(response.totalElements))
      dispatch(updatePageIndex(response.number));
      dispatch(updateHasMore(response.totalPages - 1 > response.number));
      dispatch(updateFetchMore(false));
    })
    .catch((error: any) => {
      console.log(error);
      if (!refresh) {
        dispatch(updateFetchMore(false));
        dispatch(updateLoadedFailure(true));
      }
    });
  }
}

export const fetchHistory = (refresh: boolean = false): AppThunk => {
  return (dispatch, getState) => {
    const params = {
      size: '8',
      page: refresh ? 0 : getState().me.historyStatus.pageIndex + 1
    };
    if (!refresh) {
      dispatch(updateFetchMore(true));
      dispatch(updateLoadedFailure(false));
    }

    CourseApi.courseHistory(params).then((response)=> {
      console.log('===8888888=====');
      console.log(response['content']);
      if (refresh) {
        dispatch(fillHistory(response['content']));
      }
      else {
        if (getState().me.historyStatus) {
          let list: [] = getState().me.historyList!;
          dispatch(fillHistory(list.concat(response['content'])));
        }
      }

      dispatch(updateHistorySum(response.totalElements))
      dispatch(updatePageIndex(response.number));
      dispatch(updateHasMore(response.totalPages - 1 > response.number));
      dispatch(updateFetchMore(false));
    })
    .catch((error: any) => {
      console.log(error);
      if (!refresh) {
        dispatch(updateFetchMore(false));
        dispatch(updateLoadedFailure(true));
      }

    });
  }
}

export const updateSelectedIndex = (index: number): AppThunk => {
  return (dispatch) => {
    dispatch(updateIndex(index))
  }
}

export const resetAllData = (): AppThunk => {
  return (dispatch) => {
    dispatch(resetData())
  }
}
