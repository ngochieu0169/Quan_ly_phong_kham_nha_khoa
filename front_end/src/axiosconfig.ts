import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
function defaultHeaders() {
  const defaultHeaders = {
    Accept: "application/json",
  };
  return defaultHeaders;
  // return _.pickBy(defaultHeaders, _.identity)
}


console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final baseURL:', import.meta.env.VITE_API_URL || "http://localhost:3000");

const requestAPI: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  // baseURL: "https://blogger-8e4f.onrender.com",
});
requestAPI.interceptors.request.use(function (config: InternalAxiosRequestConfig) {
  const headers = defaultHeaders();
  Object.keys(headers).forEach(key => {
    config.headers.set(key, headers[key as keyof typeof headers]);
  });

  // Debug log for appointment creation
  if (config.url?.includes('/lichkham') && config.method === 'post') {
    console.log('=== DEBUG axios interceptor ===');
    console.log('URL:', config.url);
    console.log('Data before interceptor:', config.data);
    console.log('Data type:', typeof config.data);
    console.log('Data stringified:', JSON.stringify(config.data));

    // Check if data has been transformed
    if (config.data && typeof config.data === 'object' && config.data.ngayDatLich) {
      console.log('ngayDatLich in interceptor:', config.data.ngayDatLich);
      console.log('ngayDatLich type:', typeof config.data.ngayDatLich);
    }
  }

  return config;
});

export { requestAPI };