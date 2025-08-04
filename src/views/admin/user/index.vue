<template>
  <div class="admin-user-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.username" placeholder="登录账号" style="width: 180px; margin-right: 10px;" />
        <el-input v-model="search.nickname" placeholder="用户昵称" style="width: 180px; margin-right: 10px;" />
        <el-input v-model="search.phone" placeholder="手机号" style="width: 180px; margin-right: 10px;" />
        <!-- <el-select v-model="search.deptId" placeholder="部门" style="width: 150px; margin-right: 10px;">
          <el-option label="全部部门" value="" />
          <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select> -->
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增用户</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="username" label="登录账号" width="150" />
        <el-table-column prop="nickname" label="用户昵称" width="150" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="头像" width="100">
          <template slot-scope="scope">
            <el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" size="small" />
            <el-avatar v-else icon="el-icon-user" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'use' ? 'success' : 'danger'">
              {{ scope.row.status === 'use' ? '使用中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="deptName" label="部门" width="150" /> -->
        <el-table-column label="操作" fixed="right" width="400">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              v-if="scope.row.status === 'disable'" 
              size="mini" 
              type="success" 
              @click="handleEnable(scope.row)"
            >
              启用
            </el-button>
            <el-button 
              v-if="scope.row.status === 'use'" 
              size="mini" 
              type="warning" 
              @click="handleDisable(scope.row)"
            >
              停用
            </el-button>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入登录密码" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            :action="uploadAction"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :http-request="customUpload"
          >
            <img v-if="form.avatar" :src="form.avatar" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择用户状态">
            <el-option label="使用中" value="use" />
            <el-option label="已关闭" value="disable" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择部门" style="width: 100%;">
            <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAdminUserPage, createAdminUser, updateAdminUser, deleteAdminUser, getDeptList, changeAdminUserStatus } from '@/api/adminUser'
import { uploadFile } from '@/api/upload'

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
        phone: '',
        deptId: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      deptList: [],
      form: {
        id: null,
        username: '',
        password: '',
        nickname: '',
        phone: '',
        avatar: '',
        status: 'use',
        deptId: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择用户状态', trigger: 'change' }
        ],
        deptId: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ]
      },
      uploadAction: '#', // 自定义上传，不使用默认action
    }
  },
  created() {
    this.fetchDeptList()
    this.fetchList()
  },
  methods: {
    // 获取部门列表
    fetchDeptList() {
      // getDeptList().then(res => {
      //   this.deptList = res.data || []
      // }).catch(() => {
      //   this.deptList = []
      // })
    },
    // 获取用户列表
    fetchList() {
      this.loading = true
      getAdminUserPage({
        pageNum: this.page,
        pageSize: this.pageSize,
        ...this.search
      }).then(res => {
        this.list = res.data.records || []
        this.total = res.data.total || 0
        // 为每个用户添加部门名称
        this.list.forEach(item => {
          const dept = this.deptList.find(d => d.id === item.deptId)
          item.deptName = dept ? dept.name : '未知部门'
        })
      }).catch(() => {
        this.list = []
        this.total = 0
      }).finally(() => {
        this.loading = false
      })
    },
    // 新增用户
    handleAdd() {
      this.dialogTitle = '新增用户'
      this.form = {
        id: null,
        username: '',
        password: '',
        nickname: '',
        phone: '',
        avatar: '',
        status: 'use',
        deptId: ''
      }
      this.dialogVisible = true
    },
    // 编辑用户
    handleEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = { ...row }
      this.dialogVisible = true
    },
    // 删除用户
    handleDelete(row) {
      this.$confirm('确认删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAdminUser(row.id).then(res => {
          this.$message.success('删除成功')
          this.fetchList()
        })
      })
    },
    // 启用用户
    handleEnable(row) {
      this.$confirm('确认启用该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeAdminUserStatus(row.id, 'use').then(res => {
          this.$message.success('启用成功')
          this.fetchList()
        })
      })
    },
    // 停用用户
    handleDisable(row) {
      this.$confirm('确认停用该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeAdminUserStatus(row.id, 'disable').then(res => {
          this.$message.success('停用成功')
          this.fetchList()
        })
      })
    },
    // 保存用户
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        
        if (this.form.id) {
          // 更新用户
          updateAdminUser(this.form).then(res => {
            this.$message.success('更新成功')
            this.dialogVisible = false
            this.fetchList()
          })
        } else {
          // 新增用户
          createAdminUser(this.form).then(res => {
            this.$message.success('新增成功')
            this.dialogVisible = false
            this.fetchList()
          })
        }
      })
    },
    // 头像上传相关方法
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    // 自定义上传
    customUpload(options) {
      const file = options.file
      uploadFile(file).then(res => {
        if (res.code === 200) {
          this.form.avatar = process.env.VUE_APP_BASE_URL + res.data.fileUrl
          this.$message.success('头像上传成功')
        } else {
          this.$message.error('头像上传失败')
        }
      }).catch(() => {
        this.$message.error('头像上传失败')
      })
    },
    // 上传成功回调
    handleAvatarSuccess(res, file) {
      // 这里不使用默认的上传成功回调，因为使用了自定义上传
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style> 