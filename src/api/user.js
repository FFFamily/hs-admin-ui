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

// 创建用户
export function createWxUser(data) {
  return request({
    url: '/wx/user/create',
    method: 'post',
    data
  })
}
// 用户分页列表
export function getUserPage(params) {
  return request({
    url: '/wx/user/page',
    method: 'get',
    params
  })
}

