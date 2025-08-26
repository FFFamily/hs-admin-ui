<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" @submit.native.prevent>
      <el-form-item label="合作方">
        <el-input v-model="searchForm.partner" placeholder="合作方" />
      </el-form-item>
      <el-form-item label="合同编号">
        <el-input v-model="searchForm.contractNo" placeholder="合同编号" />
      </el-form-item>
      <el-form-item label="订单编号">
        <el-input v-model="searchForm.orderNo" placeholder="订单编号" />
      </el-form-item>
      <el-form-item label="订单类型">
        <el-input v-model="searchForm.orderType" placeholder="订单类型" />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-input v-model="searchForm.orderStatus" placeholder="订单状态" />
      </el-form-item>
      <el-form-item label="走款方向">
        <el-input v-model="searchForm.fundFlowDirection" placeholder="走款方向" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row style="margin-top: 20px;">
      <el-table-column prop="partner" label="合作方" min-width="140" />
      <el-table-column prop="contractNo" label="合同编号" width="160" />
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="contractStatus" label="合同状态" width="120" />
      <el-table-column prop="orderStatus" label="订单状态" min-width="160" />
      <el-table-column prop="orderType" label="订单类型" width="120" />
      <el-table-column prop="fundPoolDirection" label="资金池剩余金额" width="120" />
      <el-table-column prop="fundFlowDirection" label="走款方向" width="120" />
      <el-table-column prop="fundFlowAmount" label="走款金额" width="120" />
      <el-table-column prop="fundPoolDirection" label="资金池方向" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.fundPoolDirection === '+' ? 'success' : 'danger'">
            {{ scope.row.fundPoolDirection === '+' ? '进' : '出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="shouldPay" label="资金池走款金额" width="120" />
      <el-table-column prop="loanDirection" label="贷款方向" width="120" />
      <el-table-column prop="loanAmount" label="贷款走款金额" width="120" />
      <el-table-column prop="loanBank" label="贷款走款银行" width="120" />
      <el-table-column prop="planPayTime" label="计划走款时间" width="120" />
      <el-table-column prop="processor" label="经办人" width="120" />
      <el-table-column prop="voucher" label="凭证" min-width="120" />
      <el-table-column prop="payFundTime" label="支付时间" width="180" />
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="success" @click="handleConfirm(scope.row)">确认</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; text-align: right;"
    />

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px">
      <el-form :model="form" :rules="rules" ref="form" label-width="140px">
        <!-- 分割线 -->
        <el-divider content-position="left">基本信息</el-divider>
        <div class="form-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="合同编号" prop="contractNo">
                <el-input v-model="form.contractNo" placeholder="请选择合同" readonly @focus="openContractSelector">
                  <el-button slot="append" icon="el-icon-search" @click="openContractSelector">选择</el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同名称" prop="contractName">
                <el-input v-model="form.contractName" placeholder="请输入合同名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合作方" prop="partner">
                <el-input v-model="form.partner" placeholder="请输入合作方" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同状态" prop="contractStatus">
                <el-input v-model="form.contractStatus" placeholder="请输入合同状态" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单编号" prop="orderNo">
                <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单类型" prop="orderType">
                <el-input v-model="form.orderType" placeholder="请输入订单类型" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单总金额" prop="orderStatus">
                <el-input v-model="form.orderStatus" placeholder="请输入订单总金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单应走金额" prop="orderStatus">
                <el-input v-model="form.orderStatus" placeholder="请输入订单应走金额" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 分割线 -->
        <el-divider content-position="left">走款信息</el-divider>

        <!-- 金额信息 -->
        <div class="form-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="合同资金池方向" prop="contractFundPoolDirection">
                <el-input v-model="form.contractFundPoolDirection" placeholder="请输入合同资金池方向" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同资金池剩余金额" prop="contractFundPoolId">
                <el-input v-model="form.contractFundPoolId" placeholder="请输入合同资金池剩余金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="走款方向" prop="fundFlowDirection">
                <el-input v-model="form.fundFlowDirection" placeholder="请输入走款方向" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="走款金额" prop="fundFlowAmount">
                <el-input v-model="form.fundFlowAmount" placeholder="请输入走款金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资金池方向" prop="fundPoolDirection">
                <el-select v-model="form.fundPoolDirection" placeholder="请选择">
                  <el-option label="进(+ )" value="+" />
                  <el-option label="出(- )" value="-" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资金走款金额" prop="fundPoolDirection">
                <el-input v-model="form.fundPoolDirection" placeholder="请输入资金走款金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="贷款方向" prop="fundPoolDirection">
                <el-input v-model="form.fundPoolDirection" placeholder="请输入贷款方向" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="贷款走款金额" prop="fundPoolDirection">
                <el-input v-model="form.fundPoolDirection" placeholder="请输入贷款走款金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="贷款走款银行" prop="fundPoolDirection">
                <el-input v-model="form.fundPoolDirection" placeholder="请输入贷款走款银行" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划走款时间" prop="fundPoolDirection">
                <el-input v-model="form.fundPoolDirection" placeholder="请输入计划走款时间" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">{{ form.id ? '更新' : '添加' }}</el-button>
      </div>
    </el-dialog>
    <!-- 确认走款弹框 -->
    <el-dialog title="确认走款" :visible.sync="confirmDialogVisible" width="500px">
      <el-form :model="confirmForm" :rules="confirmRules" ref="confirmForm" label-width="120px">
        <el-form-item label="经办人" prop="processor">
          <el-input v-model="confirmForm.processor" placeholder="请输入经办人" />
        </el-form-item>
        <el-form-item label="凭证" prop="voucher">
          <el-input v-model="confirmForm.voucher" placeholder="请输入凭证" />
        </el-form-item>
        <el-form-item label="支付时间" prop="payFundTime">
          <el-date-picker 
            v-model="confirmForm.payFundTime" 
            type="datetime" 
            placeholder="选择支付时间" 
            style="width: 100%;" 
            value-format="yyyy-MM-dd HH:mm:ss" 
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSubmit">录入</el-button>
      </div>
    </el-dialog>

    <contract-selector
      :visible.sync="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      :show-pagination="true"
      @confirm="handleContractConfirm"
    />
  </div>
  
</template>

<script>
import { getFundFlowPage, addFundFlow, updateFundFlow, deleteFundFlow } from '@/api/fundFlow'
import ContractSelector from '@/components/ContractSelector'

export default {
  name: 'FundFlow',
  components: { ContractSelector },
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        no: '',
        contractNo: '',
        partner: '',
        payFundTimeRange: []
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增走款',
      form: {
        id: null,
        no: '',
        contractNo: '',
        contractType: '',
        contractName: '',
        partner: '',
        orderId: '',
        orderNo: '',
        shouldPay: null,
        thisPay: null,
        fundPoolId: '',
        fundPoolDirection: '+',
        processor: '',
        voucher: '',
        payFundTime: ''
      },
      rules: {
        no: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
        thisPay: [{ required: true, message: '请输入本次交易金额', trigger: 'blur' }],
        fundPoolDirection: [{ required: true, message: '请选择方向', trigger: 'change' }],
        payFundTime: [{ required: true, message: '请选择支付时间', trigger: 'change' }]
      },
      contractSelectorVisible: false,
      // 确认弹框相关数据
      confirmDialogVisible: false,
      confirmForm: {
        id: null,
        processor: '',
        voucher: '',
        payFundTime: ''
      },
      confirmRules: {
        processor: [{ required: true, message: '请输入经办人', trigger: 'blur' }],
        voucher: [{ required: true, message: '请输入凭证', trigger: 'blur' }],
        payFundTime: [{ required: true, message: '请选择支付时间', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      const params = {
        ...this.searchForm,
        page: this.pagination.page,
        size: this.pagination.size,
        payFundTimeStart: this.searchForm.payFundTimeRange && this.searchForm.payFundTimeRange[0] || undefined,
        payFundTimeEnd: this.searchForm.payFundTimeRange && this.searchForm.payFundTimeRange[1] || undefined
      }
      delete params.payFundTimeRange
      getFundFlowPage(params).then(res => {
        this.list = res.data.records || res.data || []
        this.pagination.total = res.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { no: '', contractNo: '', partner: '', payFundTimeRange: [] }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增走款'
      this.form = {
        id: null,
        no: '',
        contractNo: '',
        contractType: '',
        contractName: '',
        partner: '',
        orderId: '',
        orderNo: '',
        shouldPay: null,
        thisPay: null,
        fundPoolId: '',
        fundPoolDirection: '+',
        processor: '',
        voucher: '',
        payFundTime: ''
      }
      this.dialogVisible = true
    },
    openContractSelector() {
      this.contractSelectorVisible = true
    },
    handleContractConfirm(selected) {
      const contract = Array.isArray(selected) ? selected[0] : selected
      if (!contract) return
      this.form.contractNo = contract.no || contract.contractNo || ''
      this.form.contractName = contract.name || contract.contractName || ''
      this.form.contractType = contract.type || ''
      this.form.partner = contract.partner || ''
      this.contractSelectorVisible = false
    },
    handleEdit(row) {
      this.dialogTitle = '编辑走款'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleConfirm(row) {
      this.confirmForm = {
        id: row.id,
        processor: '',
        voucher: '',
        payFundTime: ''
      }
      this.confirmDialogVisible = true
    },
    handleConfirmSubmit() {
      this.$refs.confirmForm.validate((valid) => {
        if (!valid) return
        
        // 这里调用确认走款的API
        // 假设有一个confirmFundFlow的API方法
        const confirmData = {
          id: this.confirmForm.id,
          processor: this.confirmForm.processor,
          voucher: this.confirmForm.voucher,
          payFundTime: this.confirmForm.payFundTime
        }
        
        // 这里需要根据实际的API调整
        updateFundFlow(confirmData).then(() => {
          this.$message.success('确认走款成功')
          this.confirmDialogVisible = false
          this.fetchData()
        }).catch(() => {
          this.$message.error('确认走款失败')
        })
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteFundFlow(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          })
        })
        .catch(() => {})
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        const action = this.form.id ? updateFundFlow : addFundFlow
        action(this.form).then(() => {
          this.$message.success(this.form.id ? '更新成功' : '新增成功')
          this.dialogVisible = false
          this.fetchData()
        })
      })
    },
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}

.el-divider {
  margin: 24px 0 16px 0;
}

</style>

