import request from '@/utils/request'

export function getRecyclePage(params) {
  return request({
    url: '/recycle/order/page',
    method: 'get',
    params
  })
}

export function getRecycleDetail(id) {
  return request({
    url: `/recycle/order/${id}`,
    method: 'get'
  })
}

export function deleteRecycle(id) {
  return request({
    url: `/recycle/order/${id}`,
    method: 'delete'
  })
}

export function approveRecycle(id) {
  return request({
    url: `/recycle/order/${id}/approve`,
    method: 'put'
  })
} 