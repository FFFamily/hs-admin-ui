<template>
  <el-dialog title="批量走款" :visible.sync="visible" width="90%" :close-on-click-modal="false" top="5vh">
    <el-table :data="fundflowList" border fit style="width: 100%" v-loading="loading">
      <el-table-column prop="orderNo" label="订单编号" width="150" align="center" />
      <el-table-column prop="orderType" label="订单类型" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getOrderTypeTagType(scope.row.orderType)">
            {{ getOrderTypeText(scope.row.orderType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderStatus" label="订单状态" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.orderStatus)">
            {{ getOrderStatusText(scope.row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="partner" label="合作方" width="150" align="center" show-overflow-tooltip />
      <el-table-column prop="capitalPoolRemaining" label="资金池剩余" width="140" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.capitalPoolRemaining) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderTotalAmount" label="订单总金额" width="140" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderTotalAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderActualAmount" label="订单实走金额" width="140" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderActualAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderShouldAmount" label="订单应走金额" width="140" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderShouldAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="plannedFundflowTime" label="本次计划走款时间" width="180" align="center">
        <template slot-scope="scope">
          <el-date-picker
            v-model="scope.row.plannedFundflowTime"
            type="datetime"
            placeholder="选择走款时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="plannedFundflowAmount" label="本次计划走款金额" width="160" align="center">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.plannedFundflowAmount"
            :min="0"
            :precision="2"
            :max="scope.row.orderShouldAmount"
            controls-position="right"
            style="width: 100%;"
            @change="onAmountChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="plannedLoanAmount" label="计划贷款走款" width="140" align="center">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.plannedLoanAmount"
            :min="0"
            :precision="2"
            :max="scope.row.plannedFundflowAmount"
            controls-position="right"
            style="width: 100%;"
            @change="onLoanAmountChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="plannedCapitalPoolAmount" label="计划资金池走款" width="150" align="center">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.plannedCapitalPoolAmount"
            :min="0"
            :precision="2"
            :max="scope.row.plannedFundflowAmount"
            controls-position="right"
            style="width: 100%;"
            @change="onCapitalPoolAmountChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="fundflowBank" label="走款银行" width="150" align="center">
        <template slot-scope="scope">
          <el-select v-model="scope.row.fundflowBank" placeholder="选择银行" style="width: 100%;">
            <el-option label="中国工商银行" value="ICBC" />
            <el-option label="中国建设银行" value="CCB" />
            <el-option label="中国农业银行" value="ABC" />
            <el-option label="中国银行" value="BOC" />
            <el-option label="交通银行" value="BOCOM" />
            <el-option label="招商银行" value="CMB" />
            <el-option label="中信银行" value="CITIC" />
            <el-option label="浦发银行" value="SPDB" />
            <el-option label="民生银行" value="CMBC" />
            <el-option label="兴业银行" value="CIB" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { 
  getOrderTypeTagType,
  getOrderTypeText,
  getOrderStatusTagType,
  getOrderStatusText
} from '@/constants/orderTypes'

export default {
  name: 'BatchFundflow',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedOrders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      saveLoading: false,
      fundflowList: []
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initData()
      }
    },
    selectedOrders: {
      handler(newVal) {
        if (newVal && this.visible) {
          this.initData()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    initData() {
      if (!this.selectedOrders || this.selectedOrders.length === 0) {
        this.fundflowList = []
        return
      }

      // 将选中的订单转换为走款列表
      this.fundflowList = this.selectedOrders.map(order => ({
        orderId: order.id,
        orderNo: order.no,
        orderType: order.type,
        orderStatus: order.status,
        partner: order.partner,
        capitalPoolRemaining: this.getCapitalPoolRemaining(), // 模拟获取资金池剩余
        orderTotalAmount: order.totalAmount || 0,
        orderActualAmount: order.actualAmount || 0, // 已走款金额
        orderShouldAmount: (order.totalAmount || 0) - (order.actualAmount || 0), // 应走款金额
        plannedFundflowTime: '', // 本次计划走款时间
        plannedFundflowAmount: 0, // 本次计划走款金额
        plannedLoanAmount: 0, // 计划贷款走款
        plannedCapitalPoolAmount: 0, // 计划资金池走款
        fundflowBank: '' // 走款银行
      }))
    },

    // 获取资金池剩余金额（模拟数据）
    getCapitalPoolRemaining() {
      return Math.floor(Math.random() * 1000000) + 500000 // 50万到150万之间
    },

    // 金额变化处理
    onAmountChange(row) {
      const plannedAmount = row.plannedFundflowAmount || 0
      const loanAmount = row.plannedLoanAmount || 0
      const capitalPoolAmount = row.plannedCapitalPoolAmount || 0
      
      // 如果贷款走款 + 资金池走款 > 计划走款金额，则调整资金池走款
      if (loanAmount + capitalPoolAmount > plannedAmount) {
        row.plannedCapitalPoolAmount = Math.max(0, plannedAmount - loanAmount)
      }
    },

    // 贷款金额变化处理
    onLoanAmountChange(row) {
      const plannedAmount = row.plannedFundflowAmount || 0
      const loanAmount = row.plannedLoanAmount || 0
      
      // 如果贷款走款 > 计划走款金额，则限制贷款走款
      if (loanAmount > plannedAmount) {
        row.plannedLoanAmount = plannedAmount
      }
      
      // 调整资金池走款
      row.plannedCapitalPoolAmount = Math.max(0, plannedAmount - loanAmount)
    },

    // 资金池金额变化处理
    onCapitalPoolAmountChange(row) {
      const plannedAmount = row.plannedFundflowAmount || 0
      const loanAmount = row.plannedLoanAmount || 0
      const capitalPoolAmount = row.plannedCapitalPoolAmount || 0
      
      // 如果贷款走款 + 资金池走款 > 计划走款金额，则限制资金池走款
      if (loanAmount + capitalPoolAmount > plannedAmount) {
        row.plannedCapitalPoolAmount = Math.max(0, plannedAmount - loanAmount)
      }
    },



    // 格式化金额
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 保存
    handleSave() {
      // 验证必填字段
      const invalidRows = this.fundflowList.filter(row => {
        return !row.plannedFundflowTime || 
               !row.plannedFundflowAmount || 
               row.plannedFundflowAmount <= 0 ||
               !row.fundflowBank
      })

      if (invalidRows.length > 0) {
        this.$message.error('请完善所有必填信息')
        return
      }

      // 验证金额逻辑
      const invalidAmountRows = this.fundflowList.filter(row => {
        const plannedAmount = row.plannedFundflowAmount || 0
        const loanAmount = row.plannedLoanAmount || 0
        const capitalPoolAmount = row.plannedCapitalPoolAmount || 0
        
        return plannedAmount !== (loanAmount + capitalPoolAmount)
      })

      if (invalidAmountRows.length > 0) {
        this.$message.error('计划走款金额必须等于贷款走款金额加资金池走款金额')
        return
      }

      this.$confirm('确定要保存批量走款信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.saveLoading = true
        
        // 模拟保存操作
        setTimeout(() => {
          this.saveLoading = false
          this.$message.success('批量走款信息保存成功')
          this.$emit('success', this.fundflowList)
          this.handleCancel()
        }, 1000)
      }).catch(() => {
        // 用户取消
      })
    },

    // 取消
    handleCancel() {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.amount-text {
  font-weight: 600;
  color: #e6a23c;
}

.dialog-footer {
  text-align: right;
}
</style> 