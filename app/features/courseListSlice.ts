import { createSlice } from '@reduxjs/toolkit';
import { HomeApi } from '../api/HomeApi';
// eslint-disable-next-line import/no-cycle
import { AppThunk } from '../store';

export interface LoadStatusProps {
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadedFailure: boolean;
  pageIndex: number;
}

const intialStatus: LoadStatusProps = {
  loading: false,
  hasMore: false,
  loadingMore: false,
  loadedFailure: false,
  pageIndex: 0,
};

const courseListSlice = createSlice({
  name: 'courseList',
  initialState: {
    rootIndex: 0,
    categoryIndex: 0,
    categoryList: [],
    allList: [[null], [null], [null], [null]],
    markList: [[intialStatus], [intialStatus], [intialStatus], [intialStatus]],
  },
  reducers: {
    fillCourseList: (state, action) => {
      const list: any[] = state.allList[state.rootIndex];
      list[state.categoryIndex] = action.payload;
    },
    appendCourseList: (state, action) => {
      const list: any[] = state.allList[state.rootIndex];
      const courseList: any[] = list[state.categoryIndex];
      list[state.categoryIndex] = courseList.concat(action.payload);
    },
    updateRootSort: (state, action) => {
      state.rootIndex = action.payload;
      state.categoryIndex = 0;
    },
    updateCategorySort: (state, action) => {
      state.categoryIndex = action.payload;
    },
    updateCategoryList: (state, action) => {
      // state.tabIndex = action.payload;
      const source = action.payload;
      state.categoryList = source;
      console.log(source);
      const list = state.allList;
      const statusList = state.markList;
      for (let i = 0; i < source.length; i += 1) {
        const { children } = source[i];
        for (let j = 0; j < children.length; j += 1) {
          list[i + 1].push(null);
          statusList[i + 1].push(intialStatus);
        }
      }
      console.log(list);
      console.log('=====sss============');
    },
    resetAllData: (state, action) => {
      console.log('ssss=====ddcc====');
      const force = action.payload;
      if (force) {
        state.markList = [
          [intialStatus],
          [intialStatus],
          [intialStatus],
          [intialStatus],
        ];
        state.allList = [[null], [null], [null], [null]];
        state.rootIndex = 0;
        state.categoryIndex = 0;
        state.categoryList = [];
      } else {
        for (let i = 0; i < state.markList.length; i += 1) {
          const list = state.markList[i];
          for (let index = 0; index < list.length; index += 1) {
            const element: LoadStatusProps = list[index];
            element.pageIndex = 0;
            element.loading = false;
            element.loadingMore = false;
            element.loadedFailure = false;
            element.hasMore = false;
          }
        }

        for (let i = 0; i < state.allList.length; i += 1) {
          const elements = state.allList[i];
          for (let j = 0; j < elements.length; j += 1) {
            elements[j] = null;
          }
        }
      }
    },
    updateFetchMore: (state, action) => {
      state.markList[state.rootIndex][state.categoryIndex].loadingMore =
        action.payload;
    },
    updateHasMore: (state, action) => {
      state.markList[state.rootIndex][state.categoryIndex].hasMore =
        action.payload;
    },
    updatePageIndex: (state, action) => {
      state.markList[state.rootIndex][state.categoryIndex].pageIndex =
        action.payload;
    },
    updateLoadedFailure: (state, action) => {
      state.markList[state.rootIndex][state.categoryIndex].loadedFailure =
        action.payload;
    },
  },
});

export default courseListSlice.reducer;
export const {
  resetAllData,
  fillCourseList,
  updateRootSort,
  updateCategorySort,
  updateCategoryList,
  updateFetchMore,
  updateHasMore,
  updateLoadedFailure,
  updatePageIndex,
  appendCourseList,
} = courseListSlice.actions;

export const resetCourseList = (force = true): AppThunk => {
  return (dispatch, getState) => {
    console.log('=======sss======s');
    dispatch(resetAllData(force));
  };
};

