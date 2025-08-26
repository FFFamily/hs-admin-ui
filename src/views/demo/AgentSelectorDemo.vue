<template>
  <div class="agent-selector-demo">
    <el-card>
      <div slot="header">
        <span>经办人选择器组件示例</span>
      </div>
      
      <div class="demo-section">
        <h3>单选模式</h3>
        <el-button type="primary" @click="showSingleSelector">选择单个经办人</el-button>
        <div v-if="singleSelectedAgent" class="selected-info">
          <p>已选择经办人：</p>
          <el-tag type="success">{{ singleSelectedAgent.name }}</el-tag>
          <span style="margin-left: 10px; color: #666;">
            ({{ singleSelectedAgent.no }} - {{ singleSelectedAgent.phone }})
          </span>
        </div>
      </div>

      <div class="demo-section">
        <h3>多选模式</h3>
        <el-button type="success" @click="showMultipleSelector">选择多个经办人</el-button>
        <div v-if="multipleSelectedAgents.length > 0" class="selected-info">
          <p>已选择经办人：</p>
          <div class="selected-tags">
            <el-tag
              v-for="agent in multipleSelectedAgents"
              :key="agent.id"
              type="success"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ agent.name }} - {{ agent.no }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>带默认选择的多选模式</h3>
        <el-button type="warning" @click="showDefaultSelector">选择经办人（带默认值）</el-button>
        <div v-if="defaultSelectedAgents.length > 0" class="selected-info">
          <p>已选择经办人：</p>
          <div class="selected-tags">
            <el-tag
              v-for="agent in defaultSelectedAgents"
              :key="agent.id"
              type="warning"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ agent.name }} - {{ agent.no }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>禁用某些经办人的选择</h3>
        <el-button type="info" @click="showDisabledSelector">选择经办人（部分禁用）</el-button>
        <div v-if="disabledSelectedAgents.length > 0" class="selected-info">
          <p>已选择经办人：</p>
          <div class="selected-tags">
            <el-tag
              v-for="agent in disabledSelectedAgents"
              :key="agent.id"
              type="info"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ agent.name }} - {{ agent.no }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 单选经办人选择器 -->
    <AgentSelector
      :visible.sync="singleSelectorVisible"
      title="选择单个经办人"
      :multiple="false"
      @confirm="handleSingleConfirm"
      @close="handleSelectorClose"
    />

    <!-- 多选经办人选择器 -->
    <AgentSelector
      :visible.sync="multipleSelectorVisible"
      title="选择多个经办人"
      :multiple="true"
      @confirm="handleMultipleConfirm"
      @close="handleSelectorClose"
    />

    <!-- 带默认选择的多选经办人选择器 -->
    <AgentSelector
      :visible.sync="defaultSelectorVisible"
      title="选择经办人（带默认值）"
      :multiple="true"
      :default-selected="defaultSelectedAgents"
      @confirm="handleDefaultConfirm"
      @close="handleSelectorClose"
    />

    <!-- 禁用某些经办人的选择器 -->
    <AgentSelector
      :visible.sync="disabledSelectorVisible"
      title="选择经办人（部分禁用）"
      :multiple="true"
      :disabled-agents="[1, 3]"
      @confirm="handleDisabledConfirm"
      @close="handleSelectorClose"
    />
  </div>
</template>

<script>
import AgentSelector from '@/components/AgentSelector'

export default {
  name: 'AgentSelectorDemo',
  components: {
    AgentSelector
  },
  data() {
    return {
      // 单选相关
      singleSelectorVisible: false,
      singleSelectedAgent: null,
      
      // 多选相关
      multipleSelectorVisible: false,
      multipleSelectedAgents: [],
      
      // 默认选择相关
      defaultSelectorVisible: false,
      defaultSelectedAgents: [
        { id: 2, name: '李四', no: 'AG002', phone: '13800138002', accountName: '李四账号' }
      ],
      
      // 禁用经办人相关
      disabledSelectorVisible: false,
      disabledSelectedAgents: []
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

    // 显示禁用某些经办人的选择器
    showDisabledSelector() {
      this.disabledSelectorVisible = true
    },

    // 单选确认处理
    handleSingleConfirm(agents) {
      this.singleSelectedAgent = agents[0]
      this.$message.success(`已选择经办人：${agents[0].name}`)
    },

    // 多选确认处理
    handleMultipleConfirm(agents) {
      this.multipleSelectedAgents = agents
      this.$message.success(`已选择 ${agents.length} 个经办人`)
    },

    // 默认选择确认处理
    handleDefaultConfirm(agents) {
      this.defaultSelectedAgents = agents
      this.$message.success(`已选择 ${agents.length} 个经办人`)
    },

    // 禁用经办人选择确认处理
    handleDisabledConfirm(agents) {
      this.disabledSelectedAgents = agents
      this.$message.success(`已选择 ${agents.length} 个经办人`)
    },

    // 选择器关闭处理
    handleSelectorClose() {
      console.log('经办人选择器已关闭')
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-selector-demo {
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