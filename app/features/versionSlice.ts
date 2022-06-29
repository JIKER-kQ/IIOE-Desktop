import { createSlice } from '@reduxjs/toolkit';
import { AppThunk } from '../store';

const versionSlice = createSlice({
  name: 'version',
  initialState: {
    nowVersion: '1.0.0',
    macURL: '',
    windowsURL: '',
    desc: '',
  },
  reducers: {
    fillVersion: (state, action) => {
      const data = action.payload;
      state.nowVersion = data.version;
      state.macURL = data.macURL;
      state.windowsURL = data.windowsURL;
      state.desc = data.desc;
    },
  },
});

export default versionSlice.reducer;
export const { fillVersion } = versionSlice.actions;

export const fillVersionData = (
  version: string,
  macURL: string,
  windowsURL: string,
  desc: string
): AppThunk => {
  return (dispatch, getState) => {
    dispatch(fillVersion({ version, macURL, windowsURL, desc }));
  };
};
