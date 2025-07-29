import request from '@/utils/request'

export function getContractList(params) {
  return request({
    url: '/sys/contract/list',
    method: 'get',
    params
  })
}
export function getContractPage(params) {
  return request({
    url: '/sys/contract/page',
    method: 'get',
    params
  })
}

export function getContractDetail(id) {
  return request({
    url: `/sys/contract/${id}`,
    method: 'get'
  })
}
export function addContract(data) {
  return request({
    url: '/sys/contract',
    method: 'post',
    data
  })
}
export function updateContract(id, data) {
  return request({
    url: `/sys/contract`,
    method: 'put',
    data
  })
}
export function deleteContract(id) {
  return request({
    url: `/sys/contract/${id}`,
    method: 'delete'
  })
}   