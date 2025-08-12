<template>
  <div class="user-selector-demo">
    <el-card>
      <div slot="header">
        <span>用户选择器组件示例</span>
      </div>
      
      <div class="demo-section">
        <h3>单选模式</h3>
        <el-button type="primary" @click="showSingleSelector">选择单个用户</el-button>
        <div v-if="singleSelectedUser" class="selected-info">
          <p>已选择用户：</p>
          <el-tag type="success">{{ singleSelectedUser.nickname }}</el-tag>
          <span style="margin-left: 10px; color: #666;">
            ({{ singleSelectedUser.city }} - {{ genderText(singleSelectedUser.gender) }})
          </span>
        </div>
      </div>

      <div class="demo-section">
        <h3>多选模式</h3>
        <el-button type="success" @click="showMultipleSelector">选择多个用户</el-button>
        <div v-if="multipleSelectedUsers.length > 0" class="selected-info">
          <p>已选择用户：</p>
          <div class="selected-tags">
            <el-tag
              v-for="user in multipleSelectedUsers"
              :key="user.id"
              type="success"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ user.nickname }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>带默认选择的多选模式</h3>
        <el-button type="warning" @click="showDefaultSelector">选择用户（带默认值）</el-button>
        <div v-if="defaultSelectedUsers.length > 0" class="selected-info">
          <p>已选择用户：</p>
          <div class="selected-tags">
            <el-tag
              v-for="user in defaultSelectedUsers"
              :key="user.id"
              type="warning"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ user.nickname }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>禁用某些用户的选择</h3>
        <el-button type="info" @click="showDisabledSelector">选择用户（部分禁用）</el-button>
        <div v-if="disabledSelectedUsers.length > 0" class="selected-info">
          <p>已选择用户：</p>
          <div class="selected-tags">
            <el-tag
              v-for="user in disabledSelectedUsers"
              :key="user.id"
              type="info"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ user.nickname }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 单选用户选择器 -->
    <UserSelector
      :visible.sync="singleSelectorVisible"
      title="选择单个用户"
      :multiple="false"
      @confirm="handleSingleConfirm"
      @close="handleSelectorClose"
    />

    <!-- 多选用户选择器 -->
    <UserSelector
      :visible.sync="multipleSelectorVisible"
      title="选择多个用户"
      :multiple="true"
      @confirm="handleMultipleConfirm"
      @close="handleSelectorClose"
    />

    <!-- 带默认选择的多选用户选择器 -->
    <UserSelector
      :visible.sync="defaultSelectorVisible"
      title="选择用户（带默认值）"
      :multiple="true"
      :default-selected="defaultSelectedUsers"
      @confirm="handleDefaultConfirm"
      @close="handleSelectorClose"
    />

    <!-- 禁用某些用户的选择器 -->
    <UserSelector
      :visible.sync="disabledSelectorVisible"
      title="选择用户（部分禁用）"
      :multiple="true"
      :disabled-users="[1, 3]"
      @confirm="handleDisabledConfirm"
      @close="handleSelectorClose"
    />
  </div>
</template>

<script>
import UserSelector from '@/components/UserSelector'

export default {
  name: 'UserSelectorDemo',
  components: {
    UserSelector
  },
  data() {
    return {
      // 单选相关
      singleSelectorVisible: false,
      singleSelectedUser: null,
      
      // 多选相关
      multipleSelectorVisible: false,
      multipleSelectedUsers: [],
      
      // 默认选择相关
      defaultSelectorVisible: false,
      defaultSelectedUsers: [
        { id: 2, nickname: '李四', openid: 'openid2', avatar: '', gender: 2, city: '上海', status: 1 }
      ],
      
      // 禁用用户相关
      disabledSelectorVisible: false,
      disabledSelectedUsers: []
    }
  },
  methods: {
    // 显示单选选择器
    showSingleSelector() {
      this.singleSelectorVisible = true
    },

    // 显示多选选择器
    showMultipleSelector() {
      this.multipleSelectorVisible = true
    },

    // 显示带默认选择的选择器
    showDefaultSelector() {
      this.defaultSelectorVisible = true
    },

    // 显示禁用某些用户的选择器
    showDisabledSelector() {
      this.disabledSelectorVisible = true
    },

    // 单选确认处理
    handleSingleConfirm(users) {
      this.singleSelectedUser = users[0]
      this.$message.success(`已选择用户：${users[0].nickname}`)
    },

    // 多选确认处理
    handleMultipleConfirm(users) {
      this.multipleSelectedUsers = users
      this.$message.success(`已选择 ${users.length} 个用户`)
    },

    // 默认选择确认处理
    handleDefaultConfirm(users) {
      this.defaultSelectedUsers = users
      this.$message.success(`已选择 ${users.length} 个用户`)
    },

    // 禁用用户选择确认处理
    handleDisabledConfirm(users) {
      this.disabledSelectedUsers = users
      this.$message.success(`已选择 ${users.length} 个用户`)
    },

    // 选择器关闭处理
    handleSelectorClose() {
      console.log('用户选择器已关闭')
    },

    // 性别文本转换
    genderText(gender) {
      if (gender === 1) return '男'
      if (gender === 2) return '女'
      return '未知'
    }
  }
}
</script>

<style lang="scss" scoped>
.user-selector-demo {
  padding: 20px;

  .demo-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #fafafa;

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #303133;
      font-size: 16px;
    }

    .selected-info {
      margin-top: 15px;
      padding: 15px;
      background-color: #f0f9ff;
      border-radius: 4px;

      p {
        margin: 0 0 10px 0;
        font-weight: 500;
        color: #606266;
      }

      .selected-tags {
        .el-tag {
          margin-right: 8px;
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style> 