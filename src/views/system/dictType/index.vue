<template>
  <div class="dict-type-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.name" placeholder="类型名称" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.code" placeholder="类型编码" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增类型</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="name" label="类型名称" width="200" />
        <el-table-column prop="code" label="类型编码" width="180" />
        <el-table-column prop="remark" label="备注" />
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
        <el-form-item label="类型名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型编码">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" />
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
  name: 'DictTypeList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        name: '',
        code: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        name: '',
        code: '',
        remark: ''
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
          { id: 1, name: '性别', code: 'gender', remark: '性别字典' },
          { id: 2, name: '状态', code: 'status', remark: '通用状态' }
        ]
        this.total = 2
        this.loading = false
      }, 500)
    },
    handleAdd() {
      this.dialogTitle = '新增类型'
      this.form = { id: null, name: '', code: '', remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑类型'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该类型吗？', '提示', { type: 'warning' }).then(() => {
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
.dict-type-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style> 