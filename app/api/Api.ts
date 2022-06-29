import axios from 'axios';
import merge from 'lodash/merge';
// import i18n from '../configs/i18next.config.client';

type ApiObject = {
  options: Function;
  configureURL: Function;
  getToken: Function;
  setToken: Function;
  removeToken: Function;
  get: Function;
  post: Function;
  put: Function;
  delete: Function;
  baseURL: Function;
};

export const PROD_API_URL = 'https://api.iioe.org';
export const DEBUG_API_URL = 'http://api-test.iioe.org';

export const instance = axios.create();
// const API_URL =  false? PROD_API_URL : DEBUG_API_URL
const Api: ApiObject = {} as ApiObject;

instance.defaults.headers.common['Content-Type'] =
  'application/json; charset=UTF-8';

Api.options = async (config: { [key: string]: any } = {}) => {
  // eslint-disable-next-line global-require
  const i18n = require('../configs/i18next.config.client').default;
  const headers: { [key: string]: string } = {};
  const token = await Api.getToken();
  const lng = i18n.default.language;
  let lang = 'zh-CN';
  if (lng === 'en') {
    lang = 'en-US';
  } else if (lng === 'fr') {
    lang = 'fr-FR';
  }
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  headers['Accept-Language'] = lang;
  const offset = new Date().getTimezoneOffset() / -60;
  headers['Client-Timezone'] =
    offset < 0 ? `UTC${offset.toString()}` : `UTC+${offset.toString()}`;

  return merge(config, { headers });
};

instance.interceptors.response.use(
  (response) => {
    if (response && Object.prototype.hasOwnProperty.call(response, 'data')) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (
      error &&
      error.response &&
      Object.prototype.hasOwnProperty.call(error.response, 'data')
    ) {
      if (error.response.data instanceof Object) {
        return Promise.reject({
          ...error.response.data,
          status: error.response.status,
        });
      }
      return Promise.reject({
        message: error.response.data,
        status: error.response.status,
      });
    }
    return Promise.reject(error);
  }
);

Api.configureURL = (relase: boolean) => {
  // if (true) {
  // eslint-disable-next-line no-param-reassign
  const url = relase ? PROD_API_URL : DEBUG_API_URL;
  // }
  instance.defaults.baseURL = `${url}/api/`;
  return url;
};

Api.getToken = async () => {
  return localStorage.getItem('token');
};

Api.setToken = async (token: string) => {
  return localStorage.setItem('token', token);
};

Api.removeToken = async () => {
  return localStorage.removeItem('token');
};

Api.get = async (url: string, config: { [key: string]: any }) => {
  return instance.get(url, await Api.options(config));
};

Api.post = async (
  url: string,
  data: { [key: string]: any },
  config: { [key: string]: any }
) => {
  return instance.post(url, data, await Api.options(config));
};

Api.put = async (
  url: string,
  data: { [key: string]: any },
  config: { [key: string]: any }
) => {
  return instance.put(url, data, await Api.options(config));
};

Api.delete = async (
  url: string,
  config: { [key: string]: any }
) => {
  return instance.delete(url, await Api.options(config));
};

Api.baseURL = () => {
  return instance.defaults.baseURL;
};

export default Api;
