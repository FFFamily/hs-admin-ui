<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" @submit.native.prevent>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增资金池</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row style="margin-top: 20px;">
      <el-table-column prop="no" label="资金池编号" width="180" />
      <el-table-column prop="contractNo" label="合同编号" width="220" />
      <el-table-column prop="contractName" label="合同名称" width="140" />
      <el-table-column prop="contractPartnerName" label="合作方" width="140" />
      <el-table-column prop="contractName" label="合同类型" width="140" />
      <el-table-column prop="fundPoolDirection" label="资金池方向" width="140" >
        <template slot-scope="scope">
          {{ getFundPoolDirectionName(scope.row.fundPoolDirection) }}
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="当前余额" width="140">
        <template slot-scope="scope">¥{{ formatAmount(scope.row.balance) }}</template>
      </el-table-column> 
      <el-table-column label="操作"  align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleViewDetail(scope.row)">明细</el-button>
          <el-button size="mini" type="warning" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 新增/编辑资金池 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px">
      <el-form :model="form" :rules="rules" ref="form" label-width="140px">
        <!-- 基本信息 -->
        <div class="form-section">
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
              <el-form-item label="合同名称" prop="contractName">
                <el-input v-model="form.contractName" placeholder="请输入合同名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合作方" prop="contractPartnerName">
                <el-input v-model="form.contractPartnerName" placeholder="请输入合作方" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 分割线 -->

        <!-- 资金池信息 -->
        <div class="form-section">
          <el-row :gutter="1">
            <el-col :span="12">
              <el-form-item label="资金池方向" prop="fundPoolDirection">
                <el-select v-model="form.fundPoolDirection" placeholder="请选择资金池方向" style="width: 100%;">
                  <el-option v-for="item in FUND_POOL_DIRECTION" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="初始金额" prop="initialAmount">
                <el-input-number 
                  v-model="form.initialAmount" 
                  :min="0" 
                  :precision="2" 
                  style="width: 100%;" 
                  placeholder="请输入初始金额"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="初始余额凭证" prop="initialBalanceVoucher">
                <el-input 
                  v-model="form.initialBalanceVoucher" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入初始余额凭证" 
                />
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

    <!-- 合同选择器 -->
    <contract-selector
      :visible.sync="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      :show-pagination="true"
      @confirm="handleContractConfirm"
    />

    <!-- 资金池明细 -->
    <el-dialog title="资金池明细" :visible.sync="detailVisible" width="900px">
      <el-table :data="details" v-loading="detailsLoading" border fit>
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="orderId" label="订单ID" width="180" />
        <el-table-column prop="amount" label="订单金额" width="120">
          <template slot-scope="scope">¥{{ formatAmount(scope.row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="direction" label="资金方向" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.direction === '+' ? 'success' : 'danger'">
              {{ scope.row.direction === '+' ? '进' : '出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beforeBalance" label="变更前余额" width="140">
          <template slot-scope="scope">¥{{ formatAmount(scope.row.beforeBalance) }}</template>
        </el-table-column>
        <el-table-column prop="afterBalance" label="变更后余额" width="140">
          <template slot-scope="scope">¥{{ formatAmount(scope.row.afterBalance) }}</template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCapitalPoolPage, createCapitalPool, updateCapitalPool, deleteCapitalPool, getCapitalPoolDetails } from '@/api/capitalPool'
import ContractSelector from '@/components/ContractSelector'
import { FUND_POOL_DIRECTION, getFundPoolDirectionName } from '@/constants/pool'
export default {
  name: 'CapitalPool',
  components: { ContractSelector },
  data() {
    return {
      getFundPoolDirectionName,
      FUND_POOL_DIRECTION,
      list: [],
      listLoading: false,
      searchForm: {
        no: '',
        contractId: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增资金池',
      form: {
        id: null,
        no: '',
        contractNo: '',
        contractName: '',
        contractPartner: '',
        contractPartnerName: '',
        fundPoolDirection: '',
        initialAmount: 0,
        initialBalanceVoucher: ''
      },
      rules: {
        no: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
        contractName: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
        contractPartnerName: [{ required: true, message: '请输入合作方', trigger: 'blur' }],
        fundPoolDirection: [{ required: true, message: '请选择资金池方向', trigger: 'change' }],
        initialAmount: [{ required: true, message: '请输入初始金额', trigger: 'blur' }],
        initialBalanceVoucher: [{ required: true, message: '请输入初始余额凭证', trigger: 'blur' }]
      },
      detailVisible: false,
      detailsLoading: false,
      details: [],
      currentPool: null,
      contractSelectorVisible: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },
    fetchData() {
      this.listLoading = true
      const params = {
        page: this.pagination.page,
        size: this.pagination.size,
        ...this.searchForm
      }
      getCapitalPoolPage(params).then(res => {
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
      this.searchForm = { no: '', contractId: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增资金池'
      this.form = { 
        id: null, 
        no: '', 
        contractNo: '', 
        contractName: '', 
        contractPartner: '', 
        contractPartnerName: '',
        fundPoolDirection: '', 
        initialAmount: 0, 
        initialBalanceVoucher: '' 
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑资金池'
      this.form = { ...row }
      this.dialogVisible = true
    },
    openContractSelector() {
      this.contractSelectorVisible = true
    },
    handleContractConfirm(selected) {
      const contract = Array.isArray(selected) ? selected[0] : selected
      if (!contract) return
      this.form.contractId = contract.id
      this.form.contractNo = contract.no 
      this.form.contractName = contract.name 
      this.form.contractPartner = contract.partner
      this.form.contractPartnerName = contract.partnerName
      this.contractSelectorVisible = false
    },
    handleDelete(row) {
      this.$confirm('确定要删除该资金池吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteCapitalPool(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          })
        })
        .catch(() => {})
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const action = this.form.id ? updateCapitalPool : createCapitalPool
        action(this.form).then(() => {
          this.$message.success(this.form.id ? '更新成功' : '新增成功')
          this.dialogVisible = false
          this.fetchData()
        })
      })
    },
    handleViewDetail(row) {
      this.currentPool = row
      this.detailVisible = true
      this.detailsLoading = true
      getCapitalPoolDetails(row.id || row.capitalPoolId).then(res => {
        this.details = res.data.records || res.data || []
        this.detailsLoading = false
      }).catch(() => { this.detailsLoading = false })
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


.el-divider {
  margin: 24px 0 16px 0;
}

.el-divider__text {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  background-color: #f5f7fa;
  padding: 0 16px;
}
</style>

