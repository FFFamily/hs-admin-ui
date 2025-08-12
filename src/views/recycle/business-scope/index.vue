<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form" @submit.native.prevent>
      <el-form-item label="货物类型">
        <el-input v-model="searchForm.goodsType" placeholder="请输入货物类型" clearable />
      </el-form-item>
      <el-form-item label="货物名称">
        <el-input v-model="searchForm.goodsName" placeholder="请输入货物名称" clearable />
      </el-form-item>
      <el-form-item label="规格型号">
        <el-input v-model="searchForm.specification" placeholder="请输入规格型号" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="operation-container">
      <el-button type="primary" @click="handleAdd">新增经营范围</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
      style="margin-top: 20px;"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" prop="id" width="80" align="center" />
      <el-table-column label="货物类型" prop="goodsType" width="120" align="center" />
      <el-table-column label="货物名称" prop="goodsName" width="150" align="center" />
      <el-table-column label="规格型号" prop="specification" width="150" align="center" />
      <el-table-column label="货物价格" width="120" align="center">
        <template slot-scope="scope">
          <span class="price">¥{{ scope.row.goodsPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
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
    <el-dialog 
      :title="dialogTitle" 
      :visible.sync="dialogVisible" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="form" 
        :model="form" 
        :rules="rules" 
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item label="货物类型" prop="goodsType">
          <el-input v-model="form.goodsType" placeholder="请输入货物类型" />
        </el-form-item>
        <el-form-item label="货物名称" prop="goodsName">
          <el-input v-model="form.goodsName" placeholder="请输入货物名称" />
        </el-form-item>
        <el-form-item label="规格型号" prop="specification">
          <el-input v-model="form.specification" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="货物价格" prop="goodsPrice">
          <el-input-number 
            v-model="form.goodsPrice" 
            :precision="2" 
            :min="0" 
            :step="0.01"
            style="width: 100%"
            placeholder="请输入货物价格"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { 
  getBusinessScopePage, 
  createBusinessScope, 
  updateBusinessScope, 
  deleteBusinessScope,
  batchDeleteBusinessScope
} from '@/api/businessScope'

export default {
  name: 'BusinessScope',
  data() {
    return {
      // 列表数据
      list: [],
      listLoading: false,
      
      // 搜索表单
      searchForm: {
        goodsType: '',
        goodsName: '',
        specification: ''
      },
      
      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      
      // 选中的行
      selectedIds: [],
      
      // 弹窗相关
      dialogVisible: false,
      dialogTitle: '',
      submitLoading: false,
      
      // 表单数据
      form: {
        id: null,
        goodsType: '',
        goodsName: '',
        specification: '',
        goodsPrice: 0
      },
      
      // 表单验证规则
      rules: {
        goodsType: [
          { required: true, message: '请输入货物类型', trigger: 'blur' }
        ],
        goodsName: [
          { required: true, message: '请输入货物名称', trigger: 'blur' }
        ],
        specification: [
          { required: true, message: '请输入规格型号', trigger: 'blur' }
        ],
        goodsPrice: [
          { required: true, message: '请输入货物价格', trigger: 'blur' }
        ]
      }
    }
  },
  
  created() {
    this.fetchData()
  },
  
  methods: {
    // 获取数据
    fetchData() {
      this.listLoading = true
      const params = {
        goodsType: this.searchForm.goodsType || undefined,
        goodsName: this.searchForm.goodsName || undefined,
        specification: this.searchForm.specification || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      
      getBusinessScopePage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
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
        goodsType: '',
        goodsName: '',
        specification: ''
      }
      this.pagination.page = 1
      this.fetchData()
    },
    
    // 新增
    handleAdd() {
      this.dialogTitle = '新增经营范围'
      this.form = {
        id: null,
        goodsType: '',
        goodsName: '',
        specification: '',
        goodsPrice: 0
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    
    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑经营范围'
      this.form = { ...row }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    
    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const submitData = { ...this.form }
          
          const request = this.form.id 
            ? updateBusinessScope(this.form.id, submitData)
            : createBusinessScope(submitData)
            
          request.then(() => {
            this.$message.success(this.form.id ? '更新成功' : '新增成功')
            this.dialogVisible = false
            this.fetchData()
          }).catch(() => {
            this.$message.error(this.form.id ? '更新失败' : '新增失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },
    
    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该经营范围吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteBusinessScope(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('删除失败')
          })
        })
        .catch(() => {})
    },
    
    // 批量删除
    handleBatchDelete() {
      this.$confirm(`确定要删除选中的 ${this.selectedIds.length} 条记录吗？`, '提示', { type: 'warning' })
        .then(() => {
          batchDeleteBusinessScope(this.selectedIds).then(() => {
            this.$message.success('批量删除成功')
            this.selectedIds = []
            this.fetchData()
          }).catch(() => {
            this.$message.error('批量删除失败')
          })
        })
        .catch(() => {})
    },
    
    // 选择变化
    handleSelectionChange(selection) {
      this.selectedIds = selection.map(item => item.id)
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
    }
  }
}
</script>

<style scoped>
.search-form .el-form-item {
  margin-right: 20px;
}

.operation-container {
  margin: 20px 0;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.dialog-footer {
  text-align: right;
}
</style> 