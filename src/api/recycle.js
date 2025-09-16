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
    url: `/recycle/order/get/${id}`,
    method: 'get'
  })
}

export function deleteRecycle(id) {
  return request({
    url: `/recycle/order/delete/${id}`,
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

// 新增回收订单
export function createRecycle(data) {
  return request({
    url: '/recycle/order/create',
    method: 'post',
    data
  })
}

// 更新回收订单
export function updateRecycle(data) {
  return request({
    url: `/recycle/order/update`,
    method: 'put',
    data
  })
}

// 生成结算单PDF
export function generateSettlementPDF(orderId) {
  return request({
    url: `/recycle/order/settlement/pdf/${orderId}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 获取结算单数据
export function getSettlementData(orderId) {
  return request({
    url: `/recycle/order/settlement/data/${orderId}`,
    method: 'get'
  })
}

// 同步订单
export function syncOrder(orderId) {
  return request({
    url: `/recycle/order/sync/${orderId}`,
    method: 'post'
  })
}

// 批量同步订单
export function batchSyncOrders(orderIds) {
  return request({
    url: `/recycle/order/batch/sync`,
    method: 'post',
    data: { orderIds }
  })
} 