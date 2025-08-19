import request from '@/utils/request'

// 分页查询资金走款
export function getFundFlowPage(params) {
  return request({
    url: '/finance/fund/flow/page',
    method: 'get',
    params
  })
}

// 获取资金走款详情
export function getFundFlowDetail(id) {
  return request({
    url: `/finance/fund/flow/${id}`,
    method: 'get'
  })
}

// 新增资金走款记录
export function addFundFlow(data) {
  return request({
    url: '/finance/fund/flow/create',
    method: 'post',
    data
  })
}

// 更新资金走款记录
export function updateFundFlow(data) {
  return request({
    url: '/finance/fund/flow/update',
    method: 'put',
    data
  })
}

// 删除资金走款记录
export function deleteFundFlow(id) {
  return request({
    url: `/finance/fund/flow/${id}`,
    method: 'delete'
  })
}

