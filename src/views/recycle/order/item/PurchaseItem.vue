<template>
  <div class="purchase-item">
    <!-- 订单明细 -->
    <el-divider content-position="left">订单明细</el-divider>
    <el-form>
      <el-form-item>
        <el-button type="primary" @click="clearAllPrices">货物单价清零</el-button>
        <el-button type="primary" @click="addOrderItem">新增行</el-button>
        <el-button type="success" icon="el-icon-refresh" @click="openOrderListDialog">同步订单明细</el-button>
        <el-button type="danger" @click="deleteSelectedItems" :disabled="selectedItems.length === 0">删除行</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="items" border fit style="width: 100%" v-loading="itemsLoading"
      @selection-change="handleSelectionChange" :show-summary="true" :summary-method="getPurchaseSummary">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="goodNo" label="货物编号" fixed="left" width="180" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodNo" placeholder="选择货物" :disabled="!scope.row.goodNo" readonly>
              <el-button slot="append" icon="el-icon-search" @click="openBusinessScopeSelector(scope.$index)">
              </el-button>
            </el-input>
        </template>
      </el-table-column>
      <el-table-column prop="goodType" label="货物分类" width="160" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodType" placeholder="请输入货物分类" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodName" placeholder="请输入货物名称" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodModel" label="货物型号" width="140" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodModel" placeholder="请输入货物型号" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodCount" label="货物数量" width="210" align="center">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.goodCount" :min="1" :precision="0"
            @change="onItemFieldChange(scope.row)" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodWeight" label="货物重量" width="120" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodWeight" placeholder="请输入货物重量" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column prop="goodPrice" label="货物单价" width="210" align="center">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.goodPrice" :min="0" :precision="2" 
            @change="onItemFieldChange(scope.row)" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
   
      <el-table-column prop="goodRemark" label="货物备注" min-width="180">
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodRemark" placeholder="请输入备注" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column label="评级系数" width="200" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodRating" placeholder="请输入评级系数" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column label="评级调价" width="200" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.goodRatingPrice" placeholder="请输入评级调价" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <el-table-column label="其他调价" width="200" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.otherRatingPrice" placeholder="请输入其他调价" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column>
      <!-- <el-table-column label="订单金额" width="210" align="center">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.orderAmount" placeholder="订单金额" :disabled="!scope.row.goodNo" />
        </template>
      </el-table-column> -->
         <el-table-column prop="goodTotalPrice" label="货物总价" width="160" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.goodTotalPrice) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 经营范围选择器 -->
    <BusinessScopeSelector :visible.sync="businessScopeSelectorVisible" title="选择经营范围" :multiple="false"
      :only-show-enabled="true" @confirm="handleBusinessScopeConfirm" @close="handleBusinessScopeClose" />
    
    <!-- 订单列表弹窗组件 -->
    <order-list-dialog 
      :visible.sync="orderListVisible" 
      @sync-items="handleSyncOrderItems"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import BusinessScopeSelector from '@/components/BusinessScopeSelector'
import OrderListDialog from '../OrderListDialog.vue'

