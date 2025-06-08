import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
function defaultHeaders() {
  const defaultHeaders = {
    Accept: "application/json",
  };
  return defaultHeaders;
  // return _.pickBy(defaultHeaders, _.identity)
}


const requestAPI: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  // baseURL: "https://blogger-8e4f.onrender.com",
});
requestAPI.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
  const headers = defaultHeaders();
  Object.keys(headers).forEach(key => {
    config.headers.set(key, headers[key as keyof typeof headers]);
  });
  return config;
});

export { requestAPI };