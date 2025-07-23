<template>
  <div class="admin-user-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.username" placeholder="用户名" style="width: 180px; margin-right: 10px;" />
        <el-input v-model="search.nickname" placeholder="昵称" style="width: 180px; margin-right: 10px;" />
        <el-select v-model="search.role" placeholder="角色" style="width: 150px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增用户</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="role" label="角色" width="120">
          <template slot-scope="scope">
            <span>{{ getRoleName(scope.row.role) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
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
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { getAdminUserList, addAdminUser, updateAdminUser, deleteAdminUser } from '@/api/adUser'

export default {
  name: 'AdminUserList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        username: '',
        nickname: '',
        role: ''
      },
      roleOptions: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '访客', value: 'guest' }
      ],
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        username: '',
        nickname: '',
        role: '',
        status: 1
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    getRoleName(role) {
      const item = this.roleOptions.find(r => r.value === role)
      return item ? item.label : '-'
    },
    async fetchList() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          ...this.search
        }
        const res = await getAdminUserList(params)
        this.list = res.data.list || []
        this.total = res.data.total || 0
      } catch (e) {
        this.$message.error('获取用户列表失败')
      }
      this.loading = false
    },
    handleAdd() {
      this.dialogTitle = '新增用户'
      this.form = { id: null, username: '', nickname: '', role: '', status: 1 }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      this.$confirm('确定要删除该用户吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          await deleteAdminUser(row.id)
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
          await updateAdminUser(this.form)
          this.$message.success('编辑成功')
        } else {
          await addAdminUser(this.form)
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
.admin-user-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}
</style> 