<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="账号">
        <el-input v-model="searchForm.accountId" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="编号">
        <el-input v-model="searchForm.no" placeholder="请输入编号" />
      </el-form-item>
      <el-form-item label="经办人姓名">
        <el-input v-model="searchForm.name" placeholder="请输入经办人姓名" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="searchForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增经办人</el-button>
      </el-form-item>
    </el-form>

    <!-- 经办人表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="ID" prop="id" width="120" align="center" />
      <el-table-column label="账号" prop="accountId" width="150" />
      <el-table-column label="编号" prop="no" width="120" />
      <el-table-column label="经办人姓名" prop="name" width="120" />
      <el-table-column label="手机号" prop="phone" width="150" />
      <el-table-column label="身份证号" prop="idCard" width="200" />
      <el-table-column label="住址" prop="address" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="200" align="center" fixed="right">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-user"></i>
            <span>基本信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="账号" prop="accountId">
                <el-input v-model="form.accountId" placeholder="请输入账号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="编号" prop="no">
                <el-input v-model="form.no" placeholder="请输入编号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="经办人姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入经办人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 身份信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-identity"></i>
            <span>身份信息</span>
          </div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="身份证号" prop="idCard">
                <el-input v-model="form.idCard" placeholder="请输入身份证号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="住址" prop="address">
                <el-input 
                  v-model="form.address" 
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入详细住址" 
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAgentPage, addAgent, updateAgent, deleteAgent } from '@/api/agent'

export default {
  name: 'AgentManagement',
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        accountId: '',
        no: '',
        name: '',
        phone: ''
      },
      dialogVisible: false,
      dialogTitle: '新增经办人',
      form: {
        id: null,
        accountId: '',
        no: '',
        name: '',
        phone: '',
        idCard: '',
        address: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      rules: {
        accountId: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 3, max: 50, message: '账号长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        no: [
          { required: true, message: '请输入编号', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入经办人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入住址', trigger: 'blur' },
          { max: 200, message: '住址长度不能超过 200 个字符', trigger: 'blur' }
        ]
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
        accountId: this.searchForm.accountId || undefined,
        no: this.searchForm.no || undefined,
        name: this.searchForm.name || undefined,
        phone: this.searchForm.phone || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      getAgentPage(params).then(response => {
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
      this.searchForm = { accountId: '', no: '', name: '', phone: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增经办人'
      this.form = {
        id: null,
        accountId: '',
        no: '',
        name: '',
        phone: '',
        idCard: '',
        address: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑经办人'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该经办人吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteAgent(row.id).then(() => {
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
            updateAgent(this.form.id, this.form).then(() => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('编辑失败')
            })
          } else {
            // 新增
            addAgent(this.form).then(() => {
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

/* 表单分组样式 */
.form-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title i {
  margin-right: 8px;
  font-size: 18px;
  color: #409eff;
}

.section-title span {
  position: relative;
}

.section-title span::after {
  content: '';
  position: absolute;
  bottom: -14px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #409eff;
}

/* 表单项间距优化 */
.form-section .el-form-item {
  margin-bottom: 18px;
}

.form-section .el-row {
  margin-bottom: 0;
}

/* 弹窗内容区域滚动 */
.el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .form-section {
    padding: 15px;
  }
  
  .el-col {
    margin-bottom: 10px;
  }
}
</style> 