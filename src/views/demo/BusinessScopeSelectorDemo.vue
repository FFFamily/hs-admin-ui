<template>
  <div class="app-container">
    <el-card class="demo-card">
      <div slot="header">
        <span>经营范围选择器演示</span>
      </div>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="demo-item">
            <div slot="header">
              <span>基础用法</span>
            </el-card>
            <el-button type="primary" @click="showBasicSelector = true">
              选择经营范围
            </el-button>
            <div v-if="basicSelected" class="selected-info">
              <p>已选择：{{ basicSelected.goodType }} - {{ basicSelected.goodName }}</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="demo-item">
            <div slot="header">
              <span>多选模式</span>
            </el-card>
            <el-button type="success" @click="showMultipleSelector = true">
              多选经营范围
            </el-button>
            <div v-if="multipleSelected.length > 0" class="selected-info">
              <p>已选择 {{ multipleSelected.length }} 项：</p>
              <el-tag 
                v-for="item in multipleSelected" 
                :key="item.id"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ item.goodType }} - {{ item.goodName }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="demo-item">
            <div slot="header">
              <span>带默认值</span>
            </el-card>
            <el-button type="warning" @click="showDefaultSelector = true">
              编辑经营范围
            </el-button>
            <div v-if="defaultSelected.length > 0" class="selected-info">
              <p>当前选择：</p>
              <el-tag 
                v-for="item in defaultSelected" 
                :key="item.id"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ item.goodType }} - {{ item.goodName }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card class="demo-item">
            <div slot="header">
              <span>禁用特定项</span>
            </el-card>
            <el-button type="info" @click="showDisabledSelector = true">
              选择（部分禁用）
            </el-button>
            <div class="demo-description">
              <p>ID为1、2、3的经营范围将被禁用</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="demo-item">
            <div slot="header">
              <span>自定义配置</span>
            </el-card>
            <el-button type="danger" @click="showCustomSelector = true">
              自定义选择器
            </el-button>
            <div class="demo-description">
              <p>自定义标题、宽度、分页大小</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 基础选择器 -->
    <BusinessScopeSelector
      :visible.sync="showBasicSelector"
      title="选择经营范围"
      @confirm="handleBasicConfirm"
    />

    <!-- 多选选择器 -->
    <BusinessScopeSelector
      :visible.sync="showMultipleSelector"
      :multiple="true"
      title="多选经营范围"
      @confirm="handleMultipleConfirm"
    />

    <!-- 带默认值的选择器 -->
    <BusinessScopeSelector
      :visible.sync="showDefaultSelector"
      :default-selected="defaultSelected"
      title="编辑经营范围"
      @confirm="handleDefaultConfirm"
    />

    <!-- 禁用特定项的选择器 -->
    <BusinessScopeSelector
      :visible.sync="showDisabledSelector"
      :disabled-business-scopes="[1, 2, 3]"
      title="选择经营范围（部分禁用）"
      @confirm="handleDisabledConfirm"
    />

    <!-- 自定义配置的选择器 -->
    <BusinessScopeSelector
      :visible.sync="showCustomSelector"
      title="自定义经营范围选择器"
      width="1200px"
      :page-size="5"
      @confirm="handleCustomConfirm"
    />
  </div>
</template>

<script>
import BusinessScopeSelector from '@/components/BusinessScopeSelector'

export default {
  name: 'BusinessScopeSelectorDemo',
  components: {
    BusinessScopeSelector
  },
  data() {
    return {
      // 基础选择器
      showBasicSelector: false,
      basicSelected: null,
      
      // 多选选择器
      showMultipleSelector: false,
      multipleSelected: [],
      
      // 带默认值的选择器
      showDefaultSelector: false,
      defaultSelected: [
        {
          id: 1,
          no: 'BS001',
          goodType: '电子产品',
          goodName: '手机',
          goodModel: 'iPhone 13',
          publicPrice: 5999,
          isShow: 'Y'
        }
      ],
      
      // 禁用特定项的选择器
      showDisabledSelector: false,
      
      // 自定义配置的选择器
      showCustomSelector: false
    }
  },
  methods: {
    // 基础选择器确认
    handleBasicConfirm(selectedItems) {
      this.basicSelected = selectedItems[0]
      this.$message.success('选择成功')
    },
    
    // 多选选择器确认
    handleMultipleConfirm(selectedItems) {
      this.multipleSelected = selectedItems
      this.$message.success(`成功选择 ${selectedItems.length} 项`)
    },
    
    // 带默认值的选择器确认
    handleDefaultConfirm(selectedItems) {
      this.defaultSelected = selectedItems
      this.$message.success('更新成功')
    },
    
    // 禁用特定项的选择器确认
    handleDisabledConfirm(selectedItems) {
      this.$message.success(`成功选择 ${selectedItems.length} 项`)
    },
    
    // 自定义配置的选择器确认
    handleCustomConfirm(selectedItems) {
      this.$message.success(`自定义选择器选择成功，共 ${selectedItems.length} 项`)
    }
  }
}
</script>

<style lang="scss" scoped>
.demo-card {
  margin: 20px;
}

.demo-item {
  margin-bottom: 20px;
  
  .el-button {
    width: 100%;
    margin-bottom: 15px;
  }
  
  .selected-info {
    margin-top: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    
    p {
      margin: 0 0 10px 0;
      font-weight: 500;
      color: #606266;
    }
  }
  
  .demo-description {
    margin-top: 15px;
    
    p {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
}

.el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style> 