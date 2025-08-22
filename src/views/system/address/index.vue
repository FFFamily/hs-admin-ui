<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="账号名称">
          <el-input v-model="searchForm.accountName" placeholder="请输入用户名称" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="searchForm.realAddress" placeholder="请输入地址" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增地址</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 数据表格 -->
    <el-card>
      <el-table v-loading="loading" :data="tableData" border style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户名称" prop="accountName" width="120" />
        <el-table-column label="分类" prop="category" width="100" />
        <el-table-column label="地址" prop="realAddress" min-width="200" show-overflow-tooltip />
        <el-table-column label="备注" prop="remark" width="150" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination :current-page="pagination.page" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
        :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" style="margin-top: 20px; text-align: right;" />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" :before-close="handleDialogClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户" prop="accountId">
          <div class="user-selector-container">
            <el-input v-model="form.accountName" placeholder="请选择用户" readonly style="width: 100%;">
              <el-button slot="append" @click="showUserSelector">选择用户</el-button>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="地址" prop="realAddress">
          <el-input v-model="form.realAddress" type="textarea" :rows="3" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 用户选择器 -->
    <UserSelector :visible.sync="userSelectorVisible" title="选择用户" :multiple="false" @confirm="handleUserSelected" />
  </div>
</template>

<script>
import { getAddressPage, createAddress, updateAddress, deleteAddress } from '@/api/address'
import UserSelector from '@/components/UserSelector'

export default {
  name: 'AddressManagement',
  components: {
    UserSelector
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,
      userSelectorVisible: false,
      isEdit: false,
      selectedRows: [],

      // 搜索表单
      searchForm: {
        accountName: '',
        category: '',
        realAddress: ''
      },

      // 表格数据
      tableData: [],

      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },

      // 表单数据
      form: {
        id: '',
        accountId: '',
        accountName: '',
        category: '',
        realAddress: '',
        remark: ''
      },

      // 表单验证规则
      rules: {
        accountId: [
          { required: true, message: '请选择用户', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        realAddress: [
          { required: true, message: '请输入地址', trigger: 'blur' },
          { min: 5, message: '地址长度不能少于5个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑地址' : '新增地址'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    fetchData() {
      this.loading = true
      const params = {
        page: this.pagination.page,
        size: this.pagination.size,
        ...this.searchForm
      }

      getAddressPage(params).then(response => {
        this.tableData = response.data.records || []
        this.pagination.total = response.data.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        accountName: '',
        category: '',
        realAddress: ''
      }
      this.pagination.page = 1
      this.fetchData()
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },

    // 新增
    handleAdd() {
      this.isEdit = false
      this.form = {
        id: '',
        accountId: '',
        accountName: '',
        category: '',
        realAddress: '',
        remark: ''
      }
      this.dialogVisible = true
    },

    // 编辑
    handleEdit(row) {
      this.isEdit = true
      this.form = {
        id: row.id,
        accountId: row.accountId,
        accountName: row.accountName,
        category: row.category,
        realAddress: row.realAddress,
        remark: row.remark || ''
      }
      this.dialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除这条地址记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAddress(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        })
      })
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的地址')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条地址记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const deletePromises = this.selectedRows.map(row => deleteAddress(row.id))
        Promise.all(deletePromises).then(() => {
          this.$message.success('批量删除成功')
          this.selectedRows = []
          this.fetchData()
        }).catch(() => {
          this.$message.error('批量删除失败')
        })
      })
    },

    // 显示用户选择器
    showUserSelector() {
      this.userSelectorVisible = true
    },

    // 用户选择回调
    handleUserSelected(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.form.accountId = user.id
        this.form.accountName = user.nickname || user.username
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const submitData = { ...this.form }

          const request = this.isEdit ? updateAddress(submitData) : createAddress(submitData)

          request.then(() => {
            this.$message.success(this.isEdit ? '更新成功' : '创建成功')
            this.dialogVisible = false
            this.fetchData()
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },

    // 获取分类标签类型
    getCategoryTagType(category) {
      const typeMap = {
        '家庭地址': 'success',
        '工作地址': 'primary',
        '其他地址': 'info'
      }
      return typeMap[category] || 'info'
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.operation-card {
  margin-bottom: 20px;
}

.user-selector-container {
  width: 100%;
}

.dialog-footer {
  text-align: right;
}
</style>