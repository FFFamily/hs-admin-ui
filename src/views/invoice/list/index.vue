<template>
  <div class="invoice-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.number" placeholder="发票号码" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.title" placeholder="抬头名称" style="width: 200px; margin-right: 10px;" />
        <el-select v-model="search.status" placeholder="状态" style="width: 150px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="已开" value="issued" />
          <el-option label="未开" value="pending" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增发票</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="number" label="发票号码" width="180" />
        <el-table-column prop="title" label="抬头名称" width="200" />
        <el-table-column prop="amount" label="金额" width="120" />
        <el-table-column prop="date" label="开票日期" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'issued' ? 'success' : 'info'">{{ scope.row.status === 'issued' ? '已开' : '未开' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="page"
          @current-change="fetchList"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" label-width="80px">
        <el-form-item label="发票号码">
          <el-input v-model="form.number" />
        </el-form-item>
        <el-form-item label="抬头名称">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="form.amount" type="number" />
        </el-form-item>
        <el-form-item label="开票日期">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="已开" value="issued" />
            <el-option label="未开" value="pending" />
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
  name: 'InvoiceList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        number: '',
        title: '',
        status: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        number: '',
        title: '',
        amount: '',
        date: '',
        status: 'pending'
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      setTimeout(() => {
        this.list = [
          { id: 1, number: 'FP20240001', title: '北京某公司', amount: 1000, date: '2024-06-01', status: 'issued' },
          { id: 2, number: 'FP20240002', title: '上海某企业', amount: 500, date: '2024-06-02', status: 'pending' }
        ]
        this.total = 2
        this.loading = false
      }, 500)
    },
    handleAdd() {
      this.dialogTitle = '新增发票'
      this.form = { id: null, number: '', title: '', amount: '', date: '', status: 'pending' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑发票'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该发票吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('删除成功（模拟）')
        this.fetchList()
      })
    },
    handleSave() {
      this.$message.success('保存成功（模拟）')
      this.dialogVisible = false
      this.fetchList()
    }
  }
}
</script>

<style scoped>
.invoice-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style> 