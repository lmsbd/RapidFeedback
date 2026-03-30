import axios from 'axios';
import userStore from '@/stores/userStore';

const request = axios.create({
  //   baseURL: process.env.NODE_ENV === 'development'
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
  withCredentials: false, // cookie
});

request.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    };

    // If user is logged in, add JWT token to request headers
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // If 401 unauthorized, clear login status
    if (error.response && error.response.status === 401) {
      userStore.logout();
      // Can add redirect to login page logic here
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default request;
