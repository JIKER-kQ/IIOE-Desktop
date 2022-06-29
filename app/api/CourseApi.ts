import Api from './Api';

// eslint-disable-next-line import/prefer-default-export
export const CourseApi: { [key: string]: Function } = {};

CourseApi.detail = async (courseID: string) => {
  return Api.get(`/courses/${courseID}`);
};

CourseApi.commentList = async (courseID: string, page: string) => {
  return Api.get(`/courses/comments`, { params: { courseId: courseID, page } });
};

CourseApi.writeComment = async (courseID: string, params: { string: any }) => {
  return Api.post(`/courses/${courseID}/comments`, params);
};

CourseApi.deleteComment = async (courseID: string, commentID: String) => {
  return Api.delete(`courses/${courseID}/comments/${commentID}`);
}

CourseApi.scoreCourse = async (courseID: string, params: { string: any }) => {
  return Api.post(`/courses/${courseID}/rate`, params);
};

CourseApi.addStudyPlan = async (courseID: string) => {
  return Api.post(`/courses/${courseID}/join-course-plan`);
};

CourseApi.deleteStudyPlan = async (courseID: string) => {
  return Api.delete(`/courses/study-plans`, {params: {"courseIds": courseID}});
};

CourseApi.parseSubtitle = async (params: { string: any }) => {
  return Api.post(`/subtitles/parses`, params);
};

CourseApi.videoAddress = async (lessonID: string) => {
  return Api.get(`/courses/course-lessons/${lessonID}/video-address`);
};

CourseApi.courseHistory = async (params: { string: any }) => {
  return Api.get(`/courses/course-record/search`, {params});
};

CourseApi.coursePlan = async (params: { string: any }) => {
  return Api.get(`/courses/course-plan/search`, {params});
};

CourseApi.library = async (params: { string: any }) => {
  return Api.get(`/libraries/resources`, {params});
};

CourseApi.catergory = async () => {
  return Api.get(`/i18n/resource_categories`);
};
CourseApi.optionList = async () => {
  return Api.get(`/i18n/resource_formats`);
};

CourseApi.courseAddHistory = async (courseId: String,lessonId) => {
  var params = {};
  return Api.put(`/courses/course-plan/${courseId}/course-lesson/${lessonId}`, params);
};
