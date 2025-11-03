import request from '@/utils/request'

// 获取积分规则分页列表
export function getPointsRulePage(params) {
  return request({
    url: '/points/rule/page',
    method: 'get',
    params
  })
}

// 获取积分规则详情
export function getPointsRuleDetail(id) {
  return request({
    url: `/points/rule/${id}`,
    method: 'get'
  })
}

// 创建积分规则
export function createPointsRule(data) {
  return request({
    url: '/points/rule/create',
    method: 'post',
    data
  })
}

// 更新积分规则
export function updatePointsRule(data) {
  return request({
    url: '/points/rule/update',
    method: 'put',
    data
  })
}

// 删除积分规则
export function deletePointsRule(id) {
  return request({
    url: `/points/rule/${id}`,
    method: 'delete'
  })
}

// 获取用户积分明细分页列表
export function getPointsDetailPage(params) {
  return request({
    url: '/points/detail/page',
    method: 'get',
    params
  })
}

// 获取用户积分明细详情
export function getPointsDetailInfo(id) {
  return request({
    url: `/points/detail/${id}`,
    method: 'get'
  })
}

// 导出用户积分明细
export function exportPointsDetail(params) {
  return request({
    url: '/points/detail/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 积分调整（添加或减少积分）
export function adjustPoints(data) {
  return request({
    url: '/points/detail/adjust',
    method: 'post',
    data
  })
}

