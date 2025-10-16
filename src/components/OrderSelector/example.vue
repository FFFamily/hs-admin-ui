<template>
  <div class="order-selector-example">
    <h2>订单选择器使用示例</h2>

    <div class="demo-section">
      <h3>单选模式</h3>
      <el-button type="primary" @click="openSingleSelector">
        选择单个订单
      </el-button>
      <div v-if="singleSelectedOrder" class="selected-info">
        <p><strong>选中的订单：</strong></p>
        <p>订单编号：{{ singleSelectedOrder.no }}</p>
        <p>合同名称：{{ singleSelectedOrder.contractName }}</p>
        <p>订单类型：{{ getOrderTypeText(singleSelectedOrder.type) }}</p>
        <p>状态：{{ getOrderStatusText(singleSelectedOrder.status) }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h3>多选模式</h3>
      <el-button type="success" @click="openMultipleSelector">
        批量选择订单
      </el-button>
      <div v-if="multipleSelectedOrders.length > 0" class="selected-info">
        <p><strong>选中的订单（{{ multipleSelectedOrders.length }}个）：</strong></p>
        <ul>
          <li v-for="order in multipleSelectedOrders" :key="order.id">
            {{ order.no }} - {{ order.contractName }} ({{ getOrderTypeText(order.type) }})
          </li>
        </ul>
      </div>
    </div>

    <div class="demo-section">
      <h3>带过滤条件的单选</h3>
      <el-button type="warning" @click="openFilteredSelector">
        选择采购订单
      </el-button>
      <div v-if="filteredSelectedOrder" class="selected-info">
        <p><strong>选中的采购订单：</strong></p>
        <p>订单编号：{{ filteredSelectedOrder.no }}</p>
        <p>合同名称：{{ filteredSelectedOrder.contractName }}</p>
      </div>
    </div>

    <!-- 订单选择器组件 -->
    <order-selector
      :visible.sync="selectorVisible"
      :title="selectorTitle"
      :multiple="isMultiple"
      :selected-orders="currentSelectedOrders"
      :show-flow-direction="showFlowDirection"
      :filters="filterConditions"
      @confirm="handleOrderSelected"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import OrderSelector from './index.vue'
import { getOrderTypeText, getOrderStatusText } from '@/constants/orderTypes'

export default {
  name: 'OrderSelectorExample',
  components: {
    OrderSelector
  },
  data() {
    return {
      // 弹窗控制
      selectorVisible: false,
      selectorTitle: '选择订单',
      isMultiple: false,
      showFlowDirection: false,

      // 选择结果
      singleSelectedOrder: null,
      multipleSelectedOrders: [],
      filteredSelectedOrder: null,

      // 过滤条件
      filterConditions: {}
    }
  },
  computed: {
    currentSelectedOrders() {
      if (this.isMultiple) {
        return this.multipleSelectedOrders
      } else if (this.singleSelectedOrder) {
        return [this.singleSelectedOrder]
      } else if (this.filteredSelectedOrder) {
        return [this.filteredSelectedOrder]
      }
      return []
    }
  },
  methods: {
    // 打开单选选择器
    openSingleSelector() {
      this.isMultiple = false
      this.selectorTitle = '选择订单'
      this.showFlowDirection = false
      this.filterConditions = {}
      this.selectorVisible = true
    },

    // 打开多选选择器
    openMultipleSelector() {
      this.isMultiple = true
      this.selectorTitle = '批量选择订单'
      this.showFlowDirection = true
      this.filterConditions = {}
      this.selectorVisible = true
    },

    // 打开带过滤条件的选择器
    openFilteredSelector() {
      this.isMultiple = false
      this.selectorTitle = '选择采购订单'
      this.showFlowDirection = false
      this.filterConditions = {
        type: 'purchase',
        status: 'processing'
      }
      this.selectorVisible = true
    },

    // 处理订单选择
    handleOrderSelected(orders) {
      if (this.isMultiple) {
        this.multipleSelectedOrders = orders
        this.$message.success(`已选择 ${orders.length} 个订单`)
      } else if (this.filterConditions.type === 'purchase') {
        this.filteredSelectedOrder = orders[0]
        this.$message.success('已选择采购订单')
      } else {
        this.singleSelectedOrder = orders[0]
        this.$message.success('已选择订单')
      }
    },

    // 取消选择
    handleCancel() {
      this.$message.info('已取消选择')
    },

    // 工具方法
    getOrderTypeText,
    getOrderStatusText
  }
}
</script>

<style lang="scss" scoped>
.order-selector-example {
  padding: 20px;

  .demo-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    h3 {
      margin-top: 0;
      color: #303133;
    }

    .el-button {
      margin-right: 10px;
    }
  }

  .selected-info {
    margin-top: 15px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;

    p {
      margin: 5px 0;
    }

    ul {
      margin: 10px 0;
      padding-left: 20px;

      li {
        margin: 5px 0;
      }
    }
  }
}
</style>
