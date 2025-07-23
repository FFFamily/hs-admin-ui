import request from '@/utils/request'

export function getAdminUserList(params) {
  return request({
    url: '/admin/user/page',
    method: 'get',
    params
  })
}

export function addAdminUser(data) {
  return request({
    url: '/admin/user/add',
    method: 'post',
    data
  })
}

export function updateAdminUser(data) {
  return request({
    url: '/admin/user/update',
    method: 'post',
    data
  })
}

export function deleteAdminUser(id) {
  return request({
    url: `/admin/user/delete/${id}`,
    method: 'delete'
  })
}

export function getAdminUserInfo(id) {
  return request({
    url: `/admin/user/info/${id}`,
    method: 'get'
  })
}