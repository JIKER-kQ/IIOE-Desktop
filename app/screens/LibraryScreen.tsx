import React, { forwardRef, useEffect, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { ipcRenderer } from 'electron';
import TextTruncate from 'react-text-truncate';
import { CourseApi } from '../api/CourseApi';
import DatePicker from "react-datepicker";
import Select, { ClearIndicatorProps, GroupBase, StylesConfig } from 'react-select';
import ReactLoading from 'react-loading';

interface LibraryScreenProps {
  lng: 'en' | 'zh' | 'fr';
  t: any
}


function LibraryScreen(props: LibraryScreenProps) {
  const { t, lng } = props;
  const [index, setIndex] = useState(0);
  const [downloadIndex, setDownloadIndex] = useState(-1);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [lastestList, setLastestList] = useState<any[]>([]);
  const [sourceList, setSourceList] = useState<any[] | null>(null);
  const [target, setTarget] = useState<any>(null);
  const [startDate, setStartDate] = useState<null | Date>(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [optionList, setOptionList] = useState<any[]>([]);
  // const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loadedFailure, setLoadedFailure] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(0);

  useEffect(()=> {
    var params = {'size': 4};
    CourseApi.library(params).then((response) => {
      setLastestList(response['content']);
    });
  }, [lng]);

  useEffect(()=> {
    _fetchSourceList(index, null, null);
  }, [lng]);

  useEffect(()=> {
    CourseApi.catergory().then((response) => {
      setCategoryList(response)
      console.log(response);
    });
  }, [lng]);

  useEffect(()=> {
    CourseApi.optionList().then((response: any[]) => {
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
      setOptionList(list);
    });
  }, [lng]);

  function _fetchSourceList(categoryIndex: number, date: null|Date, value: null | {String: String}) {
    var params = {
      'size': 20,
      "resourceType":"SYSTEM",
      "page": 0
    };
    if (categoryIndex > 0) {
      params["categoryCode"] = categoryList[categoryIndex - 1]['code'];
    }
    if (date) {
      params['year'] = date.getFullYear();
    }
    if (value) {
      params['formatCode'] = value['value'];
    }
    CourseApi.library(params).then((response) => {
      setSourceList(response['content']);
      setHasMore(!response.last);
      setPageIndex(1);
    });
  }

  function _fetchMoreSourceList() {
    setLoadingMore(true);
    setLoadedFailure(false);
    var params = {
      'size': 20,
      "resourceType":"SYSTEM",
      "page": pageIndex
    };
    if (index > 0) {
      params["categoryCode"] = categoryList[index - 1]['code'];
    }
    if (startDate) {
      params['year'] = startDate.getFullYear();
    }
    if (selectedOption) {
      params['formatCode'] = selectedOption['value'];
    }
    CourseApi.library(params).then((response) => {
      setSourceList(sourceList!.concat(response.content));
      setHasMore(!response.last);
      setLoadingMore(false);
      setPageIndex(pageIndex + 1);
    }).catch((error)=> {
      setLoadingMore(false);
      setLoadedFailure(true);
    });
  }

  function _renderLastestList(): JSX.Element {
    var list: JSX.Element[] = [];
    for (let index = 0; index < lastestList.length; index++) {
      const element = lastestList[index];
      var llist: JSX.Element[] = [];
      var languageList: String[] = element['supportLanguages'];
      for (let i = 0; i < languageList.length; i++) {
        llist.push(
          <div className="language-item">{languageList[i].split('-')[0]}</div>
        );
      }
      list.push(
        <div className="main-item">
          <img alt="cover" src={element['cover']}/>
          <div className="item-content">
            <div className="title">
              <TextTruncate
                  line={2}
                  element="span"
                  truncateText="…"
                  text={element['name']}
                />
            </div>
            <div className="language-list">
              {
                llist
              }
            </div>
          </div>
          <button className="download-button" onClick={()=> {
            setTarget(element);
          }}>{t('download')}</button>
        </div>
      );
    }
    if (list.length === 0) {
      for (let index = 0; index < 4; index++) {
        list.push(<div className="main-item"/>);
      }
    }
    return (
      <div className="main-content">
        {
          list
        }
      </div>
    )
  }

  function _renderSourceList() {
    var list: JSX.Element[] = [];
    for (let index = 0;  sourceList != null && index < sourceList.length; index++) {
      const element = sourceList[index];
      var llist: JSX.Element[] = [];
      var languageList: String[] = element['supportLanguages'];
      for (let i = 0; i < languageList.length; i++) {
        llist.push(
          <div className="language-item">{languageList[i].split('-')[0]}</div>
        );
      }
      list.push(
        <div className="source-item">
            <img alt="cover" src={element['cover']}/>
            <div className="item-right">
              <div className="item-title">
                <TextTruncate
                    line={4}
                    element="span"
                    truncateText="…"
                    text={element['name']}
                  />
              </div>
              <div className="language-list">
                {llist}
              </div>
            </div>
            <button className="download-button" onClick={()=> {
              setTarget(element);
            }}>{t('download')}</button>
          </div>
      );
    }
    if (sourceList === null) {
      for (let index = 0; index < 8; index++) {
        list.push(<div className="source-item"/>);
      }
    }
    else if (list.length === 0) {
      return (
        <div className="source-content empty-content">
          <img alt="empty" src="images/icon_library_empty.png" />
          <div className="empty-text">{t('library_empty_text')}</div>
        </div>
      )
    }
    return (
      <div className="source-content">
        {
          list
        }
      </div>
    )
  }

  function renderHasMore(): JSX.Element {
    if (hasMore && !loadingMore && !loadedFailure) {
      return (
        <div className="more-field">
          <button
            type="button"
            className="has-more-button"
            onClick={() => {
              _fetchMoreSourceList();
            }}
          >
            <span>{t('see_more')}</span>
            <img alt="img-more" src="images/icon_load_more.png" />
          </button>
        </div>
      );
    }
    return <div />;
  }

  function renderLoading(): JSX.Element {
    if (hasMore && loadingMore && !loadedFailure) {
      return (
        <div className="more-field">
          <div className="icon-loading">
            <ReactLoading
              type="spokes"
              color="#0175D2"
              height={50}
              width={50}
            />
          </div>
        </div>
      );
    }
    return <div />;
  }

  function renderLoadedFailure(): JSX.Element {
    if (hasMore && !loadingMore && loadedFailure) {
      return (
        <div className="more-field">
          <button
            type="button"
            className="has-more-button"
            onClick={() => {
              _fetchMoreSourceList();
            }}
          >
            <span>{t('load_failed')}, {t('click_to_retry')}</span>
            <img alt="img-more" src="images/icon_load_more.png" />
          </button>
        </div>
      );
    }
    return <div />;
  }

  function _renderCategoryList() {
    const elements: JSX.Element[] = [];
    const list = JSON.parse(JSON.stringify(categoryList));
    if (list.length > 0) {
      list.unshift({
        "name": t('all'),
        "code": ""
      })
    }
    for (let i = 0; i < list.length; i++) {
      if (i === index) {
        elements.push(
          <button className="category-item active">{list[i]['name']}</button>
        );
      }
      else {
        elements.push(
          <button
            className="category-item"
            onClick={() => {
              _fetchSourceList(i, startDate, selectedOption);
              setIndex(i);
            }}>{list[i]['name']}</button>
        );
      }
    }

    const customStyles: StylesConfig<any, true, GroupBase<any>> = {
      menu: (provided, state) => ({
        ...provided,
        width: 140,
        margin: "10px 0",
        color: "#666666",
        textAlign: "center",
        cursor: 'pointer'
      }),
      control: () => ({
        display: 'flex',
        width: 132,
        height: 32,
        paddingLeft: 8,
        borderRadius: 16,
        cursor: 'pointer',
        backgroundColor: '#ffffff'
      }),
      indicatorSeparator: ()=> ({
        display: 'none',
      }),
      indicatorsContainer: ()=> ({
        position: 'relative'
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

    function handleChange(value:any) {
      _fetchSourceList(index, startDate, value);
      setSelectedOption(value);
    }

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => {
      if (startDate == null) {
        return (
          <button className="date-custom-input" onClick={onClick} ref={ref}>
            <span>{value && value.length > 0 ? value:t('date')}</span>
            <img src="images/icon_arrow_down.png" alt="down" />
          </button>
        )
      }
      else {
        return (
          <button className="date-custom-input hasValue" onClick={onClick} ref={ref}>
            <span>{value && value.length > 0 ? value:t('date')}</span>
            <img src="images/icon_arrow_down.png" alt="down" />
            <button className="delete-button" onClick={(e: any)=> {e.stopPropagation();  _fetchSourceList(index, null, selectedOption);setStartDate(null);}}>
              <img src="images/icon_library_delete.png" alt="delete" />
            </button>
          </button>
        )
      }
    });

    const ClearIndicator = (props: ClearIndicatorProps<any, true>) => {
      const {
        children = <button className="delete-select-button" onClick={(e: any)=> {e.stopPropagation(); _fetchSourceList(index, startDate, null);setSelectedOption(null);}}><img src="images/icon_library_delete.png" alt="delete" /></button> ,
        getStyles,
        innerProps: { ref, ...restInnerProps },
      } = props;
      return (
        <div
          {...restInnerProps}
          ref={ref}
          className="delete-button-container"
        >
          {children}
        </div>
      );
    };

    return (
      <div className="main-category">
        <div className="category-list">
          {elements}
        </div>
        <div className="section-right">
          <div className="year-field">
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                _fetchSourceList(index, date, selectedOption);
                setStartDate(date)
              }}
              showYearPicker
              dateFormat="yyyy"
              customInput={<ExampleCustomInput />}
              yearItemNumber={9}
            />
          </div>
          <Select
            className="select-control"
            defaultValue={selectedOption}
            onChange={handleChange}
            options={optionList}
            isSearchable={false}
            isClearable ={true}
            styles={customStyles}
            placeholder={t('format')}
            components={{ ClearIndicator }}
          />
        </div>
      </div>
    )
  }

  function _renderDownloadSection(): JSX.Element {
    const elements:JSX.Element[] = [];
    for (let i = 0; i < target['attachments'].length; i++) {
      const item = target['attachments'][i];
      const num = (item['size'] / 1024.0).toFixed(2) + 'M';
      var name = "中文";
      if (item['lang'] == "en-US") {
        name = "English";
      }
      else if (item['lang'] == "fr-FR") {
        name = "Français";
      }
      elements.push(
        <button className={downloadIndex == i ? "download-item active" : "download-item"} onClick={()=> {
          setDownloadIndex(i);
          if (downloadIndex != i) {
            ipcRenderer.send("download-file", item['url']);
          }
        }}>
          <span>{name}</span>
          <span>{num}</span>
        </button>
      );
    }
    return (
      <div className="download-list">
        {elements}
      </div>
    )
  }

  function _onHandlerPopClosed() {
    setDownloadIndex(-1);
    setTarget(null);
  }

  return (
    <div className="library-container">
      <div className="top">
        <div className="top-main">
          <div className="main-title">IIOE</div>
          <div className="main-desc">
            <div className="desc-header">{t('library')}</div>
            <div className="desc-text">{t('library_subtitle')}</div>
            <div className="desc-text">{t('library_slogan')}</div>
          </div>
        </div>
      </div>
      <div className="main">
        <div className="main-header">{t('latest')}</div>
        {
          _renderLastestList()
        }
      </div>
      <div className="bottom">
        <div className="main-header">{t('library_all')}</div>
        {_renderCategoryList()}
        {_renderSourceList()}
        {renderHasMore()}
        {renderLoading()}
        {renderLoadedFailure()}
      </div>
      {
        target == null ?
        <div/>
        :
        <div className="source-pop-view">
          <button className="mask" onClick={()=> {_onHandlerPopClosed()}}/>
          <div className="pop-content">
            <div className="content-top">
              <img src={target['cover']}/>
              <div className="titile">{target['name']}</div>
            </div>
            <div className="download-field">
              <div className="download-header">{t('download')}</div>
              {
                _renderDownloadSection()
              }
            </div>
            <button className="close-button" onClick={()=> {_onHandlerPopClosed()}}>
              <img src="images/icon_library_close.png" alt="close" />
            </button>
          </div>
        </div>
      }
    </div>
  )
}


function makeMapStateToProps() {
  return function(state: any) {
    return {
      offlineList: state.offline.offlineList,
    };
  }
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(LibraryScreen) as React.ComponentType;

