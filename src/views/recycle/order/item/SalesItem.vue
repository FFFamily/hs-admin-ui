<template>
  <div class="sales-item">

    
    <!-- 销项订单明细 -->
    <el-divider content-position="left">销项订单明细</el-divider>
    <el-form>
                  <el-form-item>
              <el-button type="primary" @click="assignOrderIdentifyCode">分配订单识别号</el-button>
              <el-button type="success" @click="syncFromPurchaseItems">从进项同步</el-button>
              <el-button type="danger" @click="clearSalesItems">清空</el-button>
            </el-form-item>
    </el-form>
    
    <el-table 
      :data="salesItems" 
      border 
      fit 
      style="width: 100%; margin-bottom: 20px;" 
      v-loading="salesItemsLoading"
      @selection-change="handleSalesSelectionChange"
      :show-summary="true"
      :summary-method="getSalesSummary"
    >
      <el-table-column type="selection" width="55" align="center" />
                    <el-table-column prop="goodNo" label="货物编号" width="180" align="center">
                <template slot-scope="scope">
                  <div class="good-no-container">
                    <el-input 
                      v-model="scope.row.goodNo" 
                      placeholder="请输入货物编号" 
                      :disabled="!scope.row.goodNo"
                      readonly
                    />
                    <el-button 
                      type="primary" 
                      size="mini" 
                      icon="el-icon-search"
                      @click="openBusinessScopeSelector(scope.$index)"
                      style="margin-left: 5px;"
                    >
                      搜索
                    </el-button>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="goodType" label="货物分类" width="120" align="center">
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.goodType" 
                    placeholder="请输入货物分类" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="goodName" label="货物名称" min-width="160" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.goodName" 
                    placeholder="请输入货物名称" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="goodModel" label="规格型号" width="140" align="center">
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.goodModel" 
                    placeholder="请输入规格型号" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="goodRemark" label="货物备注" width="120" align="center">
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.goodRemark" 
                    placeholder="请输入货物备注" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="goodCount" label="货物数量" width="120" align="center">
                <template slot-scope="scope">
                  <el-input-number 
                    v-model="scope.row.goodCount" 
                    :min="1" 
                    :precision="0"
                    controls-position="right" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="goodWeight" label="货物重量" width="120" align="center">
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.goodWeight" 
                    placeholder="请输入货物重量" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="salesIdentifyCode" label="销项订单识别码" width="160" align="center">
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.salesIdentifyCode" 
                    placeholder="请输入销项订单识别码" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="purchaseIdentifyCode" label="进项订单识别码" width="160" align="center">
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.purchaseIdentifyCode" 
                    placeholder="请输入进项订单识别码" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="purchaseOrderNo" label="进项订单编号" width="180" align="center">
                <template slot-scope="scope">
                  <el-input 
                    v-model="scope.row.purchaseOrderNo" 
                    placeholder="请输入进项订单编号" 
                    :disabled="!scope.row.goodNo"
                  />
                </template>
              </el-table-column>
    </el-table>

    <!-- 经营范围选择器 -->
    <BusinessScopeSelector 
      :visible.sync="businessScopeSelectorVisible" 
      title="选择经营范围" 
      :multiple="false"
      :only-show-enabled="true"
      @confirm="handleBusinessScopeConfirm" 
      @close="handleBusinessScopeClose" 
    />
  </div>
</template>

<script>
import BusinessScopeSelector from '@/components/BusinessScopeSelector'

