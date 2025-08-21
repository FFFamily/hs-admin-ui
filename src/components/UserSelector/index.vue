<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="800px"
    :before-close="handleClose"
  >
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入用户名、昵称或手机号搜索"
        style="width: 300px;"
        clearable
        @keyup.enter.native="handleSearch"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
      </el-input>
      <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">搜索</el-button>
      <el-button @click="handleReset" style="margin-left: 10px;">重置</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table
      :data="userList"
      v-loading="loading"
      border
      style="margin-top: 20px;"
      @selection-change="handleSelectionChange"
      :row-key="row => row.id"
    >
      <el-table-column
        v-if="multiple"
        type="selection"
        width="55"
        :reserve-selection="true"
      />
      <el-table-column label="头像" width="80" align="center">
        <template slot-scope="scope">
          <el-avatar
            v-if="scope.row.avatar"
            :src="scope.row.avatar"
            size="small"
          />
          <el-avatar
            v-else
            icon="el-icon-user"
            size="small"
          />
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" width="120" />
      <el-table-column label="昵称" prop="nickname" width="120" />
      <el-table-column label="手机号" prop="phone" width="130" />
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'use' ? 'success' : 'danger'">
            {{ scope.row.status === 'use' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; text-align: right;"
    />

    <!-- 已选择用户展示 -->
    <div v-if="multiple && selectedUsers.length > 0" class="selected-users">
      <h4>已选择用户：</h4>
      <el-tag
        v-for="user in selectedUsers"
        :key="user.id"
        closable
        @close="removeSelectedUser(user)"
        style="margin-right: 8px; margin-bottom: 8px;"
      >
        {{ user.nickname || user.username }}
      </el-tag>
    </div>

    <!-- 操作按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
        :disabled="multiple ? selectedUsers.length === 0 : !singleSelectedUser"
      >
        确 定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getAgentList } from '@/api/agent'

export default {
  name: 'UserSelector',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择用户'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    // 已选择的用户ID列表（多选模式）
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      searchKeyword: '',
      userList: [],
      selectedUsers: [],
      singleSelectedUser: null,
      pagination: {
        page: 1,
        size: 10,
        total: 0
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initData()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    initData() {
      this.searchKeyword = ''
      this.selectedUsers = []
      this.singleSelectedUser = null
      this.pagination.page = 1
      this.fetchUserList()
      
      // 如果是多选模式且有已选择的用户ID，则恢复选择状态
      if (this.multiple && this.selectedIds.length > 0) {
        this.restoreSelection()
      }
    },
    
    fetchUserList() {
      this.loading = true
      const params = {
        keyword: this.searchKeyword || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      
      getAgentList(params).then(response => {
        this.userList = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
        this.loading = false
        
        // 恢复选择状态
        if (this.multiple && this.selectedIds.length > 0) {
          this.$nextTick(() => {
            this.restoreSelection()
          })
        }
      }).catch(() => {
        this.loading = false
      })
    },
    
    handleSearch() {
      this.pagination.page = 1
      this.fetchUserList()
    },
    
    handleReset() {
      this.searchKeyword = ''
      this.pagination.page = 1
      this.fetchUserList()
    },
    
    handleSelectionChange(selection) {
      this.selectedUsers = selection
    },
    
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchUserList()
    },
    
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchUserList()
    },
    
    // 恢复选择状态
    restoreSelection() {
      this.$nextTick(() => {
        this.userList.forEach(row => {
          if (this.selectedIds.includes(row.id)) {
            this.$refs.multipleTable.toggleRowSelection(row, true)
          }
        })
      })
    },
    
    // 移除已选择的用户
    removeSelectedUser(user) {
      this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id)
    },
    
    handleConfirm() {
      if (this.multiple) {
        if (this.selectedUsers.length === 0) {
          this.$message.warning('请至少选择一个用户')
          return
        }
        this.$emit('confirm', this.selectedUsers)
      } else {
        if (!this.singleSelectedUser) {
          this.$message.warning('请选择一个用户')
          return
        }
        this.$emit('confirm', [this.singleSelectedUser])
      }
      this.handleClose()
    },
    
    handleClose() {
      this.dialogVisible = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.selected-users {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.selected-users h4 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
}
</style> 