export const updateRootIndex = (index: number, force = false): AppThunk => {
  return (dispatch, getState) => {
    dispatch(updateRootSort(index));
    const list = getState().courseList.allList[index];
    const { markList } = getState().courseList;
    const params = {
      size: '12',
    };
    if (index !== 0 || force) {
      const rootCategoryCodeList = [
        'discipline_courses',
        'tvet-related_courses',
        'professional_development_courses',
      ];
      params['rootCategoryCode'] = rootCategoryCodeList[index - 1];
    }
    const courseList = list[0];
    if (courseList === null) {
      HomeApi.list(params)
        .then((response: any) => {
          dispatch(fillCourseList(response.content));
          dispatch(updatePageIndex(response.number));
          dispatch(updateHasMore(response.totalPages - 1 > response.number));
          // dispatch(updateFetchMore(false));
          return 0;
        })
        .catch((error: any) => {
          console.log(error);
          // dispatch(updateFetchMore(false));
          // dispatch(updateLoadedFailure(true));
        });
    }
    return 0;
  };
};

export const updateCategoryIndex = (index: number, force = false): AppThunk => {
  return (dispatch, getState) => {
    dispatch(updateCategorySort(index));
    const params = {
      size: '12',
    };
    const { rootIndex, categoryList, markList } = getState().courseList;
    if (rootIndex !== 0) {
      params['rootCategoryCode'] = categoryList[rootIndex - 1]['code'];
    }
    if (index !== 0 && rootIndex !== 0) {
      params['categoryCode'] =
        categoryList[rootIndex - 1]['children'][index - 1]['code'];
    }
    // dispatch(updateFetchMore(true));
    // if (markList[rootIndex][index].loadedFailure) {
    //   dispatch(updateLoadedFailure(false));
    // }
    const list = getState().courseList.allList[rootIndex];
    const courseList = list[index];
    if (courseList === null || force) {
      HomeApi.list(params)
        .then((response: any) => {
          dispatch(fillCourseList(response.content));
          dispatch(updatePageIndex(response.number));
          dispatch(updateHasMore(response.totalPages - 1 > response.number));
          // dispatch(updateFetchMore(false));
          return 0;
        })
        .catch((error: any) => {
          console.log(error);
          // dispatch(updateFetchMore(false));
          // dispatch(updateLoadedFailure(true));
        });
    }
    return 0;
  };
};

export const fetchMoreCourseList = (): AppThunk => {
  return (dispatch, getState) => {
    const {
      rootIndex,
      categoryIndex,
      categoryList,
      markList,
    } = getState().courseList;
    const params = {
      size: '12',
      page: (markList[rootIndex][categoryIndex].pageIndex + 1).toString(),
    };

    if (rootIndex !== 0) {
      params['rootCategoryCode'] = categoryList[rootIndex - 1]['code'];
    }
    if (categoryIndex !== 0) {
      params['categoryCode'] =
        categoryList[rootIndex - 1]['children'][categoryIndex - 1]['code'];
    }
    const list = getState().courseList.allList[rootIndex];
    const courseList = list[categoryIndex];
    console.log('===========');
    dispatch(updateFetchMore(true));
    if (markList[rootIndex][categoryIndex].loadedFailure) {
      dispatch(updateLoadedFailure(false));
    }
    console.log(params);
    console.log('=======sss====');
    if (courseList !== null) {
      HomeApi.list(params)
        .then((response: any) => {
          dispatch(appendCourseList(response.content));
          dispatch(updatePageIndex(response.number));
          dispatch(updateHasMore(response.totalPages - 1 > response.number));
          dispatch(updateFetchMore(false));
          return 0;
        })
        .catch((error: any) => {
          console.log(error);
          dispatch(updateFetchMore(false));
          dispatch(updateLoadedFailure(true));
        });
    }
    return 0;
  };
};

export const fetchCategoryList = (force = false): AppThunk => {
  return (dispatch, getState) => {
    if (getState().courseList.categoryList.length === 0 || force) {
      HomeApi.catrgoryList()
        .then((response: any) => {
          dispatch(updateCategoryList(response));
          return 0;
        })
        .catch((error: any) => {
          console.log(error);
          console.log('======sss=======');
        });
    }
  };
};
