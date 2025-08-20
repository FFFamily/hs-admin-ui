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
      <el-table-column prop="no" label="编号" width="180" />
      <el-table-column prop="contractId" label="合同ID" width="220" />
      <el-table-column prop="initialBalance" label="初始余额" width="140">
        <template slot-scope="scope">¥{{ formatAmount(scope.row.initialBalance) }}</template>
      </el-table-column>
      <el-table-column prop="balance" label="当前余额" width="140">
        <template slot-scope="scope">¥{{ formatAmount(scope.row.balance) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="260" align="center">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="编号" prop="no">
              <el-input v-model="form.no" placeholder="请输入编号" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="合同ID" prop="contractId">
              <el-input v-model="form.contractId" placeholder="请输入合同ID" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="初始余额" prop="initialBalance">
              <el-input-number v-model="form.initialBalance" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">{{ form.id ? '更新' : '添加' }}</el-button>
      </div>
    </el-dialog>

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

export default {
  name: 'CapitalPool',
  data() {
    return {
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
        contractId: '',
        initialBalance: 0
      },
      rules: {
        no: [{ required: true, message: '请输入编号', trigger: 'blur' }],
        contractId: [{ required: true, message: '请输入合同ID', trigger: 'blur' }],
        initialBalance: [{ required: true, message: '请输入初始余额', trigger: 'blur' }]
      },
      detailVisible: false,
      detailsLoading: false,
      details: [],
      currentPool: null
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
      this.form = { id: null, no: '', contractId: '', initialBalance: 0 }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑资金池'
      this.form = { ...row }
      this.dialogVisible = true
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
</style>

