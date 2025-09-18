# 业务申请单PDF生成功能

## 功能概述

业务申请单PDF生成功能是基于现有的结算单PDF生成功能开发的，用于生成标准格式的业务申请单文档。

## 文件结构

```
src/views/recycle/order/
├── SettlementPDF.vue      # 结算单PDF生成组件
└── ApplicationPDF.vue     # 业务申请单PDF生成组件

src/views/demo/
└── ApplicationPDFDemo.vue # 申请单功能演示页面

src/router/
└── index.js              # 路由配置（已更新）
```

## 功能特性

### 1. 申请单格式
- **标题**: 业务申请单
- **合同信息**: 甲方、乙方、合同编号
- **申请说明**: 按合同约定申请执行订单
- **订单信息**: 包含订单类型、内容、交付地址等详细信息
- **其他信息**: 申请时间、流转方向、走款账号等

### 2. 订单明细表格
- 支持货物、运输、服务等不同类型
- 包含分类、名称、规格型号、备注、数量、单价、总价等字段
- 自动计算总数量和总金额
- 支持不同单位的显示（kg、km等）

### 3. PDF生成功能
- 使用jsPDF和html2canvas库
- 支持多页PDF生成
- 自动分页处理
- 高清PDF输出
- 中文字体支持

### 4. 打印功能
- 浏览器打印支持
- 打印样式优化
- 自动分页处理

## 使用方法

### 1. 路由跳转

```javascript
// 使用路由参数
this.$router.push({
  name: 'ApplicationPDF',
  params: { orderId: '123' }
})

// 使用查询参数
this.$router.push({
  name: 'ApplicationPDF',
  query: { orderId: '123' }
})
```

### 2. 组件使用

```vue
<template>
  <div>
    <el-button @click="openApplicationPDF">生成申请单</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    openApplicationPDF() {
      this.$router.push({
        name: 'ApplicationPDF',
        params: { orderId: this.orderId }
      })
    }
  }
}
</script>
```

## 数据格式

### 订单数据格式

```javascript
const orderData = {
  id: '订单ID',
  no: '订单编号',
  type: '订单类型', // purchase, sales, process, storage, transport, other
  contractNo: '合同编号',
  partyA: '甲方',
  partyB: '乙方',
  processor: '经办人',
  processorPhone: '经办人电话',
  startTime: '开始时间',
  endTime: '结束时间',
  deliveryAddress: '交付地址',
  warehouseAddress: '仓库地址',
  paymentAccount: '走款账号',
  items: [
    {
      type: 'goods', // goods, transport, service, other
      name: '商品名称',
      specification: '规格型号',
      remark: '备注',
      quantity: 100,
      unitPrice: 10.5,
      amount: 1050
    }
  ]
}
```

## 样式定制

### 1. PDF模式样式

```scss
&.pdf-mode {
  .application-preview {
    padding: 20px;
    font-size: 11px;
    
    .application-title h1 {
      font-size: 24px;
    }
    
    .section-title {
      font-size: 16px;
    }
    
    table {
      font-size: 10px;
      
      th, td {
        padding: 6px;
      }
    }
  }
}
```

### 2. 响应式设计

```scss
@media (max-width: 768px) {
  .application-pdf-page {
    padding: 10px;
    
    .preview-container {
      .application-preview {
        padding: 20px;
        
        .info-item {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }
  }
}
```

## 依赖库

- **Vue.js**: 前端框架
- **Element UI**: UI组件库
- **jsPDF**: PDF生成库
- **html2canvas**: HTML转Canvas库

## 安装依赖

```bash
npm install jspdf html2canvas
```

## 注意事项

1. **中文字体支持**: PDF生成时使用默认字体，确保中文正常显示
2. **数据验证**: 确保传入的订单数据格式正确
3. **错误处理**: 包含完整的错误处理和用户提示
4. **性能优化**: 大文档生成时显示加载提示
5. **浏览器兼容**: 支持现代浏览器，IE需要polyfill

## 演示页面

访问 `/demo/application-pdf` 可以查看功能演示页面，包含：
- 功能说明
- 使用示例
- 路由信息
- 代码示例

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 支持业务申请单PDF生成
- 支持打印功能
- 响应式设计
- 完整的错误处理