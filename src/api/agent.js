import request from '@/utils/request'

// 获取经办人分页列表
export function getAgentPage(params) {
  return request({
    url: '/api/agent/page',
    method: 'get',
    params
  })
}

// 获取经办人列表（不分页）
export function getAgentList(params) {
  return request({
    url: '/api/agent/list',
    method: 'get',
    params
  })
}

// 获取经办人详情
export function getAgentById(id) {
  return request({
    url: `/api/agent/${id}`,
    method: 'get'
  })
}

// 新增经办人
export function addAgent(data) {
  return request({
    url: '/api/agent',
    method: 'post',
    data
  })
}

// 更新经办人
export function updateAgent(id, data) {
  return request({
    url: `/api/agent/${id}`,
    method: 'put',
    data
  })
}

// 删除经办人
export function deleteAgent(id) {
  return request({
    url: `/api/agent/${id}`,
    method: 'delete'
  })
}

// 批量删除经办人
export function batchDeleteAgent(ids) {
  return request({
    url: '/api/agent/batch',
    method: 'delete',
    data: { ids }
  })
} 