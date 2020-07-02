


// let dev = 'http://127.0.0.1:3166/'
let dev = 'http://127.0.0.1:7001/'
let pro = 'http://47.114.191.169/'
let url = process.env.NODE_ENV === 'development' ? dev : pro
export default {
  /**
   * @description token在Cookie中存储的天数，默认1天
   */
  cookieExpires: 1,
  /**
   * @description 是否使用国际化，默认为false
   *              如果不使用，则需要在路由中给需要在菜单中展示的路由设置meta: {title: 'xxx'}
   *              用来在菜单中显示文字
   */
  useI18n: false,
  /**
   * @description api请求基础路径
   */
  baseUrl: url,
  // imgBaseUrl:"http://qc6b8voeh.bkt.clouddn.com/", // 七牛临时
  imgBaseUrl:"http://mini-tinyblog.oss-accelerate.aliyuncs.com/", // 阿里
  /**
   * @description 默认打开的首页的路由name值，默认为home
   */
  homeName: 'home',
  /**
   * @description 需要加载的插件
   */
  plugin: {
    // 'error-store': {
    //   showInHeader: true, // 设为false后不会在顶部显示错误日志徽标
    //   developmentOff: false // 设为true后在开发环境不会收集错误信息，方便开发中排查错误
    // }
  }
}
