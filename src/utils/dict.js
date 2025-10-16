/**
 * 字典工具类
 * 提供字典数据的缓存和快速访问方法
 */

import { getDictItemsByTypeCode } from '@/api/dict'

// 字典缓存
const dictCache = {}

/**
 * 获取字典数据（带缓存）
 * @param {string} typeCode - 字典类型编码
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Array>} 字典项列表
 */
export async function getDictData(typeCode, forceRefresh = false) {
  // 如果缓存中有数据且不强制刷新，直接返回
  if (!forceRefresh && dictCache[typeCode]) {
    return dictCache[typeCode]
  }

  try {
    const res = await getDictItemsByTypeCode(typeCode)
    if (res.code === 200 || res.code === 0) {
      const data = res.data || []
      dictCache[typeCode] = data
      return data
    }
    return []
  } catch (error) {
    console.error(`获取字典数据失败: ${typeCode}`, error)
    return []
  }
}

/**
 * 根据字典值获取标签文本
 * @param {string} typeCode - 字典类型编码
 * @param {string|number} value - 字典项值
 * @returns {Promise<string>} 标签文本
 */
export async function getDictLabel(typeCode, value) {
  const items = await getDictData(typeCode)
  const item = items.find(i => String(i.value) === String(value))
  return item ? item.label : value
}

/**
 * 根据字典标签获取值
 * @param {string} typeCode - 字典类型编码
 * @param {string} label - 字典项标签
 * @returns {Promise<string>} 字典项值
 */
export async function getDictValue(typeCode, label) {
  const items = await getDictData(typeCode)
  const item = items.find(i => i.label === label)
  return item ? item.value : ''
}

/**
 * 将字典数据转换为 Map 对象
 * @param {string} typeCode - 字典类型编码
 * @returns {Promise<Map>} 字典 Map（key: value, value: item）
 */
export async function getDictMap(typeCode) {
  const items = await getDictData(typeCode)
  const map = new Map()
  items.forEach(item => {
    map.set(item.value, item)
  })
  return map
}

/**
 * 将字典数据转换为对象
 * @param {string} typeCode - 字典类型编码
 * @returns {Promise<Object>} 字典对象（key: value, value: item）
 */
export async function getDictObject(typeCode) {
  const items = await getDictData(typeCode)
  const obj = {}
  items.forEach(item => {
    obj[item.value] = item
  })
  return obj
}

/**
 * 清除指定字典的缓存
 * @param {string} typeCode - 字典类型编码（不传则清除所有）
 */
export function clearDictCache(typeCode) {
  if (typeCode) {
    delete dictCache[typeCode]
  } else {
    Object.keys(dictCache).forEach(key => {
      delete dictCache[key]
    })
  }
}

/**
 * 预加载字典数据
 * @param {Array<string>} typeCodes - 字典类型编码数组
 */
export async function preloadDicts(typeCodes) {
  const promises = typeCodes.map(code => getDictData(code))
  await Promise.all(promises)
}

/**
 * Vue 插件：全局混入字典方法
 */
export default {
  install(Vue) {
    // 全局方法
    Vue.prototype.$getDictData = getDictData
    Vue.prototype.$getDictLabel = getDictLabel
    Vue.prototype.$getDictValue = getDictValue
    Vue.prototype.$getDictMap = getDictMap
    Vue.prototype.$getDictObject = getDictObject
    Vue.prototype.$clearDictCache = clearDictCache

    // 全局过滤器：字典值转标签
    Vue.filter('dictLabel', function(value, typeCode) {
      if (!typeCode || value === undefined || value === null) return value
      
      // 从缓存中同步获取
      const items = dictCache[typeCode] || []
      const item = items.find(i => String(i.value) === String(value))
      return item ? item.label : value
    })
  }
}

/**
 * Mixin：为组件提供字典数据
 * 
 * 使用示例：
 * export default {
 *   mixins: [dictMixin],
 *   dicts: ['gender', 'order_status'], // 需要加载的字典类型
 *   created() {
 *     // 可以直接使用 this.dict.gender
 *   }
 * }
 */
export const dictMixin = {
  data() {
    return {
      dict: {} // 存储字典数据
    }
  },
  created() {
    this.loadDicts()
  },
  methods: {
    async loadDicts() {
      if (!this.$options.dicts || !Array.isArray(this.$options.dicts)) {
        return
      }

      const promises = this.$options.dicts.map(async typeCode => {
        const data = await getDictData(typeCode)
        this.$set(this.dict, typeCode, data)
      })

      await Promise.all(promises)
    },
    
    // 刷新字典数据
    async refreshDicts() {
      if (!this.$options.dicts || !Array.isArray(this.$options.dicts)) {
        return
      }

      const promises = this.$options.dicts.map(async typeCode => {
        const data = await getDictData(typeCode, true)
        this.$set(this.dict, typeCode, data)
      })

      await Promise.all(promises)
    },

    // 根据字典值获取标签
    getDictLabel(typeCode, value) {
      if (!this.dict[typeCode]) return value
      const item = this.dict[typeCode].find(i => String(i.value) === String(value))
      return item ? item.label : value
    },

    // 根据字典标签获取值
    getDictValue(typeCode, label) {
      if (!this.dict[typeCode]) return ''
      const item = this.dict[typeCode].find(i => i.label === label)
      return item ? item.value : ''
    }
  }
}

