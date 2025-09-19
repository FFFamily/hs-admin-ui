import request from '@/utils/request'

// 获取库存报表列表
export function getInventoryReportList(params) {
  return request({
    url: '/inventory/report/list',
    method: 'get',
    params
  })
}

// 导出库存报表
export function exportInventoryReport(params) {
  return request({
    url: '/inventory/report/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取库存明细列表
export function getInventoryDetailList(goodNo) {
  return request({
    url: `/inventory/report/detail/${goodNo}`,
    method: 'get'
  })
}
