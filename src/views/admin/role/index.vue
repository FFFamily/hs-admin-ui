<template>
  <div class="admin-role-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.name" placeholder="角色名" style="width: 200px; margin-right: 10px;" />
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增角色</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="name" label="角色名" width="150" />
        <el-table-column prop="desc" label="描述" />
        <el-table-column label="操作" width="180">
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
        <el-form-item label="角色名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" />
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
import { getAdminRoleList, addAdminRole, updateAdminRole, deleteAdminRole } from '@/api/adRole'

export default {
  name: 'AdminRoleList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        name: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        name: '',
        desc: ''
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          ...this.search
        }
        const res = await getAdminRoleList(params)
        this.list = res.data.list || []
        this.total = res.data.total || 0
      } catch (e) {
        this.$message.error('获取角色列表失败')
      }
      this.loading = false
    },
    handleAdd() {
      this.dialogTitle = '新增角色'
      this.form = { id: null, name: '', desc: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑角色'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      this.$confirm('确定要删除该角色吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          await deleteAdminRole(row.id)
          this.$message.success('删除成功')
          this.fetchList()
        } catch (e) {
          this.$message.error('删除失败')
        }
      })
    },
    async handleSave() {
      try {
        if (this.form.id) {
          await updateAdminRole(this.form)
          this.$message.success('编辑成功')
        } else {
          await addAdminRole(this.form)
          this.$message.success('新增成功')
        }
        this.dialogVisible = false
        this.fetchList()
      } catch (e) {
        this.$message.error('保存失败')
      }
    }
  }
}
</script>

<style scoped>
.admin-role-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style> 