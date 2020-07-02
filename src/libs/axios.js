import axios from "axios";
import store from "@/store";
import config from '@/config'
import { Message } from "view-design";

// const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
// create an axios instance
const service = axios.create({
  baseURL: config.baseUrl, // api 的 base_url
  timeout: 5000 // request timeout
});

// 设置post请求头
service.defaults.headers.post['Content-Type'] = 'application/json';

// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    let user_info = store.state.user.user_info
    if (user_info && user_info.token) {
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      config.headers["authorization"] = "ht " + user_info.token;
    }
    return config;
  },
  error => {
    // Do something with request error
    Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  response => {

    if (response.data.msg == "fail") {
      Message.error({
        content: response.data.data
      });
      return Promise.reject(response)
    }
    return response
  },
  error => {
    let res = error.response || {}
    if (res.status == 422 || res.status == 404 || res.status == 500) {
      Message.error({
        content: error.response.data.data || "请求失败"
      });
      return Promise.reject(res)
    } else if (res.status == 403) {
      Message.error({
        content: res.data.data
      });
      setTimeout(() => {
        store.dispatch("user/handleLogOut")
      }, 800)
      return Promise.reject(res)
    }
    return error.response || error;
  }
);

export default service