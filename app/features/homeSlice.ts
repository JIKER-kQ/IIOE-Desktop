import { createSlice } from '@reduxjs/toolkit';
import { HomeApi } from '../api/HomeApi';
// eslint-disable-next-line import/no-cycle
import { AppThunk } from '../store';

const homeSlice = createSlice({
  name: 'home',
  initialState: { tabIndex: 0, recommendList: [], allList: [[], [], [], []] },
  reducers: {
    fillRecommend: (state, action) => {
      state.recommendList = action.payload;
    },
    fillAll: (state, action) => {
      const data = action.payload;
      state.allList[data['index']] = data.content;
    },
    updateSort: (state, action) => {
      state.tabIndex = action.payload;
    },
  },
});

export default homeSlice.reducer;
export const { fillRecommend, fillAll, updateSort } = homeSlice.actions;

export const fetchRecommend = (): AppThunk => {
  return (dispatch, getState) => {
    HomeApi.hot()
      .then((response: any) => {
        dispatch(fillRecommend(response.content));
        return 0;
      })
      .catch((error: any) => {
        console.log(error);
      });

    return 0;
  };
};

export const updateIndex = (index: number, force: boolean): AppThunk => {
  return (dispatch, getState) => {
    dispatch(updateSort(index));
    const params = {
      size: '8',
    };
    if (index !== 0) {
      const rootCategoryCodeList = [
        'discipline_courses',
        'tvet-related_courses',
        'professional_development_courses',
      ];
      params['rootCategoryCode'] = rootCategoryCodeList[index - 1];
    }
    const list = getState().home.allList;
    if (list[index].length === 0 || force) {
      HomeApi.list(params)
        .then((response: any) => {
          const data = response;
          data.index = index;
          dispatch(fillAll(data));
          return 0;
        })
        .catch((error: any) => {
          console.log(error);
        });
    }

    // console.log(getState());
    // console.log('===========sss===');

    return 0;
  };
};
