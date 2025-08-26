import request from '@/utils/request'

// 获取发票抬头列表
export function getInvoiceTitlePage(params) {
  return request({
    url: '/invoice-head/page',
    method: 'get',
    params
  })
}

// 创建发票抬头
export function createInvoiceTitle(data) {
  return request({
    url: '/invoice-head',
    method: 'post',
    data
  })
}

// 更新发票抬头
export function updateInvoiceTitle(data) {
  return request({
    url: `/invoice-head`,
    method: 'put',
    data
  })
}

// 删除发票抬头
export function deleteInvoiceTitle(id) {
  return request({
    url: `/invoice-head/${id}`,
    method: 'delete'
  })
}

// 获取发票抬头详情
export function getInvoiceTitleDetail(id) {
  return request({
    url: `/invoice-head/${id}`,
    method: 'get'
  })
}

// 设置默认发票抬头
export function setDefaultInvoiceTitle(id) {
  return request({
    url: `/invoice-head/${id}/default`,
    method: 'put'
  })
} 