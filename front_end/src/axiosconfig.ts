import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
 function defaultHeaders() {
  const defaultHeaders = {
    Accept: "application/json",
  };
  return defaultHeaders;
  // return _.pickBy(defaultHeaders, _.identity)
}


const requestAPI: AxiosInstance = axios.create({
  baseURL: "http://localhost:5005",
  // baseURL: "https://blogger-8e4f.onrender.com",
});
requestAPI.interceptors.request.use(  function (config: AxiosRequestConfig) {
  config.headers =  defaultHeaders();
  return config;
});

export { requestAPI };