export default {
  name: 'SalesItem',
  components: {
    BusinessScopeSelector
  },
  props: {
    dialogMode: {
      type: String,
      default: 'add'
    },
    salesItems: {
      type: Array,
      default: () => []
    },
    salesItemsLoading: {
      type: Boolean,
      default: false
    },
    purchaseItems: {
      type: Array,
      default: () => []
    },
    orderData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedSalesItems: [],
      businessScopeSelectorVisible: false,
      currentRowIndex: -1 // 当前操作的行索引
    }
  },
  methods: {
    // 处理销项表格选择变化
    handleSalesSelectionChange(selection) {
      this.selectedSalesItems = selection
      this.$emit('sales-selection-change', selection)
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
        const currentRow = this.salesItems[this.currentRowIndex]
        if (currentRow) {
          currentRow.goodNo = selectedItem.no || ''
          currentRow.goodType = selectedItem.goodType || ''
          currentRow.goodName = selectedItem.goodName || ''
          currentRow.goodModel = selectedItem.goodModel || ''
          currentRow.goodCount = 1
        }
      }
      this.businessScopeSelectorVisible = false
    },

    // 经营范围选择器关闭
    handleBusinessScopeClose() {
      this.businessScopeSelectorVisible = false
      this.currentRowIndex = -1
    },

    // 分配订单识别号
    assignOrderIdentifyCode() {
      if (!this.salesItems || this.salesItems.length === 0) {
        this.$message.warning('没有可分配识别号的销项明细')
        return
      }
      
      this.$confirm('确定要为所有销项明细分配订单识别号吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const timestamp = Date.now()
        this.salesItems.forEach((item, index) => {
          // 生成唯一的销项订单识别码
          item.salesIdentifyCode = `SALES_${timestamp}_${index + 1}`
          // 从进项明细中获取对应的识别码和订单编号
          const purchaseItem = this.purchaseItems.find(pItem => 
            pItem.goodNo === item.goodNo || pItem.goodName === item.goodName
          )
          if (purchaseItem) {
            item.purchaseIdentifyCode = purchaseItem.identifyCode || this.orderData.identifyCode
            item.purchaseOrderNo = purchaseItem.orderNo || this.orderData.no
          }
        })
        this.$message.success('订单识别号分配成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 清空销项明细
    clearSalesItems() {
      if (!this.salesItems || this.salesItems.length === 0) {
        this.$message.warning('没有可清空的销项明细')
        return
      }
      
      this.$confirm('确定要清空所有销项明细吗？此操作不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('clear-sales-items')
        this.selectedSalesItems = []
        this.$message.success('销项明细清空成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 从进项明细同步数据到销项明细
    syncFromPurchaseItems() {
      if (!this.purchaseItems || this.purchaseItems.length === 0) {
        this.$message.warning('没有可同步的进项明细')
        return
      }
      
      this.$confirm('确定要从进项明细同步数据到销项明细吗？这将覆盖现有的销项数据！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const newSalesItems = this.purchaseItems.map(item => ({
          goodNo: item.goodNo,
          goodType: item.goodType,
          goodName: item.goodName,
          goodModel: item.goodModel,
          goodCount: item.goodCount,
          goodWeight: item.goodWeight,
          goodRemark: item.goodRemark,
          salesIdentifyCode: '',
          purchaseIdentifyCode: this.orderData.identifyCode || '',
          purchaseOrderNo: this.orderData.no || ''
        }))
        this.$emit('sync-from-purchase', newSalesItems)
        this.$message.success('从进项明细同步成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 解析重量字符串为数字
    parseWeight(weightStr) {
      if (!weightStr) return 0
      // 提取数字部分
      const match = weightStr.toString().match(/(\d+(?:\.\d+)?)/)
      return match ? Number(match[1]) : 0
    },

    // 获取销项表格合计行数据
    getSalesSummary(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (index === 1 || index === 2 || index === 3 || index === 4 || index === 5 || index === 7 || index === 8 || index === 9) {
          // 货物编号、货物分类、货物名称、规格型号、货物备注、销项订单识别码、进项订单识别码、进项订单编号列不计算合计
          sums[index] = '--'
          return
        }
        if (index === 6) {
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
          // 货物重量列计算合计
          const values = data.map(item => this.parseWeight(item.goodWeight))
          if (!values.every(value => isNaN(value))) {
            const totalWeight = values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)
            sums[index] = totalWeight > 0 ? `${totalWeight}kg` : '--'
          } else {
            sums[index] = '--'
          }
          return
        }
        sums[index] = '--'
      })
      return sums
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-item {
  // 可以添加销项特有的样式

  .good-no-container {
    display: flex;
    align-items: center;
  }
}
</style> 