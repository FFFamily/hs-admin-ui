import request from '@/utils/request'

/**
 * 字典管理 API
 */

// ==================== 字典类型相关 ====================

/**
 * 获取字典类型列表
 */
export function getDictTypeList(params) {
  return request({
    url: '/system/dict/type/all',
    method: 'get',
    params
  })
}

/**
 * 创建字典类型
 */
export function createDictType(data) {
  return request({
    url: '/system/dict/type/create',
    method: 'post',
    data
  })
}

/**
 * 更新字典类型
 */
export function updateDictType(data) {
  return request({
    url: '/system/dict/type/update',
    method: 'put',
    data
  })
}

/**
 * 删除字典类型
 */
export function deleteDictType(id) {
  return request({
    url: `/system/dict/type/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID获取字典类型详情
 */
export function getDictTypeById(id) {
  return request({
    url: `/system/dict/type/${id}`,
    method: 'get'
  })
}

// ==================== 字典项相关 ====================

/**
 * 分页获取字典项列表
 */
export function getDictItemPage(params) {
  return request({
    url: '/system/dict/data/page',
    method: 'get',
    params
  })
}

/**
 * 根据类型编码获取字典项列表
 */
export function getDictItemsByTypeCode(typeCode) {
  return request({
    url: `/system/dict/data/type/${typeCode}`,
    method: 'get'
  })
}

/**
 * 创建字典项
 */
export function createDictItem(data) {
  return request({
    url: '/system/dict/data/create',
    method: 'post',
    data
  })
}

/**
 * 更新字典项
 */
export function updateDictItem(data) {
  return request({
    url: '/system/dict/data/update',
    method: 'put',
    data
  })
}

/**
 * 删除字典项
 */
export function deleteDictItem(id) {
  return request({
    url: `/system/dict/data/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID获取字典项详情
 */
export function getDictItemById(id) {
  return request({
    url: `/system/dict/data/${id}`,
    method: 'get'
  })
}

/**
 * 批量删除字典项
 */
export function batchDeleteDictItems(ids) {
  return request({
    url: '/system/dict/data/batch/delete',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 更新字典项排序
 */
export function updateDictItemSort(data) {
  return request({
    url: '/system/dict/data/sort/update',
    method: 'put',
    data
  })
}

