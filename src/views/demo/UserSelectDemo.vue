<template>
  <div class="user-select-demo">
    <el-card>
      <div slot="header" class="clearfix">
        <span>用户选择组件演示</span>
      </div>

      <div style="margin-bottom: 30px;">
        <h3>单选模式</h3>
        <p style="margin-bottom: 10px;">点击行即可选中，有高亮效果</p>
        <user-select-search v-model="selectedUserId" />
        <p style="margin-top: 10px;">选中的用户ID: {{ selectedUserId }}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3>自定义回显字段</h3>
        <user-select-search v-model="selectedUserId2" display-field="nickname" />
        <p style="margin-top: 10px;">选中的用户ID: {{ selectedUserId2 }}</p>
      </div>

      <div>
        <h3>多选模式</h3>
        <p style="margin-bottom: 10px;">可以选择多个用户，支持全选</p>
        <user-select-search v-model="selectedUserIds" :multiple="true" />
        <p style="margin-top: 10px;">选中的用户ID: {{ selectedUserIds.join(', ') }}</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import UserSelectSearch from '@/components/UserSelectSearch/UserSelectSearch.vue'

export default {
  name: 'UserSelectDemo',
  components: {
    UserSelectSearch
  },
  data() {
    return {
      selectedUserId: '',
      selectedUserId2: '',
      selectedUserIds: []
    }
  }
}
</script>

<style scoped>
.user-select-demo {
  padding: 20px;
}

h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}
</style>