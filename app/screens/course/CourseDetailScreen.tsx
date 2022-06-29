import React, { useEffect, useRef, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { compose } from 'redux';
import { connect, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router';
import { SlideDown } from 'react-slidedown';
import 'react-slidedown/lib/slidedown.css';
import LoadingOverlay from 'react-loading-overlay';
import TextTruncate from 'react-text-truncate';
import routes from '../../constants/routes.json';
import { CourseApi } from '../../api/CourseApi';
import TeacherItem, {
  TeacherItemProps,
} from '../../components/course/TeacherItem';
import CommentSection, {
  CommentProps,
} from '../../components/course/CommentSection';
import { ipcRenderer } from 'electron';
import { addVideo, DownloadCourseState } from '../../features/downloadSlice';
// import CourseDAO from '../../program/CourseDAO';
import { ToastContainer, toast } from 'react-toastify';
import CommentDeletePopView from '../../components/course/CommentDeletePopView';
import ExitPopView from '../../components/course/ExitPopView';

interface CourseDetailScreenProps {
  lng: 'en' | 'zh' | 'fr';
  t: any;
  downloadList: DownloadCourseState[];
  user: any
}

interface CourseState {
  detailCover: string;
  name: string;
  categoryName: string;
  totalLessonDuration: number;
  createdDate: string;
  language: string;
  languageName: string;
  courseLearningUserCount: number;
  courseRateAverageScore: number;
  courseRateCount: number;
  educationCourseCount: number;
  educationTeacherCount: number;
  educationImageUrl: string;
  educationName: string;
  educationCountryName: string;
  educationIntro: string;
  introduction: string;
  courseDirectoryList: courseDirectoryProps[];
  courseTeacherList: TeacherItemProps[];
  isJoinLearningPlan: number;
  educationType: string;
}

interface ParamsProps {
  courseID: string;
}

interface courseLessonItemProps {
  name: string;
  duration: number;
  id: string;
  videoAddress: string;
}

interface courseDirectoryProps {
  courseLessonList: courseLessonItemProps[];
  name: string;
  id: string;
}

function CourseDetailScreen(props: CourseDetailScreenProps): JSX.Element {
  const { courseID } = useParams<ParamsProps>();
  const [course, setCourse] = useState<null | CourseState>(null);
  const [openList, setOpenList] = useState<boolean[]>([]);
  const [comment, setComment] = useState<string>('');
  const [commentList, setCommentList] = useState<CommentProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [commentPageIndex, setCommentPageIndex] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [loadedFailure, setLoadedFailure] = useState<boolean>(false);
  const [fold, setFold] = useState<boolean>(true);
  const [index, setIndex] = useState(0);
  const history = useHistory();
  const { t, lng, downloadList, user } = props;

  const introductionRef = useRef<null | HTMLDivElement>(null);
  const outlineRef = useRef<null | HTMLDivElement>(null);
  const teacherRef = useRef<null | HTMLDivElement>(null);
  const commentRef = useRef<null | HTMLElement>(null);
  const dispatch = useDispatch();

  const [deletePopview, setDeletePopview] = useState<boolean>(false);
  const [exitPopview, setExitPopview] = useState<boolean>(false);
  const [deleteCommentSaved, setDeleteCommentSaved] = useState<null | { [key: string]: any }>(null);

  function fetchCommentList(fresh = false) {
    setLoadedFailure(false);
    if (commentPageIndex !== 0) {
      setLoadingMore(true);
    }
    CourseApi.commentList(courseID, fresh ? 0 : commentPageIndex.toString())
      .then((response: any) => {
        if (response.first) {
          setCommentList(response.content);
        } else {
          setCommentList(commentList.concat(response.content));
        }
        setCommentPageIndex(commentPageIndex + 1);
        setHasMore(!response.last);
        setCommentCount(response.totalElements);
        setLoadingMore(false);
        return 0;
      })
      .catch(() => {
        setLoadingMore(false);
        setLoadedFailure(true);
      });
  }

  useEffect(() => {
    CourseApi.detail(courseID)
      .then((response: any) => {
        const list: boolean[] = [];
        for (let i = 0; i < response.courseDirectoryList.length; i += 1) {
          list.push(false);
        }
        setOpenList(list);
        setCourse(response);
        return 0;
      })
      .catch(() => {});
    fetchCommentList();
  }, []);

  useEffect(() => {
    if (course) {
      CourseApi.detail(courseID)
        .then((response: any) => {
          const list: boolean[] = [];
          for (let i = 0; i < response.courseDirectoryList.length; i += 1) {
            list.push(false);
          }
          setOpenList(list);
          setCourse(response);
          return 0;
        })
        .catch(() => {});
      fetchCommentList();
    }
  }, [lng]);

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

  function convertLessonDuration(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const minuteStr =
      minutes < 10 ? `0${minutes.toString()}` : minutes.toString();
    const secondStr =
      seconds < 10 ? `0${seconds.toString()}` : seconds.toString();
    return `${minuteStr}'${secondStr}''`;
  }

  function renderStarList(score: number): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < 5; i += 1) {
      let imageName = 'images/star.png';
      if (i * 2 < score) {
        imageName = 'images/star_active.png';
      }
      elements.push(
        <div className="star-item" key={i}>
          <img alt="star" src={imageName} />
        </div>
      );
    }
    return elements;
  }

  function renderChapterList(list: courseDirectoryProps[]): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < list.length; i += 1) {
      const items: JSX.Element[] = [];
      const lessonList:courseLessonItemProps[] = list[i].courseLessonList;
      for (let j = 0; j < lessonList.length; j += 1) {
        items.push(
          <div className="slidedown-item" key={j}>
            <p className="lesson-name">{lessonList[j].name}</p>
            <div className="right-item">
              <div className="lesson-time">
                {convertLessonDuration(lessonList[j].duration)}
              </div>
              <button
                type="button"
                className="icon-play"
                onClick={() => {
                  CourseApi.courseAddHistory(courseID, lessonList[j].id);
                  history.push(
                    `${routes.COURSEVIDEO}${courseID}/${lessonList[j].id}`
                  );
                }}
              >
                <img alt="icon-play" src="images/icon_lesson_play.png" />
              </button>
              <button
                className="button-download"
                onClick={()=> {
                  var isExist = false;
                  for (let k = 0; k < downloadList.length; k++) {
                    const element = downloadList[k];
                    if (element.lessonId == lessonList[j].id) {
                        isExist = true;
                        break;
                      }
                  }
                  if (isExist) {
                    toast(t('downloading_list'),  {
                      position: "top-center",
                      autoClose: 1500,
                      hideProgressBar: true,
                      closeOnClick: false,
                      pauseOnHover: false,
                      draggable: false,
                    });
                    console.log('-------ssss----')
                    return;
                  }
                  const sort = i * 100 + j;
                  const params = {
                    sort,
                    cover: course!.detailCover,
                    courseID,
                    chapterID: list[i].id,
                    lessonID: lessonList[j].id,
                    courseName: course!.name,
                    chapterName: list[i].name,
                    lessonName: lessonList[j].name,
                    videoUrl: lessonList[j].videoAddress,
                    now: Math.floor(Date.now() / 1000).toString(),
                    duration: lessonList[j].duration,
                  }
                  dispatch(addVideo(courseID, course!.name,list[i].id, list[i].name, lessonList[j].id, lessonList[j].name, lessonList[j].videoAddress, lessonList[j].duration));
                  toast(t('downloading_list'),  {
                    position: "top-center",
                    autoClose: 1500,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: false,
                    draggable: false,
                  });
                  setTimeout(() => {
                    ipcRenderer.send("insert_course", params);
                  }, 50);
                }}
              >{t('download')}</button>
            </div>
          </div>
        );
      }
      elements.push(
        <div className="chapter-item">
          <div
            role="button"
            className="folder-item"
            tabIndex={i}
            onClick={() => {
              openList[i] = !openList[i];
              console.log(openList);
              setOpenList(JSON.parse(JSON.stringify(openList)));
            }}
            onKeyDown={() => {}}
          >
            <p className="chapter-name">{list[i].name}</p>
            <img
              alt="icon-arrow"
              src={
                openList[i] ? 'images/icon_down.png' : 'images/icon_right.png'
              }
            />
          </div>
          <SlideDown className="dropdown-slidedown">
            {openList[i] ? items : <div />}
          </SlideDown>
        </div>
      );
    }
    return elements;
  }

  function renderTeacherList(list: TeacherItemProps[]): JSX.Element[] {
    const elements: JSX.Element[] = [];
    for (let i = 0; i < list.length; i += 1) {
      const element = list[i];
      elements.push(
        <TeacherItem
          key={i}
          headPhoto={element.headPhoto}
          name={element.name}
          intro={element.intro}
          courseText={t('open_course')}
          courseCount={element.courseCount}
          more={t('more')}
        />
      );
    }
    return elements;
  }

  function convertTime(date: string): string {
    const time1 = new Date(date);
    const day = time1.getDate() < 10 ? `0${time1.getDate()}` : time1.getDate();
    const month =
      time1.getMonth() + 1 < 10
        ? `0${time1.getMonth() + 1}`
        : time1.getMonth() + 1;
    return `${month}/${day}/${time1.getFullYear()}`;
  }

  function renderBarList(): JSX.Element[] {
    const list = [t('introduction'), t('outline'), t('teacher'), t('comments')];
    const elements: JSX.Element[] = [];
    const refList = [introductionRef, outlineRef, teacherRef, commentRef];
    for (let i = 0; i < list.length; i += 1) {
      let classText = i === index ? 'bar-title active' : 'bar-title';
      if (lng == 'fr' || lng == 'en') {
        classText += ' small';
      }
      if (i === 3 && commentCount !== 0) {
        elements.push(
          <div
            key={i}
            role="button"
            onKeyDown={() => {}}
            onClick={() => {
              setIndex(i);
              refList[i].current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }}
            tabIndex={i}
            className={classText}
          >
            {list[i]} ({commentCount})
          </div>
        );
      } else {
        elements.push(
          <div
            key={i}
            role="button"
            onKeyDown={() => {}}
            onClick={() => {
              setIndex(i);
              // eslint-disable-next-line
              refList[i].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            tabIndex={i}
            className={classText}
          >
            {list[i]}
          </div>
        );
      }
    }
    return elements;
  }

  return course ? (
    <div className="course-container">
      <div className="course">
        <div className="top">
          <div className="top-left">
            <img
              className="course-cover"
              alt="course-cover"
              src={course?.detailCover}
            />
            <button
              type="button"
              className="button-play"
              onClick={() => {
                CourseApi.courseAddHistory(courseID, course.courseDirectoryList[0].courseLessonList[0].id);
                history.push(
                  `${routes.COURSEVIDEO}${courseID}/${course.courseDirectoryList[0].courseLessonList[0].id}`
                );
              }}
            >
              <img alt="button-play" src="images/icon_play.png" />
              <p className="video-info">
                {t('view_video')}  {' | '}
                {convertDuration(course?.totalLessonDuration)}
              </p>
            </button>
          </div>
          <div className="top-right">
            <p className="course-name">{course.name}</p>
            <div className="course-recap">
              <div className="course-category" title={course.categoryName}>
                {course.categoryName}
              </div>
              <div className="course-time">
                {convertTime(course.createdDate)}
              </div>
            </div>
            <div className="course-blank" />
            <div className="course-info-main">
              <div className="main-left">
                <div className="lng">{course.language}</div>
                <div className="star-list">
                  {renderStarList(course.courseRateAverageScore)}
                </div>
                <div className="star-text">
                  {`${Math.floor(course.courseRateAverageScore / 2)}（${
                    course.courseRateCount
                  }）`}
                </div>
              </div>
              <div className="main-right">
                <div className="icon-play">
                  <img alt="icon-video" src="images/icon_video.png" />
                </div>
                <div className="icon-num">{course.courseLearningUserCount}</div>
              </div>
            </div>
            <div className="course-copyright">
              <div className="field-left">
                <img alt="organization-cover" src={course.educationImageUrl} />
              </div>
              <div className="field-right">
                <div className="field-top">
                  {t('copyright')} / {course.educationType}
                </div>
                <div className="field-main" title={course.educationName}>
                  {course.educationName}
                </div>
                <div className="field-bottom">
                  <img
                    className="icon-erath"
                    alt="icon-erath"
                    src="images/icon_erath.png"
                  />
                  <div className="country-name">
                    {course.educationCountryName}
                  </div>
                </div>
              </div>
            </div>
            <div className="course-join">
              {course.isJoinLearningPlan === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    CourseApi.addStudyPlan(courseID)
                      .then(() => {
                        course.isJoinLearningPlan = 1;
                        setCourse(JSON.parse(JSON.stringify(course)));
                        return 0;
                      })
                      .catch(() => {});
                    console.log('========ssss======click====');
                  }}
                >
                  {t('join_plan')}
                </button>
              ) : (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setExitPopview(true)
                  }}
                >
                  {t('join_plan_already')}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="header-bar">
          <div className="bar-left">{renderBarList()}</div>
          <div className="bar-right">
            <div className="bar-right-field bar-time">
              <div className="bar-img">
                <img alt="bar-img" src="images/icon_time.png" />
              </div>
              <div className="bar-right-content">
                <div className="bar-right-title">{t('study_hours')}</div>
                <div className="bar-right-value">
                  {convertDuration(course?.totalLessonDuration)}
                </div>
              </div>
            </div>
            <div className="bar-right-field">
              <div className="bar-img">
                <img alt="bar-img" src="images/icon_lng.png" />
              </div>
              <div className="bar-right-content">
                <div className="bar-right-title">{t('study_language')}</div>
                <div className="bar-right-value">{course.languageName}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="main">
          <div ref={introductionRef} className="introduction">
            <p className="introduction-title">{t('introduction')}</p>
            <p className="introduction-content">
              {fold ? (
                <TextTruncate
                  line={3}
                  element="span"
                  truncateText="…"
                  text={course.introduction}
                  textTruncateChild={(
                    <span
                      className="more"
                      tabIndex={0}
                      role="button"
                      onKeyDown={() => {}}
                      onClick={() => {
                        setFold(false);
                      }}
                    >
                      {t('more')}
                    </span>
                  )}
                />
              ) : (
                <span>{course.introduction}</span>
              )}
            </p>
          </div>
          <div ref={outlineRef} className="chapter-list">
            {renderChapterList(course.courseDirectoryList)}
          </div>
        </div>
        <div className="bottom">
          <div ref={teacherRef} className="section">
            <div className="section-header">{t('lecturer')}</div>
            <div className="teacher-list">
              {renderTeacherList(course.courseTeacherList)}
            </div>
          </div>
          <div className="section">
            <div className="section-header">{t('institute')}</div>
            <div className="organization-filed">
              <div className="organization-cover">
                <img alt="organization-cover" src={course.educationImageUrl} />
              </div>
              <div className="organization-content">
                <p className="organization-cpyright">
                  {t('copyright')} / {course.educationType}
                </p>
                <div className="organization-main">
                  <div className="organization-name">
                    {course.educationName}
                  </div>
                  <div className="organization-field">
                    <div className="organization-course">
                      <div className="field-icon">
                        <img src="images/icon_course.png" alt="icon-course" />
                      </div>
                      <div className="field">
                        <div className="filed-title">{t('open_course')}</div>
                        <div className="filed-value">
                          {course.educationCourseCount}
                        </div>
                      </div>
                    </div>
                    <div className="organization-teacher">
                      <div className="field-icon">
                        <img src="images/icon_teacher.png" alt="icon-course" />
                      </div>
                      <div className="field">
                        <div className="filed-title">{t('teacher_count')}</div>
                        <div className="filed-value">
                          {course.educationTeacherCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="organization-region">
                  <img
                    className="icon-erath"
                    alt="icon-erath"
                    src="images/icon_erath.png"
                  />
                  <div className="country-name">
                    {course.educationCountryName}
                  </div>
                </div>
                <div
                  className="organization-intro"
                  dangerouslySetInnerHTML={{ __html: course.educationIntro }}
                />
              </div>
            </div>
          </div>
        </div>
        <CommentSection
          commentRef={commentRef}
          commentList={commentList}
          commentText={t('comments')}
          commentCount={commentCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          loadedFailure={loadedFailure}
          userID={user['userId']}
          onRequestMore={() => {
            if (loadingMore) {
              return;
            }
            fetchCommentList();
          }}
          onDeleteComment= {(commentID, index) => {
            setDeletePopview(true);
            setDeleteCommentSaved( {
              commentID,
              index
            });
          }}
        />
      </div>
      <div className="comment-field">
        <input
          placeholder={t('enter_review')}
          className="comment-input"
          value={comment}
          type="text"
          onChange={(e) => {
            setComment(e.currentTarget.value);
          }}
        />
        <button
          type="button"
          className="submit-button"
          onClick={() => {
            if (comment.length > 0) {
              setLoading(true);
              CourseApi.writeComment(courseID, { content: comment })
                .then(() => {
                  setComment('');
                  setCommentPageIndex(0);
                  fetchCommentList(true);
                  setLoading(false);
                  return 0;
                })
                .catch((error: any) => {
                  toast(error['message'],  {
                    position: "top-center",
                    autoClose: 1500,
                    hideProgressBar: true,
                    closeOnClick: false,
                    pauseOnHover: false,
                    draggable: false,
                  });
                  setLoading(false);
                });
            }
          }}
        >
          {t('submit')}
        </button>
      </div>
      <LoadingOverlay active={loading} spinner />
      <ToastContainer />
      {
        deletePopview ?
        <CommentDeletePopView
          // deleteList={deleteUrlList}
          onRequestConfirm={()=> {
            setDeletePopview(false);
            CourseApi.deleteComment(courseID, deleteCommentSaved!['commentID']).then((response)=> {
              setCommentCount(commentCount -1);
              var list: [] = JSON.parse(JSON.stringify(commentList));
              list.splice(deleteCommentSaved!['index'], 1)
              setCommentList(list);
            });

          }}
          onRquestClose={()=> {
            setDeletePopview(false);
          }}
        />
        :
        <div/>
      }
      {
        exitPopview ?
        <ExitPopView
          onRequestConfirm={()=> {
            CourseApi.deleteStudyPlan(courseID)
                      .then(() => {
                        course.isJoinLearningPlan = 0;
                        setCourse(JSON.parse(JSON.stringify(course)));
                        return 0;
                      })
                      .catch(() => {});
            setTimeout(() => {
              setExitPopview(false);
            }, 300);
          }}
          onRquestClose={()=> {
            setExitPopview(false)
          }}
        />
        :
        <div/>
      }
    </div>
  ) : (
    <div />
  );
}

function makeMapStateToProps() {
  return function (state: any) {
    return {
      downloadList: state.download.downloadList,
      user: state.user.user
    };
  };
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(CourseDetailScreen) as React.ComponentType;
