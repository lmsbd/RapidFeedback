import axios from 'axios';
import userStore from '@/stores/userStore';

const request = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? '/api'
      : 'https://springboot-1ti1-241279-4-1418309433.sh.run.tcloudbase.com/rfo/api',

  timeout: 10000,
  withCredentials: false,
});

request.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    };

    
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
    if (error.response && error.response.status === 401) {
      userStore.logout();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default request;