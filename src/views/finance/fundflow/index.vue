<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" @submit.native.prevent>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增走款</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row style="margin-top: 20px;">
      <el-table-column prop="no" label="编号" width="160" />
      <el-table-column prop="contractNo" label="合同编号" width="160" />
      <el-table-column prop="contractType" label="合同类型" width="120" />
      <el-table-column prop="contractName" label="合同名称" min-width="160" />
      <el-table-column prop="partner" label="合作方" min-width="140" />
      <el-table-column prop="orderNo" label="订单编号" width="160" />
      <el-table-column prop="shouldPay" label="应走金额" width="120" />
      <el-table-column prop="thisPay" label="本次交易金额" width="140" />
      <el-table-column prop="fundPoolDirection" label="资金池方向" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.fundPoolDirection === '+' ? 'success' : 'danger'">
            {{ scope.row.fundPoolDirection === '+' ? '进' : '出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="processor" label="经办人" width="120" />
      <el-table-column prop="voucher" label="凭证" min-width="120" />
      <el-table-column prop="payFundTime" label="支付时间" width="180" />
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
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
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="编号" prop="no">
              <el-input v-model="form.no" placeholder="请输入编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="form.contractNo" placeholder="请选择合同" readonly @focus="openContractSelector">
                <el-button slot="append" icon="el-icon-search" @click="openContractSelector">选择</el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同类型" prop="contractType">
              <el-input v-model="form.contractType" placeholder="请输入合同类型" />
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
            <el-form-item label="订单ID" prop="orderId">
              <el-input v-model="form.orderId" placeholder="请输入订单ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应走金额" prop="shouldPay">
              <el-input v-model.number="form.shouldPay" placeholder="请输入应走金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本次交易金额" prop="thisPay">
              <el-input v-model.number="form.thisPay" placeholder="请输入本次交易金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资金池Id" prop="fundPoolId">
              <el-input v-model="form.fundPoolId" placeholder="请输入资金池Id" />
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
            <el-form-item label="经办人" prop="processor">
              <el-input v-model="form.processor" placeholder="请输入经办人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="凭证" prop="voucher">
              <el-input v-model="form.voucher" placeholder="请输入凭证" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付时间" prop="payFundTime">
              <el-date-picker v-model="form.payFundTime" type="datetime" placeholder="选择时间" style="width: 100%;" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">{{ form.id ? '更新' : '添加' }}</el-button>
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
      contractSelectorVisible: false
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
</style>

