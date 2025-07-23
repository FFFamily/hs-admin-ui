<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="商品名">
        <el-input v-model="searchForm.name" placeholder="请输入商品名" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="上架" value="on" />
          <el-option label="下架" value="off" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
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
      <el-table-column label="编号" prop="code" width="120" align="center" />
      <el-table-column label="商品名" prop="name" />
      <el-table-column label="图片" width="100" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.image" alt="图片" style="width:60px;height:60px;object-fit:cover;" />
        </template>
      </el-table-column>
      <el-table-column label="价格(元)" prop="price" width="100" align="center" />
      <el-table-column label="库存" prop="stock" width="80" align="center" />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'on' ? 'success' : 'info'">
            {{ scope.row.status === 'on' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="mini" type="warning" @click="handleToggleStatus(scope.row)">
            {{ scope.row.status === 'on' ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" label-width="80px">
        <el-form-item label="商品名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="编号">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="图片">
          <el-input v-model="form.image" placeholder="图片URL" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="上架" value="on" />
            <el-option label="下架" value="off" />
          </el-select>
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
export default {
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        name: '',
        status: ''
      },
      dialogVisible: false,
      dialogTitle: '新增商品',
      form: {
        id: null,
        name: '',
        code: '',
        image: '',
        price: 0,
        stock: 0,
        status: 'on'
      },
      mockData: [
        { id: 1, name: '投影仪', code: 'A001', image: 'https://via.placeholder.com/60', price: 100, stock: 10, status: 'on' },
        { id: 2, name: '音响', code: 'A002', image: 'https://via.placeholder.com/60', price: 80, stock: 5, status: 'off' },
        { id: 3, name: '桌椅套装', code: 'A003', image: 'https://via.placeholder.com/60', price: 50, stock: 20, status: 'on' }
      ]
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      // 模拟接口延迟
      setTimeout(() => {
        this.list = this.mockData.filter(item => {
          const nameMatch = !this.searchForm.name || item.name.includes(this.searchForm.name)
          const statusMatch = !this.searchForm.status || item.status === this.searchForm.status
          return nameMatch && statusMatch
        })
        this.listLoading = false
      }, 500)
    },
    handleSearch() {
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { name: '', status: '' }
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增商品'
      this.form = { id: null, name: '', code: '', image: '', price: 0, stock: 0, status: 'on' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑商品'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
        .then(() => {
          this.mockData = this.mockData.filter(item => item.id !== row.id)
          this.fetchData()
          this.$message.success('删除成功')
        })
        .catch(() => {})
    },
    handleToggleStatus(row) {
      row.status = row.status === 'on' ? 'off' : 'on'
      this.fetchData()
    },
    handleSave() {
      if (this.form.id) {
        // 编辑
        const idx = this.mockData.findIndex(item => item.id === this.form.id)
        if (idx > -1) this.mockData[idx] = { ...this.form }
        this.$message.success('编辑成功')
      } else {
        // 新增
        this.form.id = Date.now()
        this.mockData.push({ ...this.form })
        this.$message.success('新增成功')
      }
      this.dialogVisible = false
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