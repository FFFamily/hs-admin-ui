import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/ad/auth/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/ad/auth/getLoginInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/ad/auth/logout',
    method: 'post'
  })
}
