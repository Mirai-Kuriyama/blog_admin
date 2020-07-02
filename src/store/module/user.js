import { login } from '@/api/user'
import router from '@/router'
import { Message } from "view-design";
export default {
  namespaced: true,
  state: {
    // userName: '',
    // userId: '',
    // avatorImgPath: '',
    access: '',
    hasGetInfo: false,

    user_info:localStorage.getItem("user_info")?JSON.parse(localStorage.getItem("user_info")):"",
    role:{
      "0":"super_admin",
      "1":"admin",
      "2":"reader",
      "3":"author"
    }
  },
  mutations: {
    setUserInfo(state,data) {
      state.user_info = data
      localStorage.setItem("user_info",JSON.stringify(data))
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    },
    setAccess (state, access) {
      state.access = access
    },
  },
  actions: {
    // 登录
    handleLogin ({state, commit }, {username, password}) {
      username = username.trim()
      return new Promise((resolve, reject) => {
        login({
          username,
          password,
        }).then(res => {
          res = res.data
          if(res.msg == "ok" && res.data.token) {
            commit('setAccess', [state.role[res.data.role+""]])
            commit('setUserInfo',res.data)
            resolve(res)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ commit }) {
      return new Promise((resolve, reject) => {
        commit('setAccess', [])
        commit('setUserInfo',"")
        localStorage.removeItem("user_info")
        router.push({
          name: 'login'
        })
        resolve()
      })
    },
  }
}
