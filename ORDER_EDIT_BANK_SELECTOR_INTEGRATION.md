# 订单编辑页面银行信息选择器集成

## 概述

成功在订单新增编辑页面中集成了银行信息选择器，用户现在可以通过点击"选择账号"按钮来选择走款账号。

## 修改内容

### 1. 组件导入
在 `src/views/recycle/order/OrderEdit.vue` 中添加了银行信息选择器的导入：

```javascript
import BankInfoSelector from '@/components/BankInfoSelector'
```

### 2. 组件注册
在组件的 `components` 选项中注册了银行信息选择器：

```javascript
components: { ContractSelector, AgentSelector, AddressSelector, BankInfoSelector, ImageUploader, PurchaseItem, SalesItem }
```

### 3. 数据属性
在 `data()` 中添加了银行信息选择器的显示状态：

```javascript
// 银行信息选择弹窗
bankInfoSelectorVisible: false,
```

在默认表单数据中添加了 `paymentAccount` 字段：

```javascript
paymentAccount: '',
```

### 4. 模板修改
在模板中添加了银行信息选择器弹窗：

```vue
<!-- 银行信息选择弹窗组件 -->
<bank-info-selector 
  :visible.sync="bankInfoSelectorVisible" 
  title="选择走款账号" 
  :multiple="false"
  @confirm="handleBankInfoSelected" 
/>
```

### 5. 方法实现
修改了 `openPaymentAccountSelector` 方法：

```javascript
// 打开走款账号选择器
openPaymentAccountSelector() {
  this.bankInfoSelectorVisible = true
},
```

添加了处理银行信息选择的方法：

```javascript
// 处理银行信息选择确认
handleBankInfoSelected(bankInfos) {
  if (bankInfos && bankInfos.length > 0) {
    const selectedBankInfo = bankInfos[0]
    // 显示格式：开户行 - 银行卡号
    this.detailData.paymentAccount = `${selectedBankInfo.bankName} - ${selectedBankInfo.cardNumber}`
    this.$message.success('走款账号选择成功')
  }
  this.bankInfoSelectorVisible = false
},
```

## 功能特性

### 1. 用户交互
- 用户点击"选择账号"按钮时，会打开银行信息选择器弹窗
- 在弹窗中可以选择银行信息（单选模式）
- 选择确认后，会自动填充走款账号字段

### 2. 数据格式
选择的银行信息会以以下格式显示：
```
开户行名称 - 银行卡号
```

例如：`中国银行 - 6222021234567890123`

### 3. 用户体验
- 选择成功后会有成功提示消息
- 弹窗会自动关闭
- 支持搜索功能（按账户ID、开户行、银行卡号搜索）
- 支持分页浏览

## 使用流程

1. 用户在订单编辑页面中点击"走款账号"字段旁的"选择账号"按钮
2. 系统打开银行信息选择器弹窗
3. 用户可以在弹窗中搜索和浏览银行信息
4. 用户选择一条银行信息并点击"确定选择"
5. 系统将选择的银行信息填充到走款账号字段
6. 显示成功提示消息并关闭弹窗

## 技术实现

### 1. 组件通信
- 使用 `visible.sync` 双向绑定控制弹窗显示状态
- 使用 `@confirm` 事件监听选择确认
- 使用 `@close` 事件监听弹窗关闭

### 2. 数据处理
- 银行信息选择器返回完整的银行信息对象
- 在订单编辑页面中提取需要的字段（开户行、银行卡号）
- 格式化显示文本

### 3. 状态管理
- 弹窗显示状态由 `bankInfoSelectorVisible` 控制
- 选择的银行信息存储在 `detailData.paymentAccount` 中

## 扩展性

该实现具有良好的扩展性：

1. **多选支持**: 如果需要支持多选银行信息，只需将 `:multiple="false"` 改为 `:multiple="true"`
2. **字段扩展**: 如果需要显示更多银行信息字段，可以修改 `handleBankInfoSelected` 方法中的格式化逻辑
3. **验证规则**: 可以为 `paymentAccount` 字段添加表单验证规则
4. **默认值**: 可以设置默认选中的银行信息

## 注意事项

1. **API依赖**: 银行信息选择器依赖 `@/api/bankInfo` 中的 `getBankInfoList` 接口
2. **数据格式**: 确保后端返回的银行信息数据格式符合组件预期
3. **错误处理**: 组件内部已包含完整的错误处理和加载状态管理
4. **样式兼容**: 银行信息选择器使用 Element UI 样式，与现有页面风格保持一致

## 测试建议

1. **功能测试**: 测试银行信息选择器的打开、搜索、选择、确认功能
2. **数据测试**: 测试不同格式的银行信息数据是否正确显示
3. **交互测试**: 测试弹窗的打开、关闭、取消等交互操作
4. **集成测试**: 测试银行信息选择与订单保存的集成功能

## 总结

通过这次集成，订单编辑页面现在具备了完整的银行信息选择功能，用户可以方便地选择走款账号，提升了用户体验和操作效率。该实现遵循了项目的组件化开发模式，保持了代码的一致性和可维护性。 