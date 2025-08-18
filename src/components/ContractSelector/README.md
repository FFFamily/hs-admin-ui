# ContractSelector 合同选择器组件

## 功能描述
合同选择器组件，用于在系统中选择合同，支持单选和多选模式。

## 使用方法

### 基础用法
```vue
<template>
  <div>
    <el-button @click="showContractSelector">选择合同</el-button>
    
    <ContractSelector
      :visible.sync="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      @confirm="handleContractConfirm"
      @close="handleContractClose"
    />
  </div>
</template>

<script>
import ContractSelector from '@/components/ContractSelector'

export default {
  components: {
    ContractSelector
  },
  data() {
    return {
      contractSelectorVisible: false
    }
  },
  methods: {
    showContractSelector() {
      this.contractSelectorVisible = true
    },
    handleContractConfirm(contracts) {
      console.log('选中的合同:', contracts)
      // 处理选中的合同
    },
    handleContractClose() {
      console.log('合同选择器已关闭')
    }
  }
}
</script>
```

### 多选模式
```vue
<ContractSelector
  :visible.sync="contractSelectorVisible"
  title="选择多个合同"
  :multiple="true"
  :page-size="20"
  @confirm="handleMultipleContractConfirm"
/>
```

### 设置默认选中
```vue
<ContractSelector
  :visible.sync="contractSelectorVisible"
  :default-selected="[contract1, contract2]"
  @confirm="handleContractConfirm"
/>
```

### 禁用特定合同
```vue
<ContractSelector
  :visible.sync="contractSelectorVisible"
  :disabled-contracts="[disabledContractId1, disabledContractId2]"
  @confirm="handleContractConfirm"
/>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visible | Boolean | false | 弹框是否可见 |
| title | String | '选择合同' | 弹框标题 |
| width | String | '1000px' | 弹框宽度 |
| multiple | Boolean | false | 是否多选模式 |
| showPagination | Boolean | true | 是否显示分页 |
| pageSize | Number | 10 | 每页显示数量 |
| defaultSelected | Array | [] | 默认选中的合同数组 |
| disabledContracts | Array | [] | 禁用的合同ID数组 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 确认选择时触发 | (contracts: Array) 选中的合同数组 |
| close | 关闭弹框时触发 | - |
| update:visible | 更新visible状态时触发 | (visible: Boolean) |

## 合同数据结构

```javascript
{
  id: '合同ID',
  name: '合同名称',
  type: '合同类型', // purchase, sale, transport, process, storage, other
  partner: '合作方',
  startTime: '起始时间',
  endTime: '结束时间',
  totalAmount: '合同总金额',
  createTime: '创建时间'
}
```

## 注意事项

1. 组件依赖 `@/api/recycleContract` 中的 `getRecycleContractPage` 接口
2. 组件依赖 `@/utils` 中的 `parseTime` 工具函数
3. 搜索功能支持按合同名称、类型、合作方进行筛选
4. 单选模式下点击行即可选中，多选模式下需要勾选复选框
5. 已选择的合同会在底部显示，支持移除单个选择或清空所有选择 