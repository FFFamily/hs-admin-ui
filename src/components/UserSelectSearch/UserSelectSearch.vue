<template>
  <div class="user-select-search">
    <el-input
      v-model="inputValue"
      placeholder="点击选择用户"
      readonly
      @click.native="showUserDialog"
      suffix-icon="el-icon-search"
    />
    <el-checkbox v-if="multiple" v-model="selectAll" @change="handleSelectAllChange" style="margin-top: 10px;">全选</el-checkbox>

    <!-- 用户选择对话框 -->
    <el-dialog
      title="选择用户"
      :visible.sync="userDialogVisible"
      width="70%"
      :close-on-click-modal="false"
    >
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="输入用户名或手机号搜索"
          style="width: 300px; margin-right: 10px;"
          suffix-icon="el-icon-search"
        />
        <el-button type="primary" @click="fetchUserList">搜索</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%; margin-top: 20px;"
        border
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        ref="userTable"
        :select-on-indeterminate="multiple"
        :highlight-current-row="!multiple"
      >
        <el-table-column v-if="multiple" type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.type === 'company' ? '企业' : '个人' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150" />
      </el-table>

      <div style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="currentPage"
          @current-change="fetchUserList"
        />
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect">确认选择</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserPage } from '@/api/user'

export default {
  name: 'UserSelectSearch',
  props: {
    // 选中的用户ID，单选时为String/Number，多选时为Array
    value: {
      type: [String, Number, Array],
      default: ''
    },
    // 回显的字段，默认为用户名
    displayField: {
      type: String,
      default: 'username'
    },
    // 是否允许多选
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputValue: '',
      userDialogVisible: false,
      userList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      searchQuery: '',
      loading: false,
      selectedUsers: [], // 多选模式下存储选中的用户
      selectedUser: null, // 单选模式下存储选中的用户
      selectAll: false // 全选状态
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (this.multiple) {
          if (Array.isArray(newVal) && newVal.length > 0 && this.selectedUsers.length === 0) {
            this.getUserInfo(newVal)
          }
        } else {
          if (newVal && !this.selectedUser) {
            // 如果传入了value但没有选中的用户，尝试获取用户信息
            this.getUserInfo(newVal)
          }
        }
      },
      immediate: true
    },
    // 监听全选状态变化
    selectAll: function(newVal) {
      if (newVal) {
        this.selectedUsers = [...this.userList]
      } else {
        this.selectedUsers = []
      }
      this.$refs.userTable && this.$refs.userTable.clearSelection()
      if (newVal) {
        this.userList.forEach(row => {
          this.$refs.userTable && this.$refs.userTable.toggleRowSelection(row, true)
        })
      }
    }
  },
  methods: {
    // 显示用户选择对话框
    showUserDialog() {
      this.userDialogVisible = true
      this.fetchUserList()
    },

    // 获取用户列表
    fetchUserList() {
      this.loading = true
      getUserPage({
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        username: this.searchQuery,
        phone: this.searchQuery
      }).then(res => {
        this.userList = res.data.records
        this.total = res.data.total
        this.loading = false

        // 如果有选中的用户，高亮显示
        if (this.selectedUser) {
          this.$nextTick(() => {
            const row = this.userList.find(item => item.id === this.selectedUser.id)
            if (row) {
              this.$refs.userTable.setCurrentRow(row)
            }
          })
        }
      }).catch(() => {
        this.loading = false
      })
    },

    // 处理行点击
    handleRowClick(row) {
      if (this.multiple) {
        // 多选模式下，切换选中状态
        const isSelected = this.selectedUsers.some(user => user.id === row.id)
        if (isSelected) {
          this.selectedUsers = this.selectedUsers.filter(user => user.id !== row.id)
        } else {
          this.selectedUsers.push(row)
        }
        // 更新全选状态
        this.selectAll = this.selectedUsers.length === this.userList.length
      } else {
        // 单选模式下，直接选中
        this.selectedUser = row
        this.$refs.userTable.setCurrentRow(row)
      }
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedUsers = selection
      // 更新全选状态
      this.selectAll = selection.length === this.userList.length
    },

    // 确认选择
    confirmSelect() {
      if (this.multiple) {
        if (this.selectedUsers.length === 0) {
          this.$message.warning('请选择用户')
          return
        }
        this.inputValue = `${this.selectedUsers.length}个用户已选择`
        this.userDialogVisible = false
        this.$emit('input', this.selectedUsers.map(user => user.id))
        this.$emit('change', this.selectedUsers)
      } else {
        if (!this.selectedUser) {
          this.$message.warning('请选择用户')
          return
        }
        this.inputValue = this.selectedUser[this.displayField]
        this.userDialogVisible = false
        this.$emit('input', this.selectedUser.id)
        this.$emit('change', this.selectedUser)
      }
    },

    // 处理全选变化
    handleSelectAllChange(val) {
      this.selectAll = val
    },

    // 获取用户信息
    getUserInfo(userIds) {
      // 在实际应用中，可能需要一个获取用户信息的API
      // 这里为了简化，我们从列表中查找
      if (this.userList.length > 0) {
        if (this.multiple && Array.isArray(userIds)) {
          this.selectedUsers = this.userList.filter(user => userIds.includes(user.id))
          this.inputValue = `${this.selectedUsers.length}个用户已选择`
          // 设置表格选中状态
          this.$nextTick(() => {
            this.userList.forEach(row => {
              this.$refs.userTable.toggleRowSelection(row, this.selectedUsers.some(u => u.id === row.id))
            })
          })
        } else {
          const user = this.userList.find(item => item.id === userIds)
          if (user) {
            this.selectedUser = user
            this.inputValue = user[this.displayField]
            // 设置表格选中状态
            this.$nextTick(() => {
              this.$refs.userTable.setCurrentRow(user)
            })
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.user-select-search {
  width: 100%;
}

.search-container {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
</style>