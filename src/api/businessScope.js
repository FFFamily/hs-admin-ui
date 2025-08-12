import request from '@/utils/request'

// 获取经营范围分页列表
export function getBusinessScopePage(params) {
  return request({
    url: '/business-scope/page',
    method: 'get',
    params
  })
}

// 获取经营范围详情
export function getBusinessScopeDetail(id) {
  return request({
    url: `/business-scope/${id}`,
    method: 'get'
  })
}

// 新增经营范围
export function createBusinessScope(data) {
  return request({
    url: '/business-scope',
    method: 'post',
    data
  })
}

// 更新经营范围
export function updateBusinessScope(id, data) {
  return request({
    url: `/business-scope/${id}`,
    method: 'put',
    data
  })
}

// 删除经营范围
export function deleteBusinessScope(id) {
  return request({
    url: `/business-scope/${id}`,
    method: 'delete'
  })
}

// 批量删除经营范围
export function batchDeleteBusinessScope(ids) {
  return request({
    url: '/business-scope/batch',
    method: 'delete',
    data: { ids }
  })
} 