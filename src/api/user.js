import axios from '@/libs/axios'

export const login = ({ username, password }) => {
  const data = {
    username,
    password,
  }
  return axios.request({
    url: 'api/login',
    data,
    method: 'post'
  })
}

export const logout = (token) => {
  return axios.request({
    url: 'api/logout',
    method: 'get'
  })
}
