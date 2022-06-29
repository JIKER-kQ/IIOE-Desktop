import Api from './Api';

// eslint-disable-next-line import/prefer-default-export
export const HomeApi: { [key: string]: Function } = {};

HomeApi.hot = async () => {
  return Api.get('/courses/ichei/list?hot=true');
};

HomeApi.list = async (params: { [key: string]: any }) => {
  return Api.get('/courses/ichei/list', {
    params,
  });
};

HomeApi.catrgoryList = async () => {
  return Api.get('/courses/category-list');
};

HomeApi.version = async (mac: boolean) => {
  const trail = mac ? 'mac' : 'windows';
  return Api.get(`/app-version/${trail}`);
};
