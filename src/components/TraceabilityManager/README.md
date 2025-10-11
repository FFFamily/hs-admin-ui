# 货物追溯管理系统

## 概述

货物追溯管理系统是为了满足复杂的货物流转业务需求而设计的，支持货物在采购-运输-加工-仓储-销售五个步骤中的完整追溯。

## 核心功能

### 1. 识别码管理
- **订单识别码**: 每个订单只有一个主识别码，订单中的所有货物都使用此识别码（手动输入）
- **源识别码**: 记录货物的来源，支持多个源识别码（用于合并、分拆等场景）
- **业务规则**: 用户可以手动选择使用进项或销项明细，根据实际业务需要决定

### 2. 流转步骤管理
支持五个主要流转步骤：
- 采购 (Purchase)
- 运输 (Transport) 
- 加工 (Process)
- 仓储 (Storage)
- 销售 (Sales)

### 3. 变更原因追踪
记录识别码变更的原因：
- 初始创建
- 合并批次
- 分拆批次
- 重新加工
- 重新包装
- 品质变化
- 分类变化
- 其他原因

### 4. 追溯链可视化
- 时间轴展示货物完整流转历程
- 支持查看每个步骤的详细信息
- 关系图谱展示复杂的货物关联关系

## 使用场景

### 场景1: 简单流转
```
采购订单(识别码1) → 运输订单(识别码2) → 仓储订单(识别码3) → 销售订单(识别码4)
源识别码关系: 2→1, 3→2, 4→3
```

### 场景2: 加工分拆
```
采购订单(识别码1) → 加工订单A(识别码2) + 加工订单B(识别码3)
源识别码关系: 2→1, 3→1
```

### 场景3: 合并加工
```
采购订单A(识别码1) + 采购订单B(识别码2) → 加工订单(识别码3)
源识别码关系: 3→1,2
```

### 场景4: 多次加工
```
采购订单(识别码1) → 加工订单1(识别码2) → 加工订单2(识别码3)
源识别码关系: 2→1, 3→2
```

## 组件结构

```
TraceabilityManager/
├── index.vue                          # 主组件
├── TraceabilityChain.vue              # 追溯链可视化
├── InventoryIdentifyCodeSelector.vue  # 库存识别码选择器
├── index.js                           # 入口文件
└── README.md                          # 文档
```

## API接口

### 获取追溯数据
```javascript
GET /api/traceability/chain/{identifyCode}
```

### 保存追溯数据
```javascript
POST /api/traceability/save
{
  "currentIdentifyCode": "PUR20241011ABC123",
  "currentFlowStep": "purchase",
  "sourceCodes": [
    {
      "identifyCode": "STO20241010DEF456",
      "changeReason": "reprocess"
    }
  ]
}
```

### 查询库存识别码
```javascript
GET /api/inventory/identify-codes
```

## 数据模型

### 追溯数据结构
```javascript
{
  currentIdentifyCode: String,    // 当前识别码
  currentFlowStep: String,        // 当前流转步骤
  sourceCodes: [                  // 源识别码数组
    {
      identifyCode: String,       // 源识别码
      flowStep: String,           // 源流转步骤
      goodName: String,           // 货物名称
      goodCount: Number,          // 货物数量
      goodWeight: String,         // 货物重量
      changeReason: String        // 变更原因
    }
  ]
}
```

### 追溯链数据结构
```javascript
{
  identifyCode: String,           // 识别码
  flowStep: String,               // 流转步骤
  createTime: String,             // 创建时间
  operationTime: String,          // 操作时间
  processor: String,              // 操作人
  location: String,               // 操作地点
  orderId: String,                // 关联订单ID
  goods: [                        // 货物信息
    {
      goodNo: String,             // 货物编号
      goodName: String,           // 货物名称
      goodCount: Number,          // 数量
      goodWeight: String,         // 重量
      goodStatus: String          // 货物状态
    }
  ],
  sourceCodes: [                  // 源识别码
    {
      identifyCode: String,       // 源识别码
      changeReason: String        // 变更原因
    }
  ],
  remark: String                  // 备注
}
```

## 使用示例

### 在订单编辑页面中使用
```vue
<template>
  <traceability-manager 
    v-model="orderData.traceabilityData"
    :order-type="orderData.type"
    :can-edit-identify-code="dialogMode === 'add'"
    @change="handleTraceabilityChange"
  />
</template>

<script>
import TraceabilityManager from '@/components/TraceabilityManager'

export default {
  components: {
    TraceabilityManager
  },
  data() {
    return {
      orderData: {
        traceabilityData: {
          currentIdentifyCode: '',
          currentFlowStep: '',
          sourceCodes: []
        }
      }
    }
  },
  methods: {
    handleTraceabilityChange(data) {
      // 处理追溯数据变更
      console.log('追溯数据变更:', data)
    }
  }
}
</script>
```

## 注意事项

1. **识别码唯一性**: 每个识别码在系统中必须唯一，请确保手动输入时不重复
2. **识别码规范**: 建议按照公司规范格式输入识别码，便于管理和查询
3. **流转步骤顺序**: 虽然支持灵活的流转，但建议按照业务逻辑顺序进行
4. **数据完整性**: 确保每次变更都记录完整的源识别码和变更原因
5. **手动输入验证**: 建议在输入识别码时进行格式和重复性验证
6. **性能考虑**: 对于大量数据的追溯查询，建议使用分页和索引优化

## 扩展功能

1. **二维码生成**: 为每个识别码生成二维码，便于现场扫描
2. **批量操作**: 支持批量生成识别码和批量关联
3. **报表统计**: 基于追溯数据生成各种统计报表
4. **预警机制**: 当货物流转异常时自动预警
5. **移动端支持**: 开发移动端应用，支持现场操作
