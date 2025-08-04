import request from '@/utils/request'

// 分页获取租赁订单列表
export function getLeaseOrderListPage(params) {
  return request({
    url: '/lease/order/page',
    method: 'get',
    params
  })
}

export function getLeaseOrderDetail(params) {
  return request({
    url: '/lease/order/detail',
    method: 'get',
    params
  })
}

export function addLeaseOrder(data) {
  return request({
    url: '/lease/order/create',
    method: 'post',
    data
  })
}

export function updateLeaseOrder(data) {
  return request({
    url: '/lease/order/update',
    method: 'post',
    data
  })
}

export function deleteLeaseOrder(params) {
  return request({
    url: '/lease/order/delete',
    method: 'get',
    params
  })
}

// 更新订单状态
export function updateOrderStatus(data) {
  return request({
    url: '/lease/order/updateStatus',
    method: 'post',
    data
  })
}

// 获取订单明细列表
export function getOrderItemList(params) {
  return request({
    url: '/lease/order/item/list',
    method: 'get',
    params
  })
}

// 添加订单明细
export function addOrderItem(data) {
  return request({
    url: '/lease/order/item/add',
    method: 'post',
    data
  })
}

// 更新订单明细
export function updateOrderItem(data) {
  return request({
    url: '/lease/order/item/update',
    method: 'post',
    data
  })
}

// 删除订单明细
export function deleteOrderItem(params) {
  return request({
    url: '/lease/order/item/delete',
    method: 'get',
    params
  })
}

// 获取用户列表(用于下拉选择)
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

// 获取商品列表(用于下拉选择)
export function getGoodList(params) {
  return request({
    url: '/lease/good/list',
    method: 'get',
    params
  })
}

// 更新订单物流信息
export function updateOrderLogistics(data) {
  return request({
    url: '/lease/order/updateLogistics',
    method: 'post',
    data
  })
}