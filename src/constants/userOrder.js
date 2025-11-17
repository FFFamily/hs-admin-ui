// 用户订单阶段枚举
export const USER_ORDER_STAGE = {
  PURCHASE: 'purchase',
  TRANSPORT: 'transport',
  PROCESSING: 'processing',
  WAREHOUSING: 'warehousing',
  PENDING_SETTLEMENT: 'pending_settlement',
  COMPLETED: 'completed'
}

// 用户订单阶段选项
export const USER_ORDER_STAGE_OPTIONS = [
  { label: '采购', value: USER_ORDER_STAGE.PURCHASE },
  { label: '运输', value: USER_ORDER_STAGE.TRANSPORT },
  { label: '加工', value: USER_ORDER_STAGE.PROCESSING },
  { label: '入库', value: USER_ORDER_STAGE.WAREHOUSING },
  { label: '待结算', value: USER_ORDER_STAGE.PENDING_SETTLEMENT },
  { label: '完成', value: USER_ORDER_STAGE.COMPLETED }
]

// 用户订单状态枚举
export const USER_ORDER_STATUS = {
  WAIT_TRANSPORT: 'wait_transport',
  WAIT_SORTING: 'wait_sorting',
  WAIT_WAREHOUSING: 'wait_warehousing',
  COMPLETED: 'completed'
}

// 用户订单状态选项
export const USER_ORDER_STATUS_OPTIONS = [
  { label: '待运输', value: USER_ORDER_STATUS.WAIT_TRANSPORT },
  { label: '待分拣', value: USER_ORDER_STATUS.WAIT_SORTING },
  { label: '待入库', value: USER_ORDER_STATUS.WAIT_WAREHOUSING },
  { label: '已完成', value: USER_ORDER_STATUS.COMPLETED }
]

// 获取用户订单阶段显示文本
export function getUserOrderStageText(stage) {
  const textMap = {
    [USER_ORDER_STAGE.PURCHASE]: '采购',
    [USER_ORDER_STAGE.TRANSPORT]: '运输',
    [USER_ORDER_STAGE.PROCESSING]: '加工',
    [USER_ORDER_STAGE.WAREHOUSING]: '入库',
    [USER_ORDER_STAGE.PENDING_SETTLEMENT]: '待结算',
    [USER_ORDER_STAGE.COMPLETED]: '完成'
  }
  return textMap[stage] || stage || '--'
}

// 获取用户订单阶段标签类型
export function getUserOrderStageTagType(stage) {
  const tagTypeMap = {
    [USER_ORDER_STAGE.PURCHASE]: 'warning',
    [USER_ORDER_STAGE.TRANSPORT]: 'primary',
    [USER_ORDER_STAGE.PROCESSING]: 'success',
    [USER_ORDER_STAGE.WAREHOUSING]: 'info',
    [USER_ORDER_STAGE.PENDING_SETTLEMENT]: 'warning',
    [USER_ORDER_STAGE.COMPLETED]: 'success'
  }
  return tagTypeMap[stage] || 'info'
}

// 获取用户订单状态显示文本
export function getUserOrderStatusText(status) {
  const textMap = {
    [USER_ORDER_STATUS.WAIT_TRANSPORT]: '待运输',
    [USER_ORDER_STATUS.WAIT_SORTING]: '待分拣',
    [USER_ORDER_STATUS.WAIT_WAREHOUSING]: '待入库',
    [USER_ORDER_STATUS.COMPLETED]: '已完成'
  }
  return textMap[status] || status || '--'
}

// 获取用户订单状态标签类型
export function getUserOrderStatusTagType(status) {
  const tagTypeMap = {
    [USER_ORDER_STATUS.WAIT_TRANSPORT]: 'warning',
    [USER_ORDER_STATUS.WAIT_SORTING]: 'warning',
    [USER_ORDER_STATUS.WAIT_WAREHOUSING]: 'warning',
    [USER_ORDER_STATUS.COMPLETED]: 'success'
  }
  return tagTypeMap[status] || 'info'
}

// 计价方式枚举
export const PRICING_METHOD = {
  SIMPLE: 'simple',
  GENERAL: 'general'
}

// 计价方式选项
export const PRICING_METHOD_OPTIONS = [
  { label: '简单计价', value: PRICING_METHOD.SIMPLE },
  { label: '一般计价', value: PRICING_METHOD.GENERAL }
]

// 获取计价方式显示文本
export function getPricingMethodText(method) {
  const textMap = {
    [PRICING_METHOD.SIMPLE]: '简单计价',
    [PRICING_METHOD.GENERAL]: '一般计价'
  }
  return textMap[method] || method || '--'
}

