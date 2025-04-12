const BASE_URL = "https://elmvale-app.onrender.com";
const CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    LOGIN: `${BASE_URL}/api/auth`,
    FORGET_PASSWORD: `${BASE_URL}/api/auth/forgotpassword`,
    RESET_PASSWORD: `${BASE_URL}/api/auth/resetpassword`,
    MEMBERSHIP_APPLY: `${BASE_URL}/api/membership/submit`,
    REGISTER_USER: `${BASE_URL}/api/auth/register`,
    CHANGE_PASSWORD: `${BASE_URL}/api/auth/changepassword`,
    UNREGISTERED_USERS: `${BASE_URL}/api/membership/getUnregisteredMembers`,
    ALL_USERS: `${BASE_URL}/api/auth/users`,
    GET_USER_PROFILEBYID: (userId) => `${BASE_URL}/api/auth/profileById?userId=${userId}`,
    USER_PROFILE: `${BASE_URL}/api/auth/profile`,
    UPLOAD_IMAGE: `${BASE_URL}/api/gallery/UploadImage`,
    ALL_IMAGES: `${BASE_URL}/api/gallery/GetAllImages`,
    GET_SINGLE_IMAGE: (imageName) => `${BASE_URL}/images/${imageName}`,
    DELETE_IMAGE: (imageId) => `${BASE_URL}/api/gallery/delete?id=${imageId}`,
    NEWS_ADD: `${BASE_URL}/api/news/add`,
    NEWS_GET_ALL: `${BASE_URL}/api/news/GetAll`,
    NEWS_DELETE: (newsId) => `${BASE_URL}/api/news/delete?id=${newsId}`,
  },
};
