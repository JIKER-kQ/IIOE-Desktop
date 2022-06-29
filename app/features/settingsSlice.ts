import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk } from '../store';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    show: false,
    online: true
  },
  reducers: {
    updateStatus: (state, action) => {
      state.show = action.payload;
    },
    updateOnline: (state, action) => {
      state.online = action.payload;
    },
  },
});

export default settingsSlice.reducer;
export const { updateStatus, updateOnline } = settingsSlice.actions;

export const updatePopupSatus = (isShow: boolean): AppThunk => {
  return (dispatch, getState) => {
    if (isShow !== getState().settings.show) {
      dispatch(updateStatus(isShow));
    }
  };
};

export const updateOnlineStatus = (online: boolean): AppThunk => {
  return (dispatch) => {
    dispatch(updateOnline(online));
  }
}
