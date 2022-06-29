import Api from './Api';

// eslint-disable-next-line import/prefer-default-export
export const AuthApi: { [key: string]: Function } = {};

AuthApi.login = async (email: string, password: string, remember: boolean) => {
  return Api.post('/authenticate', {
    username: email,
    password,
    rememberMe: remember,
  });
};

AuthApi.fetchProfile = async () => {
  return Api.get('/account', {});
};

AuthApi.fetchIdentity = async () => {
  return Api.get('/i18n/identities', {});
};

AuthApi.fetchUserTitles = async () => {
  return Api.get('/i18n/user_title', {});
};

AuthApi.fetchCountries = async () => {
  return Api.get('/geo/countries', {});
};

AuthApi.captcha = async(email: string) => {
  return Api.post('/email-verify-code/' + email, {});
}

AuthApi.register = async(params: any) => {
  return Api.post('/register', params);
}


