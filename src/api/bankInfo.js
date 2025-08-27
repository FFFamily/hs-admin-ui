import request from '@/utils/request'

// 获取银行信息列表
export function getBankInfoList(params) {
  return request({
    url: '/bank/info/page',
    method: 'get',
    params
  })
}

// 获取单个银行信息
export function getBankInfo(id) {
  return request({
    url: `/bank/info/${id}`,
    method: 'get'
  })
}

// 新增银行信息
export function createBankInfo(data) {
  return request({
    url: '/bank/info',
    method: 'post',
    data
  })
}

// 更新银行信息
export function updateBankInfo(data) {
  return request({
    url: '/bank/info',
    method: 'put',
    data
  })
}

// 删除银行信息
export function deleteBankInfo(id) {
  return request({
    url: `/bank/info/${id}`,
    method: 'delete'
  })
}

// 设置默认银行信息
export function setDefaultBankInfo(id) {
  return request({
    url: `/bank/info/${id}/default`,
    method: 'put'
  })
}