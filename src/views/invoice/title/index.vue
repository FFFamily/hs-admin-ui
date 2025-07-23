<template>
  <div class="invoice-title-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.name" placeholder="抬头名称" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.taxNo" placeholder="税号" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增抬头</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="name" label="抬头名称" width="200" />
        <el-table-column prop="taxNo" label="税号" width="180" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="phone" label="电话" width="150" />
        <el-table-column prop="bank" label="开户行" width="180" />
        <el-table-column prop="account" label="银行账号" width="180" />
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
        <el-form-item label="抬头名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="税号">
          <el-input v-model="form.taxNo" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="开户行">
          <el-input v-model="form.bank" />
        </el-form-item>
        <el-form-item label="银行账号">
          <el-input v-model="form.account" />
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
  name: 'InvoiceTitleList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        name: '',
        taxNo: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        name: '',
        taxNo: '',
        address: '',
        phone: '',
        bank: '',
        account: ''
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
          { id: 1, name: '北京某公司', taxNo: '1234567890', address: '北京市朝阳区', phone: '010-88888888', bank: '中国银行', account: '6222000000000000' },
          { id: 2, name: '上海某企业', taxNo: '9876543210', address: '上海市浦东新区', phone: '021-66666666', bank: '工商银行', account: '6222022222222222' }
        ]
        this.total = 2
        this.loading = false
      }, 500)
    },
    handleAdd() {
      this.dialogTitle = '新增抬头'
      this.form = { id: null, name: '', taxNo: '', address: '', phone: '', bank: '', account: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑抬头'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该抬头吗？', '提示', { type: 'warning' }).then(() => {
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
.invoice-title-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style> 