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
// 分配专人
export function assignRecycle(params) {
  return request({
    url: `/recycle/order/assign`,
    method: 'get',
    params
  })
} 