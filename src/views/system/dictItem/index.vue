<template>
  <div class="dict-item-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.typeCode" placeholder="类型编码" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.label" placeholder="字典项名称" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.value" placeholder="字典项值" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增字典项</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="typeCode" label="类型编码" width="180" />
        <el-table-column prop="label" label="字典项名称" width="180" />
        <el-table-column prop="value" label="字典项值" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
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
        <el-form-item label="类型编码">
          <el-input v-model="form.typeCode" />
        </el-form-item>
        <el-form-item label="字典项名称">
          <el-input v-model="form.label" />
        </el-form-item>
        <el-form-item label="字典项值">
          <el-input v-model="form.value" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="form.sort" type="number" />
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
  name: 'DictItemList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        typeCode: '',
        label: '',
        value: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        typeCode: '',
        label: '',
        value: '',
        sort: 0,
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
          { id: 1, typeCode: 'gender', label: '男', value: '1', sort: 1, remark: '' },
          { id: 2, typeCode: 'gender', label: '女', value: '2', sort: 2, remark: '' },
          { id: 3, typeCode: 'status', label: '启用', value: '1', sort: 1, remark: '' },
          { id: 4, typeCode: 'status', label: '禁用', value: '0', sort: 2, remark: '' }
        ]
        this.total = 4
        this.loading = false
      }, 500)
    },
    handleAdd() {
      this.dialogTitle = '新增字典项'
      this.form = { id: null, typeCode: '', label: '', value: '', sort: 0, remark: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑字典项'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该字典项吗？', '提示', { type: 'warning' }).then(() => {
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
.dict-item-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style>
