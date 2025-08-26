<template>
  <el-dialog title="批量开票" :visible.sync="visible" width="90%" :close-on-click-modal="false" top="5vh">
    <el-table :data="invoiceList" border fit style="width: 100%" v-loading="loading">
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
      <el-table-column prop="orderTotalAmount" label="订单总金额" width="140" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderTotalAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderShouldInvoice" label="订单应开发票" width="140" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderShouldInvoice) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderActualInvoice" label="订单实开发票" width="140" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.orderActualInvoice) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="plannedInvoiceTime" label="本次计划开票时间" width="180" align="center">
        <template slot-scope="scope">
          <el-date-picker
            v-model="scope.row.plannedInvoiceTime"
            type="datetime"
            placeholder="选择开票时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="plannedInvoiceAmount" label="本次计划开票金额" width="160" align="center">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.plannedInvoiceAmount"
            :min="0"
            :precision="2"
            :max="scope.row.orderShouldInvoice"
            controls-position="right"
            style="width: 100%;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="invoiceBank" label="开票银行" width="150" align="center">
        <template slot-scope="scope">
          <el-select v-model="scope.row.invoiceBank" placeholder="选择银行" style="width: 100%;">
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
  name: 'BatchInvoice',
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
      invoiceList: []
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
        this.invoiceList = []
        return
      }

      // 将选中的订单转换为开票列表
      this.invoiceList = this.selectedOrders.map(order => ({
        orderId: order.id,
        orderNo: order.no,
        orderType: order.type,
        orderStatus: order.status,
        partner: order.partner,
        orderTotalAmount: order.totalAmount || 0,
        orderShouldInvoice: order.shouldInvoice || 0, // 应开发票金额
        orderActualInvoice: order.actualInvoice || 0, // 已开发票金额
        plannedInvoiceTime: '', // 本次计划开票时间
        plannedInvoiceAmount: 0, // 本次计划开票金额
        invoiceBank: '' // 开票银行
      }))
    },



    // 格式化金额
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 保存
    handleSave() {
      // 验证必填字段
      const invalidRows = this.invoiceList.filter(row => {
        return !row.plannedInvoiceTime || 
               !row.plannedInvoiceAmount || 
               row.plannedInvoiceAmount <= 0 ||
               !row.invoiceBank
      })

      if (invalidRows.length > 0) {
        this.$message.error('请完善所有必填信息')
        return
      }

      // 验证开票金额不能超过应开发票金额
      const invalidAmountRows = this.invoiceList.filter(row => {
        return row.plannedInvoiceAmount > row.orderShouldInvoice
      })

      if (invalidAmountRows.length > 0) {
        this.$message.error('计划开票金额不能超过应开发票金额')
        return
      }

      this.$confirm('确定要保存批量开票信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.saveLoading = true
        
        // 模拟保存操作
        setTimeout(() => {
          this.saveLoading = false
          this.$message.success('批量开票信息保存成功')
          this.$emit('success', this.invoiceList)
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