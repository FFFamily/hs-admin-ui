<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="合同名">
        <el-input v-model="searchForm.name" placeholder="请输入合同名" />
      </el-form-item>
      <el-form-item label="合同编号">
        <el-input v-model="searchForm.code" placeholder="请输入合同编号" />
      </el-form-item>
      <el-form-item label="合同识别号">
        <el-input v-model="searchForm.recognitionCode" placeholder="请输入合同识别号" />
      </el-form-item>
      <el-form-item label="合同类型">
        <el-input v-model="searchForm.type" placeholder="请输入合同类型" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <!-- <el-button @click="handleReset">重置</el-button> -->
        <el-button type="primary" @click="handleAdd">新增合同</el-button>
      </el-form-item>
    </el-form>

    <!-- 合同表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="ID" prop="id" width="120" align="center" />
      <el-table-column label="合同名" prop="name" />
      <el-table-column label="合同识别号" prop="recognitionCode" />
      <el-table-column label="合同编号" prop="code" />
      <el-table-column label="合同类型" prop="type" />
      <el-table-column label="起始日期" prop="startDate" />
      <el-table-column label="结束日期" prop="endDate" />
      <el-table-column label="运输模式" prop="transportMode" />
      <el-table-column label="运费承担方式" prop="freightResponsibility" />
      <el-table-column label="付款方式" prop="paymentMethod" />
      <el-table-column label="开票方式" prop="invoiceMethod" />
      <el-table-column label="甲方信息" prop="partyA" />
      <el-table-column label="乙方信息" prop="partyB" />
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="合同名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="合同识别号" prop="recognitionCode">
          <el-input v-model="form.recognitionCode" />
        </el-form-item>
        <el-form-item label="合同编号" prop="code">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="合同类型" prop="type">
          <el-input v-model="form.type" />
        </el-form-item>
        <el-form-item label="起始日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="date" placeholder="选择起始日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="运输模式" prop="transportMode">
          <el-input v-model="form.transportMode" />
        </el-form-item>
        <el-form-item label="运费承担方式" prop="freightResponsibility">
          <el-input v-model="form.freightResponsibility" />
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-input v-model="form.paymentMethod" />
        </el-form-item>
        <el-form-item label="开票方式" prop="invoiceMethod">
          <el-input v-model="form.invoiceMethod" />
        </el-form-item>
        <el-form-item label="甲方信息" prop="partyA">
          <el-input v-model="form.partyA" />
        </el-form-item>
        <el-form-item label="乙方信息" prop="partyB">
          <el-input v-model="form.partyB" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getContractPage, addContract, updateContract, deleteContract } from '@/api/contract'

export default {
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        name: '',
        code: '',
        recognitionCode: '',
        type: ''
      },
      dialogVisible: false,
      dialogTitle: '新增合同',
      form: {
        id: null,
        name: '',
        recognitionCode: '',
        code: '',
        type: '',
        startDate: '',
        endDate: '',
        transportMode: '',
        freightResponsibility: '',
        paymentMethod: '',
        invoiceMethod: '',
        partyA: '',
        partyB: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      rules: {
        name: [{ required: true, message: '请输入合同名', trigger: 'blur' }],
        recognitionCode: [{ required: true, message: '请输入合同识别号', trigger: 'blur' }],
        code: [
          { required: true, message: '请输入合同编号', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '合同编号只能包含数字和字母', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请输入合同类型', trigger: 'blur' }],
        startDate: [{ required: true, message: '请选择起始日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
        // 其他字段可根据实际需求添加校验
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
        name: this.searchForm.name || undefined,
        code: this.searchForm.code || undefined,
        recognitionCode: this.searchForm.recognitionCode || undefined,
        type: this.searchForm.type || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      getContractPage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
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
      this.searchForm = { name: '', code: '', recognitionCode: '', type: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增合同'
      this.form = {
        id: null,
        name: '',
        recognitionCode: '',
        code: '',
        type: '',
        startDate: '',
        endDate: '',
        transportMode: '',
        freightResponsibility: '',
        paymentMethod: '',
        invoiceMethod: '',
        partyA: '',
        partyB: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑合同'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该合同吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteContract(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('删除失败')
          })
        })
        .catch(() => {})
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            // 编辑
            updateContract(this.form.id, this.form).then(() => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('编辑失败')
            })
          } else {
            // 新增
            addContract(this.form).then(() => {
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('新增失败')
            })
          }
        }
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
.demo-form-inline .el-form-item {
  margin-right: 20px;
}
</style>