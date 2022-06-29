import React, { useEffect, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { compose } from 'redux';
import PlayerContainer from '../../components/griffith';
import { CourseApi } from '../../api/CourseApi';
import RatePopView from '../../components/course/RatePopView';

interface CourseState {
  detailCover: string;
  name: string;
  categoryName: string;
  totalLessonDuration: number;
  createdDate: string;
  language: string;
  languageName: string;
  courseRateAverageScore: number;
  courseRateCount: number;
  educationCourseCount: number;
  educationTeacherCount: number;
  educationImageUrl: string;
  educationName: string;
  educationCountryName: string;
  educationIntro: string;
  introduction: string;
  courseDirectoryList: { string: any }[];
  courseTeacherList: { string: any }[];
  isJoinLearningPlan: number;
}

interface ParamsProps {
  courseID: string;
  chapterID: string;
}

interface Subtitle {
  url: string;
  startTime: number;
  content: string;
  duration: number;
}

function CoursePlayScreen(props: any): JSX.Element {
  const { courseID, chapterID } = useParams<ParamsProps>();
  const { lng } = props;
  const history = useHistory();
  const [videoID, setVideoID] = useState(chapterID);
  const [hlsSource, setHlsSource] = useState<null | {}>(null);
  const [sourceList, setSourceList] = useState<any[]>([]);
  const [course, setCourse] = useState<null | CourseState>(null);
  const [subtitleList, setSubtitleList] = useState<Subtitle[]>([]);
  const [supportHLS, setSupportHLS] = useState(true);
  const [updateTime, setUpdateTime] = useState(0);
  const [version, setVersion] = useState(false);

  function parseSubtitle(courseLessonId: string, subtitleUrl: string) {
    CourseApi.parseSubtitle({
      courseLessonId,
      subtitleUrl,
    })
      .then((response: any) => {
        console.log(response);
        setSubtitleList(response);
        return 0;
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  useEffect(() => {
    CourseApi.detail(courseID)
      .then((response: any) => {
        // eslint-disable-next-line no-console
        console.log(response);
        setCourse(response);
        setSourceList(response.courseDirectoryList);
        const { id } = response.courseDirectoryList[0].courseLessonList[0];
        const tempList =
          response.courseDirectoryList[0].courseLessonList[0].videoSubtitles;
        if (tempList.length > 0) {
          parseSubtitle(id, tempList[0].url);
        }
        playVideo(chapterID);
        return 0;
      })
      .catch((error: any) => {
        console.log(error);
        console.log('=======');
      });
  }, []);

  useEffect(() => {
    if (course) {
      CourseApi.detail(courseID)
        .then((response: any) => {
          // eslint-disable-next-line no-console
          console.log(response);
          setCourse(response);
          setSourceList(response.courseDirectoryList);
          const { id } = response.courseDirectoryList[0].courseLessonList[0];
          const tempList =
            response.courseDirectoryList[0].courseLessonList[0].videoSubtitles;
          if (tempList.length > 0) {
            parseSubtitle(id, tempList[0].url);
          }
          playVideo(chapterID);
          return 0;
        })
        .catch((error: any) => {
          console.log(error);
          console.log('=======');
        });
    }
  }, [lng]);

  function convertLessonDuration(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const minuteStr =
      minutes < 10 ? `0${minutes.toString()}` : minutes.toString();
    const secondStr =
      seconds < 10 ? `0${seconds.toString()}` : seconds.toString();
    return `${minuteStr}'${secondStr}''`;
  }

  function fetchHLSList(lessonID: string) {
    if (supportHLS) {
      CourseApi.videoAddress(lessonID)
        .then((response: any) => {
          const list = response.transcodedVideoAddresses;
          // const tagList: string[] = ['sd', 'hd', 'fhd'];
          if (list == null || list.length === 0) {
            setSupportHLS(false);
          } else {
            const result = {
              sd: {
                format: 'm3u8',
                play_url: list[0].videoAddress,
              },
              hd: {
                format: 'm3u8',
                play_url: list[1].videoAddress,
              },
              fhd: {
                format: 'm3u8',
                play_url: list[2].videoAddress,
              },
            };
            setHlsSource(result);
          }
          console.log("========xxx====");
          return 0;
        })
        .catch((error: any) => {
          console.log(error);
          console.log('=======');
        });
    }
  }

  function playVideo(id: string) {
    setVideoID(id);
    setHlsSource(null);
    fetchHLSList(id);
    const list = sourceList[0].courseLessonList;
    let tempSubtitleList: Subtitle[] = [];
    for (let i = 0; i < list.length; i += 1) {
      const element = list[i];
      if (element.id === id) {
        tempSubtitleList = element.videoSubtitles;
        break;
      }
    }
    if (tempSubtitleList.length > 0) {
      parseSubtitle(id, tempSubtitleList[0].url);
    }
  }

  function fetchNextVideoID(id: string): string {
    let nextVideoID = '';
    for (let i = 0; i < sourceList.length; i += 1) {
      const lessonList = sourceList[i].courseLessonList;
      for (let j = 0; j < lessonList.length; j += 1) {
        if (lessonList[j].id === id) {
          if (j < lessonList.length - 1) {
            nextVideoID = lessonList[j + 1].id;
          } else if (i < sourceList.length - 1) {
            nextVideoID = sourceList[i + 1].courseLessonList[0].id;
          } else {
            setVersion(true);
            console.log('============ last one =========');
          }
          break;
        }
      }
      if (nextVideoID.length > 0) {
        break;
      }
    }
    return nextVideoID;
  }

  function renderSourceList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < sourceList.length; i += 1) {
      const element = sourceList[i];

      const items: JSX.Element[] = [];
      for (let j = 0; j < element.courseLessonList.length; j += 1) {
        const item = sourceList[i].courseLessonList[j];
        if (item.id === videoID) {
          items.push(
            <div className="chapter-item">
              <div className="chapter-title">
                <span>{item.name}</span>
              </div>
              <div className="chapter-play">
                <img src="images/icon_right_play.png" alt="lesson-play" />
              </div>
            </div>
          );
        } else {
          items.push(
            <div
              role="button"
              tabIndex={i}
              className="chapter-item"
              onClick={() => {
                playVideo(item.id);
              }}
              onKeyDown={() => {}}
            >
              <div className="chapter-title">
                <span>{item.name}</span>
              </div>
              <div className="chapter-time">
                {convertLessonDuration(item.duration)}
              </div>
            </div>
          );
        }
      }
      elements.push(
        <div className="folder-field">
          <div className="folder-title">{element.name}</div>
          <div className="course-field">{items}</div>
        </div>
      );
    }
    return elements;
  }

  function convertDuration(duration: number) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    const minuteStr =
      minutes < 10 ? `0${minutes.toString()}` : minutes.toString();
    const secondStr =
      seconds < 10 ? `0${seconds.toString()}` : seconds.toString();
    return hours === 0
      ? `${minuteStr}:${secondStr}`
      : `${hours.toString()}:${minuteStr}:${secondStr}`;
  }

  function renderSubtitleList(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < subtitleList.length; i += 1) {
      const time: number = subtitleList[i].startTime;
      let className = 'subtitle-text';
      if (updateTime > time && updateTime < time + subtitleList[i].duration) {
        className = 'subtitle-text active';
      }
      elements.push(
        <div className="subtitle-item">
          <div className="subtitle-time">
            {convertDuration(Math.floor(time / 1000))}
          </div>
          <div className={className}>
            <span>{subtitleList[i].content}</span>
          </div>
        </div>
      );
    }
    return elements;
  }

  function fetchVideoURL(): string {
    let videoURL = '';
    for (let i = 0; i < sourceList.length; i += 1) {
      for (let j = 0; j < sourceList[i].courseLessonList.length; j += 1) {
        const element = sourceList[i].courseLessonList[j];
        if (element.id === videoID) {
          videoURL = element.videoAddress;
        }
      }
      if (videoURL.length > 0) {
        break;
      }
    }
    return videoURL;
  }

  function fetchVideoName(): string {
    let videoName = '';
    for (let i = 0; i < sourceList.length; i += 1) {
      for (let j = 0; j < sourceList[i].courseLessonList.length; j += 1) {
        const element = sourceList[i].courseLessonList[j];
        if (element.id === videoID) {
          videoName = element.name;
        }
      }
      if (videoName.length > 0) {
        break;
      }
    }
    return videoName;
  }

  function renderVideo(): JSX.Element {
    if (supportHLS) {
      if (hlsSource != null) {
        return (
          // @ts-ignore
          <PlayerContainer
            id={videoID}
            title=""
            autoplay
            disablePictureInPicture
            sources={hlsSource}
            defaultQuality="fhd"
            locale={lng === 'zh' ? 'zh-Hans' : 'en'}
            onEnded={() => {
              const nextVideoID = fetchNextVideoID(videoID);
              if (nextVideoID.length > 0) {
                playVideo(nextVideoID);
              }
            }}
            onTimeUpdate={(time) => {
              if (time * 1000 - 1000 > updateTime) {
                setUpdateTime(Math.floor(time * 1000));
              }
            }}
          />
        );
      }
      return <div />;
    }
    const result = {
      sd: {
        format: 'mp4',
        play_url: fetchVideoURL(),
      },
    };
    return (
      // @ts-ignore
      <PlayerContainer
        id={videoID}
        title=""
        autoplay
        disablePictureInPicture
        hiddenQualityMenu
        sources={result}
        defaultQuality="hd"
        locale={lng === 'zh' ? 'zh-Hans' : 'en'}
        onTimeUpdate={(time) => {
          if (time * 1000 - 1000 > updateTime) {
            setUpdateTime(Math.floor(time * 1000));
          }
        }}
        onEnded={() => {
          console.log("=======endss=ss=======");
          const nextVideoID = fetchNextVideoID(videoID);
          if (nextVideoID.length > 0) {
            playVideo(nextVideoID);
          }
        }}
      />
    );
  }

  return (
    <div className="video-container">
      <div className="video-section">
        <div className="video-header">
          <button
            type="button"
            onClick={() => {
              history.goBack();
            }}
          >
            <img src="images/icon_video_back.png" alt="video-button" />
          </button>
        </div>
        <div className="video-field">
          {renderVideo()}
        </div>
        <div className="subtitle-wrapper">
          <div className="subtitle-field">
            <div className="chapter-title">{fetchVideoName()}</div>
            <div className="chapter-list">{renderSubtitleList()}</div>
          </div>
        </div>
      </div>
      <div className="chapter-container">
        <div className="chapter-section">
          <div className="course-title">{course ? course.name : ''}</div>
          <div className="course-list">{renderSourceList()}</div>
        </div>
      </div>
      {
        version ? <RatePopView courseID={courseID} onRquestClose={()=> {
          setVersion(false);
        }}/>
        :
        null
      }

    </div>
  );
}

function makeMapStateToProps() {
  return function () {
    return {};
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(CoursePlayScreen) as React.ComponentType;
