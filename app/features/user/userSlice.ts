import { createSlice } from '@reduxjs/toolkit';
import { AuthApi } from '../../api/AuthApi';
// eslint-disable-next-line import/no-cycle
import { RootState, AppThunk } from '../../store';
import i18n from '../../configs/i18next.config.client';

const userSlice = createSlice({
  name: 'user',
  initialState: { token: '', user: null },
  reducers: {
    refrshProfile: (state, action) => {
      state.user = action.payload;
      console.log('====sssskkk====');
      console.log(action.payload);
    },
    refreshLogin: (state, action) => {
      console.log('====kkkkkkkkkk====');
      state.token = action.payload;
    },

  },
});

export default userSlice.reducer;

export const userToken = (state: RootState) => state.user.token;
export const { refrshProfile, refreshLogin } = userSlice.actions;

export const fetchProfile = (): AppThunk => {
  return (dispatch, getState) => {
    console.log('=========');
    AuthApi.fetchProfile()
      .then((response: any) => {
        dispatch(refrshProfile(response));
        return 0;
      })
      .catch(() => {
        localStorage.removeItem('token');
        dispatch(refreshLogin(''));
        console.log('ssss');
      });
  };
};

export const login = (token: String): AppThunk => {
  return (dispatch, getState) => {
    dispatch(refreshLogin(token));
  };
};

export const logout = (): AppThunk => {
  return (dispatch, getState) => {
    localStorage.removeItem('token');
    dispatch(refreshLogin(''));
    dispatch(refrshProfile(null));
  };
};

const toggle = (lang: any) => i18n.changeLanguage(lang);
export const changeLanguage = (lng: string): AppThunk => {
  return (dispatch, getState) => {
    toggle(lng);
    localStorage.setItem('lang', lng);
  };
};
