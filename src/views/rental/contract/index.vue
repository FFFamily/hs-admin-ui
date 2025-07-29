<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="合同名">
        <el-input v-model="searchForm.name" placeholder="请输入合同名" />
      </el-form-item>
      <el-form-item label="合同编号">
        <el-input v-model="searchForm.code" placeholder="请输入合同编号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button type="primary" @click="handleAdd">新增合同</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="ID" prop="id" width="200" align="center" />
      <el-table-column label="合同名" prop="name" />
      <el-table-column label="合同编号" prop="code" width="150" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
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
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="合同名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="合同编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入数字+字母的组合" />
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
        code: ''
      },
      dialogVisible: false,
      dialogTitle: '新增合同',
      form: {
        id: null,
        name: '',
        code: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      rules: {
        name: [{ required: true, message: '请输入合同名', trigger: 'blur' }],
        code: [{ required: true, message: '请输入合同编号', trigger: 'blur' },
              { pattern: /^[a-zA-Z0-9]+$/, message: '合同编号只能包含数字和字母', trigger: 'blur' }]
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
      this.searchForm = { name: '', code: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增合同'
      this.form = { id: null, name: '', code: '' }
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