export default {
  name: 'PurchaseItem',
  components: {
    BusinessScopeSelector,
    OrderListDialog
  },
  props: {
    dialogMode: {
      type: String,
      default: 'add'
    },
    items: {
      type: Array,
      default: () => []
    },
    orderData: {
      type: Object,
      default: () => { }
    },
    itemsLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedItems: [],
      businessScopeSelectorVisible: false,
      currentRowIndex: -1, // 当前操作的行索引
      orderListVisible: false // 订单列表弹窗
    }
  },
  methods: {
    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
      this.$emit('selection-change', selection)
    },

    // 打开经营范围选择器
    openBusinessScopeSelector(rowIndex) {
      this.currentRowIndex = rowIndex
      this.businessScopeSelectorVisible = true
    },

    // 经营范围选择确认
    handleBusinessScopeConfirm(selectedItems) {
      if (selectedItems && selectedItems.length > 0 && this.currentRowIndex >= 0) {
        const selectedItem = selectedItems[0] // 单选模式，取第一个

        // 将选中的经营范围信息映射到当前行
        const currentRow = this.items[this.currentRowIndex]
        if (currentRow) {
          currentRow.goodNo = selectedItem.no || ''
          currentRow.goodType = selectedItem.goodType || ''
          currentRow.goodName = selectedItem.goodName || ''
          currentRow.goodModel = selectedItem.goodModel || ''
          currentRow.goodPrice = selectedItem.publicPrice || 0
          currentRow.goodCount = 1
          currentRow.goodTotalPrice = this.calcTotal(currentRow.goodCount, currentRow.goodPrice)

          // 触发重新计算订单金额
          this.$emit('recalc-order-amount')
        }
      }
      this.businessScopeSelectorVisible = false
    },

    // 经营范围选择器关闭
    handleBusinessScopeClose() {
      this.businessScopeSelectorVisible = false
      this.currentRowIndex = -1
    },

    // 货物单价清零
    clearAllPrices() {
      if (!this.items || this.items.length === 0) {
        this.$message.warning('没有可清零的货物明细')
        return
      }

      this.$confirm('确定要将所有货物的单价清零吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.items.forEach(item => {
          item.goodPrice = 0
          item.goodTotalPrice = 0
        })
        this.$emit('recalc-order-amount')
        this.$message.success('货物单价清零成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 新增订单明细行
    addOrderItem() {
      const newItem = {
        recycleOrderId: this.orderData.id,
        goodNo: '',
        goodType: '',
        goodName: '',
        goodModel: '',
        goodCount: 0,
        goodPrice: 0,
        goodTotalPrice: 0,
        goodWeight: '',
        goodRemark: ''
      }

      this.$emit('add-item', newItem)
      this.$message.success('新增行成功')
    },

    // 删除选中的订单明细行
    deleteSelectedItems() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请先选择要删除的行')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedItems.length} 行数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete-items', this.selectedItems)
        this.selectedItems = []
        this.$message.success('删除成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 编辑明细时联动总价
    onItemFieldChange(row) {
      const count = Number(row.goodCount) || 0
      const price = Number(row.goodPrice) || 0
      row.goodTotalPrice = this.calcTotal(count, price)
      this.$emit('recalc-order-amount')
    },

    // 计算合计金额
    calcTotal(count, price) {
      const c = Number(count) || 0
      const p = Number(price) || 0
      return Number((c * p).toFixed(2))
    },

    // 获取进项表格合计行数据
    getPurchaseSummary(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1 || index === 2 || index === 3 || index === 4 || index === 6 || index === 9 || index === 10 || index === 11 || index === 12) {
          // 货物编号、货物分类、货物名称、货物型号、货物重量、货物备注、评级系数、评级调价、其他调价、订单金额列不计算合计
          sums[index] = '--'
          return
        }
        if (index === 5) {
          // 货物数量列计算合计
          const values = data.map(item => Number(item.goodCount) || 0)
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
          } else {
            sums[index] = '--'
          }
          return
        }
        if (index === 7) {
          // 货物单价列计算合计
          const values = data.map(item => Number(item.goodPrice) || 0)
          if (!values.every(value => isNaN(value))) {
            const totalPrice = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
            sums[index] = totalPrice > 0 ? `¥${this.formatAmount(totalPrice)}` : '--'
          } else {
            sums[index] = '--'
          }
          return
        }
        if (index === 8) {
          // 货物总价列计算合计
          const values = data.map(item => Number(item.goodTotalPrice) || 0)
          if (!values.every(value => isNaN(value))) {
            const totalPrice = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
            sums[index] = totalPrice > 0 ? `¥${this.formatAmount(totalPrice)}` : '--'
          } else {
            sums[index] = '--'
          }
          return
        }
        sums[index] = '--'
      })
      return sums
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 金额格式化
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 打开订单列表弹窗
    openOrderListDialog() {
      this.orderListVisible = true
    },

    // 处理同步订单明细
    handleSyncOrderItems(syncData) {
      const { sourceOrderId, sourceOrderNo, sourceOrderName, items } = syncData
      
      // 检查当前订单是否已有明细
      if (this.items && this.items.length > 0) {
        this.$confirm(
          `当前订单已存在 ${this.items.length} 条明细，是否要覆盖？`,
          '确认覆盖',
          {
            confirmButtonText: '覆盖',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          this.syncItemsToOrder(items, sourceOrderNo, sourceOrderName)
        }).catch(() => {
          // 用户取消
        })
      } else {
        this.syncItemsToOrder(items, sourceOrderNo, sourceOrderName)
      }
    },

    // 同步明细到当前订单
    syncItemsToOrder(sourceItems, sourceOrderNo, sourceOrderName) {
      try {
        // 将源订单明细转换为当前订单格式
        const newItems = sourceItems.map(item => ({
          recycleOrderId: this.orderData.id,
          goodNo: item.goodNo || '',
          goodType: item.goodType || '',
          goodName: item.goodName || '',
          goodModel: item.goodModel || '',
          goodCount: item.goodCount || 0,
          goodPrice: item.goodPrice || 0,
          goodTotalPrice: this.calcTotal(item.goodCount || 0, item.goodPrice || 0),
          goodWeight: item.goodWeight || '',
          goodRemark: item.goodRemark || '',
          goodRating: item.goodRating || '',
          goodRatingPrice: item.goodRatingPrice || '',
          otherRatingPrice: item.otherRatingPrice || '',
          orderAmount: item.orderAmount || 0
        }))

        // 清空现有明细并添加新明细
        this.items.splice(0, this.items.length, ...newItems)

        // 触发重新计算订单金额
        this.$emit('recalc-order-amount')

        this.$message.success(`已从订单 ${sourceOrderNo} 同步 ${newItems.length} 条明细`)
      } catch (error) {
        this.$message.error('同步订单明细失败')
        console.error('同步失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-item {
  .amount-text {
    font-weight: 600;
    color: #e6a23c;
  }

  .good-no-container {
    display: flex;
    align-items: center;
  }
}
</style>