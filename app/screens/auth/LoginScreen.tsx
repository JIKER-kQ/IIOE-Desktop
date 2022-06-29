import React, {forwardRef, useEffect, useRef, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import TextField, { Input } from '@material/react-text-field';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import { AuthApi } from '../../api/AuthApi';
import routes from '../../constants/routes.json';
import { changeLanguage, login } from '../../features/user/userSlice';
import DatePicker from "react-datepicker";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import { setInterval } from 'timers';

function LoginScreen(props: any): JSX.Element {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t, lng } = props;
  const [status, setStatus] = useState(0);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorHint, setHintError] = useState('');

  const languageList = ['English', '中文', 'Français'];
  const lngList = ['en', 'zh', 'fr'];
  const list: JSX.Element[] = [];
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [selectedIdentityOption, setSelectedIdentityOption] = useState(null);
  const [optionIdentityList, setOptionIdentityList] = useState<any[]>([]);
  const [selectedTitleOption, setSelectedTitleption] = useState(null);
  const [optionTitleList, setOptionTitleList] = useState<any[]>([]);
  const [selectedCountryOption, setSelectedCountryption] = useState(null);
  const [optionCountryList, setOptionCountryList] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [captchaStatus, setCaptchaStatus] = useState(-1); // 0 normal, 1 sending,send again 2,
  const [sendTime, setSendTime] = useState(0);
  const [request, setRequest] = useState(false);
  const [toggle, setToggle] = useState(false);


  useEffect(()=> {
    AuthApi.fetchIdentity().then((response: any[]) => {
      const list: any[] = [];
      for (let i = 0; i < response.length; i++) {
        const element = response[i];
        list.push(
          {
            value: element['code'],
            label: element['name']
          }
        )
      }
      setOptionIdentityList(list);
    });
  }, [lng]);

  useEffect(()=> {
    AuthApi.fetchUserTitles().then((response: any[]) => {
      const list: any[] = [];
      for (let i = 0; i < response.length; i++) {
        const element = response[i];
        list.push(
          {
            value: element['code'],
            label: element['name']
          }
        )
      }
      setOptionTitleList(list);
    });
  }, [lng]);

  useEffect(()=> {
    AuthApi.fetchCountries().then((response: any[]) => {
      const list: any[] = [];
      for (let i = 0; i < response.length; i++) {
        const element = response[i];
        list.push(
          {
            value: element['code'],
            label: element['name']
          }
        )
      }
      setOptionCountryList(list);
    });
  }, [lng]);

  useInterval(
    () => {
      if (toggle) {
        setSendTime(sendTime - 1);
      }
    if (sendTime <= 0) {
      setToggle(false);
    }
  }, 1000);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < languageList.length; i++) {
    let className = 'item';
    if (i === 1) {
      className += ' zh-item';
    }
    if (props.lng === 'zh' && i === 1) {
      className += ' active-item';
    }
    if (props.lng === 'en' && i === 0) {
      className += ' active-item';
    }
    if (props.lng === 'fr' && i === 2) {
      className += ' active-item';
    }
    if (i !== 0) {
      if (i === 1) {
        list.push(<div key="4" className="line left-line" />);
      } else {
        list.push(<div key="5" className="line right-line" />);
      }
    }
    list.push(
      <button
        key={i}
        type="button"
        className={className}
        onClick={() => {
          dispatch(changeLanguage(lngList[i]));
        }}
      >
        {languageList[i]}
      </button>
    );
  }

  function checkStatus(): boolean {
    if (
      !RegExp(
        "^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+.[a-zA-Z]+"
      ).exec(email)
    ) {
      return false;
    }
    if (password.length < 8) {
      return false;
    }
    return true;
  }

  function requestCaptcha() {
    if (captchaStatus === 1) {
      return;
    }
    setCaptchaStatus(1);
    AuthApi.captcha(signupEmail).then((response)=> {
      setSendTime(60);
      setToggle(true);
      setCaptchaStatus(2);
    }).catch((error)=> {
      toast(error['message'],  {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
      });
      setSendTime(0);
      setCaptchaStatus(2);
    });
  }

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      let id = setInterval(() => {
        savedCallback.current();
      }, delay);
      return () => clearInterval(id);
    }, [delay]);
  }

  function _renderCaptchaButton(): JSX.Element {
    var valid = !RegExp(
      "^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+.[a-zA-Z]+"
    ).exec(signupEmail);
    var buttonText = t('send_captcha');
    if (captchaStatus == 1) {
      buttonText = t('sending');
    }
    else if (captchaStatus == 2) {
      if (sendTime <= 60 && sendTime > 0) {
        buttonText = sendTime.toString() + 's';
      }
      else {
        buttonText = t('send_again');
      }
    }
    return (
      <button
        type="button"
        className={lng == 'fr' ? "captcha-button fr": "captcha-button"}
        disabled={!(!valid && captchaStatus != 1 && sendTime < 1)}
        onClick={() => {
          if ((!valid && captchaStatus != 1 && sendTime < 1)) {
            requestCaptcha();
          }
        }}
      >
        {buttonText}
      </button>
    );
  }

  function _checkPasswordStatus(): boolean {
    var valid = true;
    if (!RegExp("^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+.[a-zA-Z]+").exec(signupEmail)) {
      valid = false;
    }
    if (captcha == null || captcha.length == 0) {
      valid = false;
    }
    if (signupPassword == null || signupPassword.length < 8) {
      valid = false;
    }
    if (repeatPassword == null || repeatPassword.length < 8) {
      valid = false;
    }
    if (valid && repeatPassword != signupPassword) {
      valid = false
    }
    return valid;
  }

  function _signupPasswordWorld() {
    return (
      <div className="right-main signup">
        <p className="right-header">{t('signup')}</p>
        <div className="login-section">
          <TextField
            className="login-field"
            label={t('email')}
            floatingLabelClassName="login-label"
            lineRippleClassName="login-ripple"
          >
            <Input
              value={signupEmail}
              className="login-input"
              onChange={(e: any) => {
                setSignupEmail(e.currentTarget.value);
              }}
            />
          </TextField>
        </div>
        <div className="right-field" />
        <div className="login-section">
          <TextField
            className="login-field"
            label={t('captcha')}
            floatingLabelClassName="login-label"
            lineRippleClassName="login-ripple"
          >
            <Input
              type={'text'}
              className="login-input"
              value={captcha}
              onChange={(e: any) => {
                setCaptcha(e.currentTarget.value);
              }}
            />
          </TextField>
          {_renderCaptchaButton()}
        </div>
        <p className="right-field">{errorHint}</p>
        <div className="login-section">
          <TextField
            className="login-field"
            label={t('password')}
            floatingLabelClassName="login-label"
            lineRippleClassName="login-ripple"
          >
            <Input
              type={'password'}
              value={signupPassword}
              className="login-input"
              onChange={(e: any) => {
                setSignupPassword(e.currentTarget.value);
                // setHintError('');
              }}
            />
          </TextField>
        </div>
        <p className="right-field">{errorHint}</p>
        <div className="login-section">
          <TextField
            className="login-field"
            label={t('password')}
            floatingLabelClassName="login-label"
            lineRippleClassName="login-ripple"
          >
            <Input
              type={'password'}
              value={repeatPassword}
              className="login-input"
              onChange={(e: any) => {
                setRepeatPassword(e.currentTarget.value);
                // setHintError('');
              }}
            />
          </TextField>
        </div>
        <p className="right-field">{errorHint}</p>
        <button
          className="login-button"
          type="button"
          disabled={!_checkPasswordStatus()}
          onClick={() => {
            if (_checkPasswordStatus()) {
              registerAccount()
            }
          }}
        >
          {t('signup')}
        </button>
        <div className="signup-container">
          <div className={lng == 'fr' ? "signup-hint fr": "signup-hint"}>
            <span>{t('have_account')}？</span>
          </div>
          <button
            className={lng == 'fr' ? "signup-button fr": "signup-button"}
            onClick={()=> {
              setStatus(0);
            }}
          >{t('login')}</button>
        </div>
      </div>
    );
  }

  function registerAccount() {
    if (request) {
      return false;
    }
    setRequest(true);
    var time = startDate!.getFullYear()+'-'+("0"+(startDate!.getMonth()+1)).slice(-2)+'-'+("0"+startDate!.getDate()).slice(-2)
    var params = {
      'address': {
        'countryCode': selectedCountryOption!['value']
      },
      'birthday': time,
      'email': signupEmail,
      'identityCode': selectedIdentityOption!['value'],
      'name': {
        "firstName": firstName,
        "lastName": lastName
      },
      'password': signupPassword,
      'pin': captcha,
      'sex': gender == 'male' ? 'MALE': 'FEMALE',
      "title": selectedTitleOption!['value'],
    }
    AuthApi.register(params).then((response)=> {
      setRequest(false);
      dispatch(login(response.token));
      localStorage.setItem('token', response.token);
      history.push(routes.HOME);
    }).catch((error: any)=> {
      console.log('=====aaccaca');
      console.log(error);
      setRequest(false);
      toast(error['message'],  {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
      });
    });
    console.log(params);
  }

  function handleChange(value:any) {
    console.log(value);
    // _fetchSourceList(index, startDate, value);
    setSelectedIdentityOption(value);
  }

  function handleTitleChange(value:any) {
    console.log(value);
    // _fetchSourceList(index, startDate, value);
    setSelectedTitleption(value);
  }

  function handleCountryChange(value:any) {
    console.log(value);
    // _fetchSourceList(index, startDate, value);
    setSelectedCountryption(value);
  }

  function checkBaseStatus() {
    return firstName && firstName.length > 0 && lastName && lastName.length > 0 && startDate != null && selectedTitleOption != null && selectedIdentityOption != null && selectedTitleOption != null && selectedCountryOption;
  }

  function _renderSignupBase() {
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
      <button className="date-custom-input" onClick={onClick} ref={ref}>
        <span>{value && value.length > 0 ? value:""}</span>
        <img src="images/icon_birthday.png" alt="down" />
      </button>
    ));

    const customStyles = {
      menu: (provided, state) => ({
        ...provided,
        width: 180,
        margin: "10px 0",
        color: "#666666",
        textAlign: "center",
        cursor: 'pointer'
      }),

      control: () => ({
        display: 'flex',
        width: 172,
        height: 32,
        paddingLeft: 8,
        borderRadius: 16,
        cursor: 'pointer',
        backgroundColor: '#ffffff'
      }),
      indicatorSeparator: ()=> ({
        display: 'none',
      }),
      option:(provided, state) => ({
        ...provided,
        cursor: 'pointer',
        color: "#666666",
        backgroundColor: state.isSelected ? "#F4F7FA": state.isFocused ? "#F4F7FA" :"white",
      }),
      singleValue:(provided, state) => ({
        ...provided,
        color: "#8E9299",
      }),
    }

    const countryStyles = {
      menu: (provided, state) => ({
        ...provided,
        width: 380,
        margin: "10px 0",
        color: "#666666",
        textAlign: "center",
        cursor: 'pointer'
      }),

      control: () => ({
        display: 'flex',
        width: 372,
        height: 32,
        paddingLeft: 8,
        borderRadius: 16,
        cursor: 'pointer',
        backgroundColor: '#ffffff'
      }),
      indicatorSeparator: ()=> ({
        display: 'none',
      }),
      option:(provided, state) => ({
        ...provided,
        cursor: 'pointer',
        color: "#666666",
        backgroundColor: state.isSelected ? "#F4F7FA": state.isFocused ? "#F4F7FA" :"white",
      }),
      singleValue:(provided, state) => ({
        ...provided,
        color: "#8E9299",
      }),
    }

    return (
      <div className="right-main">
        <p className="right-header base-header">{t('signup')}</p>
        <div className="signup-section">
          <TextField
            className="signup-field name-field"
            label={t('first_name')}
            floatingLabelClassName="login-label"
            lineRippleClassName="login-ripple"
          >
            <Input
              value={firstName}
              className="signup-input"
              onChange={(e: any) => {
                setFirstName(e.currentTarget.value);
                setHintError('');
              }}
            />
          </TextField>
          <TextField
            className="signup-field"
            label={t('last_name')}
            floatingLabelClassName="login-label"
            lineRippleClassName="login-ripple"
          >
            <Input
              value={lastName}
              className="signup-input"
              onChange={(e: any) => {
                setLastName(e.currentTarget.value);
                setHintError('');
              }}
            />
          </TextField>
        </div>
        <div className="signup-section second-section">
          <div className="birthday-field">
            <p className="birthday-header">{t('birthday')}</p>
            <div className="birthday-main">
              <div className="birthday-input">
                <DatePicker
                  selected={startDate}
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  maxDate={new Date()}
                  onChange={(date) => {
                    setStartDate(date)
                  }}
                  customInput={<ExampleCustomInput />}
                />
              </div>
            </div>
          </div>
          <div className="identity-field">
            <p className="identity-header">{t('role')}</p>
            <div className="identity-main identity-input">
              <Select
                defaultValue={selectedIdentityOption}
                onChange={handleChange}
                options={optionIdentityList}
                isSearchable={false}
                styles={customStyles}
                placeholder={""}
              />
            </div>
          </div>
        </div>
        <div className="signup-section country-section">
          <div className="country-title">{t('title')}</div>
          <div className="country-main">
          <Select
            defaultValue={selectedTitleOption}
            onChange={handleTitleChange}
            options={optionTitleList}
            isSearchable={false}
            styles={countryStyles}
            placeholder={""}
          />
            {/* <img src="images/" alt="icon-identity" /> */}
          </div>
        </div>
        <div className="signup-section gender-section">
          <div className="gender-title">{t('gender')}</div>
          <div className="gender-field">
            <button
              className={gender == "male" ? "gender-input selected" : "gender-input"}
              onClick={()=> {
                if (gender === "male") {
                  return;
                }
                setGender("male");
              }}>{t('male')}</button>
            <button
              className={gender == "female" ? "gender-input selected" : "gender-input"}
              onClick={() => {
                if (gender === "female") {
                  return;
                }
                setGender("female");
              }}>{t('female')}</button>
          </div>
        </div>
        <div className="signup-section country-section">
          <div className="country-title">{t('select_country')}</div>
          <div className="country-main">
            <Select
              defaultValue={selectedCountryOption}
              onChange={handleCountryChange}
              options={optionCountryList}
              isSearchable={false}
              styles={countryStyles}
              placeholder={""}
              menuPlacement="top"
            />
          </div>
        </div>
        <button
          className="login-button"
          type="button"
          disabled={!checkBaseStatus()}
          onClick={() => {
            if (checkBaseStatus()) {
              setStatus(2);
            }
          }}
        >
          {t('next_step')}
        </button>
        <div className="signup-container">
          <div className={lng == 'fr' ? "signup-hint fr": "signup-hint"}>
            <span>{t('have_account')}？</span>
          </div>
          <button
            className={lng == 'fr' ? "signup-button fr": "signup-button"}
            onClick={()=> {
              setStatus(0);
            }}
          >{t('login')}</button>
        </div>
      </div>
    );
  }

  function _renderLoginSection():JSX.Element {
    if (status === 0) {
      return (
        <div className="right-main">
          <p className="right-header">{t('login')}</p>
          <div className="login-section">
            <TextField
              className="login-field"
              label={t('email')}
              floatingLabelClassName="login-label"
              lineRippleClassName="login-ripple"
            >
              <Input
                value={email}
                className="login-input"
                onChange={(e: any) => {
                  setEmail(e.currentTarget.value);
                  setHintError('');
                }}
              />
            </TextField>
          </div>
          <div className="right-field" />
          <div className="login-section">
            <TextField
              className="login-field"
              label={t('password')}
              floatingLabelClassName="login-label"
              lineRippleClassName="login-ripple"
            >
              <Input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                value={password}
                onChange={(e: any) => {
                  setPassword(e.currentTarget.value);
                  setHintError('');
                }}
              />
            </TextField>
            <button
              type="button"
              className="password-button"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? (
                <img src="images/icon_open_eye.png" alt="eye" />
              ) : (
                <img src="images/eye.png" alt="eye" />
              )}
            </button>
          </div>
          <p className="right-field password-field">{errorHint}</p>
          <div className="login-status">
            <button
              onClick={() => {
                setRemember(!remember);
              }}
            >
              <img src={remember ? "images/icon_status_selected.png" : "images/icon_status_unselected.png"} alt="status_selected"/>
            </button>
            <p className="status-text">{t('keep_login')}</p>
          </div>
          <button
            className="login-button"
            type="button"
            disabled={!checkStatus()}
            onClick={() => {
              if (checkStatus()) {
                AuthApi.login(email, password, remember)
                  .then((response: any) => {
                    dispatch(login(response.token));
                    localStorage.setItem('token', response.token);
                    history.push(routes.HOME);
                    return 0;
                  })
                  .catch((error: any) => {
                    if (error.code === 'ECONNABORTED') {
                      setHintError(t('connect_timeout'));
                    } else {
                      setHintError(t('email_or_password_wrong'));
                    }
                  });
              }
            }}
          >
            {t('login')}
          </button>
          <div className="signup-container">
            <div className={lng == 'fr' ? "signup-hint fr": "signup-hint"}>
              <img alt="account" src="images/icon_account.png" />
              <span>{t('have_no_account')}？</span>
            </div>
            <button
              className={lng == 'fr' ? "signup-button fr": "signup-button"}
              onClick={()=> {
                setStatus(1);
              }}
            >{t('signup')}</button>
          </div>
        </div>
      );
    }
    else if (status === 1) {
      return _renderSignupBase();
    }
    return _signupPasswordWorld();
  }

  return (
    <div className="login-container">
      <div className="main">
        <div className="left">
          <img
            src="images/login_logo.png"
            alt="login-logo"
            className="login-logo"
          />
          <img
            src="images/login_cover.png"
            alt="login-cover"
            className="login-cover"
          />
        </div>
        <div className={status == 0 ? "right" : "right signup-right"}>
          {
            _renderLoginSection()
          }
        </div>
      </div>
      <div className="bottom">
        <div className="language-list">{list}</div>
        <button
          type="button"
          className="iterm"
          onClick={() => {
            const { lng } = props;
            let lang = 'zh-CN';
            if (lng === 'en') {
              lang = 'en-US';
            } else if (lng === 'fr') {
              lang = 'fr-FR';
            }
            // eslint-disable-next-line global-require
            const { shell } = require('electron');
            shell.openExternal(
              `https://www.iioe.org/privacy-agreement?lang=${lang}`
            );
          }}
        >
          {t('term')}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default withNamespaces()(LoginScreen);
