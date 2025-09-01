# 结算单PDF生成功能说明

## 功能概述

本功能实现了点击结算单按钮后生成对应订单信息的结算PDF，包含以下特性：

- 完整的订单信息展示
- 订单明细表格
- 结算汇总信息
- 走款和发票信息
- 签字区域
- 支持预览、打印和下载

## 文件结构

```
src/
├── components/
│   ├── SettlementPDF/
│   │   ├── index.vue          # 结算单内容组件
│   │   └── index.js           # 组件导出文件
│   └── SettlementPDFDialog/
│       ├── index.vue          # 结算单预览弹窗组件
│       └── index.js           # 组件导出文件
├── utils/
│   └── pdfGenerator.js        # PDF生成工具类
├── api/
│   └── recycle.js             # 包含PDF生成相关API
└── views/
    ├── recycle/order/
    │   └── index.vue          # 订单列表页面（已集成）
    └── demo/
        └── SettlementPDFDemo.vue  # 演示页面
```

## 使用方法

### 1. 在订单列表中使用

在订单列表的操作列中，点击"结算单"按钮即可打开结算单预览弹窗：

```vue
<el-button size="mini" type="primary" icon="el-icon-sell" @click="handleSettlementPDF(scope.row)">
  结算单
</el-button>
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <!-- 结算单PDF弹窗 -->
    <settlement-pdf-dialog 
      :visible.sync="settlementPDFVisible" 
      :order-id="orderId"
      :order-data="orderData"
      @cancel="handleCancel" />
  </div>
</template>

<script>
import SettlementPDFDialog from '@/components/SettlementPDFDialog'

export default {
  components: {
    SettlementPDFDialog
  },
  data() {
    return {
      settlementPDFVisible: false,
      orderId: 1,
      orderData: {
        // 订单数据
      }
    }
  },
  methods: {
    handleCancel() {
      this.settlementPDFVisible = false
    }
  }
}
</script>
```

### 3. 直接使用PDF生成工具

```javascript
import { PDFGenerator } from '@/utils/pdfGenerator'

// 生成PDF
await PDFGenerator.generatePDF(element, {
  filename: 'document.pdf',
  title: '文档标题',
  format: 'a4',
  orientation: 'portrait'
})
```

## API接口

### 1. 生成结算单PDF

```javascript
// 后端API生成PDF
export function generateSettlementPDF(orderId) {
  return request({
    url: `/recycle/order/settlement/pdf/${orderId}`,
    method: 'get',
    responseType: 'blob'
  })
}
```

### 2. 获取结算单数据

```javascript
// 获取结算单数据
export function getSettlementData(orderId) {
  return request({
    url: `/recycle/order/settlement/data/${orderId}`,
    method: 'get'
  })
}
```

## 功能特性

### 1. 结算单内容

- **订单基本信息**：订单编号、类型、状态、合同信息等
- **订单明细**：货物信息、数量、价格、总价等
- **结算汇总**：订单总金额、已走款金额、本次结算金额、剩余未结算
- **走款信息**：走款银行、账号、时间、金额
- **发票信息**：发票号码、开票日期、金额、税率
- **签字区域**：经办人、财务、负责人签字

### 2. PDF生成方式

- **后端生成**：优先使用后端API生成PDF（推荐）
- **前端生成**：使用jsPDF + html2canvas生成PDF（备用方案）

### 3. 操作功能

- **预览**：在弹窗中预览结算单内容
- **生成PDF**：生成并下载PDF文件
- **打印**：直接打印结算单
- **刷新数据**：重新加载结算数据

## 依赖库

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

## 样式说明

### 1. 结算单样式

- 使用A4纸张格式（210mm × 297mm）
- 宋体字体，适合中文显示
- 专业的表格和布局设计
- 支持打印样式优化

### 2. 弹窗样式

- 大尺寸弹窗（90%宽度）
- 操作按钮栏
- 可滚动的预览区域
- 自定义滚动条样式

## 注意事项

1. **数据格式**：确保传入的订单数据包含必要的字段
2. **图片处理**：如果订单包含图片，需要确保图片可以正常加载
3. **字体支持**：PDF生成时使用系统默认字体，确保中文正常显示
4. **浏览器兼容**：建议使用现代浏览器以获得最佳体验

## 扩展功能

### 1. 自定义模板

可以通过修改 `SettlementPDF/index.vue` 来自定义结算单模板：

```vue
<template>
  <div class="settlement-pdf-container">
    <!-- 自定义结算单内容 -->
  </div>
</template>
```

### 2. 添加水印

在PDF生成工具中可以添加水印功能：

```javascript
// 在PDFGenerator中添加水印
static addWatermark(pdf, text) {
  pdf.setTextColor(200, 200, 200)
  pdf.setFontSize(20)
  pdf.text(text, 105, 148, { angle: 45, align: 'center' })
}
```

### 3. 批量生成

可以扩展支持批量生成多个订单的结算单：

```javascript
// 批量生成PDF
async generateBatchPDF(orderIds) {
  for (const orderId of orderIds) {
    await this.generateSettlementPDF(orderId)
  }
}
```

## 故障排除

### 1. PDF生成失败

- 检查网络连接
- 确认后端API是否正常
- 查看浏览器控制台错误信息

### 2. 中文显示问题

- 确保使用支持中文的字体
- 检查字符编码设置

### 3. 样式问题

- 检查CSS样式是否正确加载
- 确认打印样式是否生效

## 更新日志

- v1.0.0：初始版本，支持基本的PDF生成功能
- 支持订单信息展示
- 支持结算汇总
- 支持走款和发票信息
- 支持签字区域 