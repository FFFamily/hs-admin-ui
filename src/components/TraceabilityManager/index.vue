<template>
  <div class="traceability-manager">
    <!-- 识别码管理区域 -->
    <el-card class="identify-code-card" shadow="never">
      <div slot="header" class="card-header">
        <span>订单识别码管理</span>
        <el-button type="primary" size="small" @click="showTraceabilityDialog">
          查看追溯链
        </el-button>
      </div>
      
      <el-alert
        title="说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 15px;"
      >
        <div slot="description">
          <p>• 每个订单只有一个主识别码，订单中的所有货物都使用此识别码</p>
          <p>• 用户可以手动选择使用进项或销项明细，根据实际业务需要决定</p>
          <p>• 源识别码用于追溯货物的来源和流转历程</p>
        </div>
      </el-alert>
      
      <!-- 当前识别码 -->
      <el-form label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单识别码" required>
              <el-input 
                v-model="currentIdentifyCode" 
                placeholder="请手动输入订单识别码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流转步骤">
              <el-select 
                v-model="currentFlowStep" 
                placeholder="请选择当前流转步骤"
                @change="onFlowStepChange"
                style="width: 100%"
              >
                <el-option 
                  v-for="option in flowStepOptions" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 源识别码管理 -->
      <el-divider content-position="left">源识别码</el-divider>
      <div class="source-codes-section">
        <el-button type="success" size="small" @click="addSourceCode">
          添加源识别码
        </el-button>
        <el-button 
          type="warning" 
          size="small" 
          @click="showSourceCodeSelector"
          v-if="currentFlowStep !== 'purchase'"
        >
          从库存选择
        </el-button>
      </div>
      
      <el-table 
        :data="sourceCodes" 
        border 
        size="small" 
        style="margin-top: 10px;"
        v-if="sourceCodes.length > 0"
      >
        <el-table-column prop="identifyCode" label="源识别码" width="180">
          <template slot-scope="scope">
            <el-input 
              v-model="scope.row.identifyCode" 
              placeholder="请输入源识别码"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column prop="flowStep" label="来源步骤" width="120">
          <template slot-scope="scope">
            <el-tag size="small" :type="getFlowStepTagType(scope.row.flowStep)">
              {{ getFlowStepText(scope.row.flowStep) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goodsInfo" label="货物信息" min-width="200">
          <template slot-scope="scope">
            <div class="goods-info">
              <div>{{ scope.row.goodName || '--' }}</div>
              <div class="goods-detail">
                数量: {{ scope.row.goodCount || 0 }} | 
                重量: {{ scope.row.goodWeight || '--' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="changeReason" label="变更原因" width="150">
          <template slot-scope="scope">
            <el-select 
              v-model="scope.row.changeReason" 
              placeholder="选择原因"
              size="small"
            >
              <el-option 
                v-for="option in changeReasonOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button 
              type="danger" 
              size="mini" 
              icon="el-icon-delete"
              @click="removeSourceCode(scope.$index)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 追溯链查看弹窗 -->
    <el-dialog 
      title="货物追溯链" 
      :visible.sync="traceabilityDialogVisible" 
      width="80%"
      :close-on-click-modal="false"
      append-to-body
    >
      <traceability-chain 
        :identify-code="currentIdentifyCode"
        v-if="traceabilityDialogVisible"
      />
    </el-dialog>

    <!-- 库存识别码选择弹窗 -->
    <el-dialog 
      title="选择库存识别码" 
      :visible.sync="sourceCodeSelectorVisible" 
      width="70%"
      :close-on-click-modal="false"
    >
      <inventory-identify-code-selector 
        :visible="sourceCodeSelectorVisible"
        @confirm="handleSourceCodeSelected"
        @cancel="sourceCodeSelectorVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import { 
  FLOW_STEP_OPTIONS, 
  IDENTIFY_CODE_CHANGE_REASON_OPTIONS,
  getFlowStepText,
  getChangeReasonText
} from '@/constants/traceability'
import TraceabilityChain from './TraceabilityChain.vue'
import InventoryIdentifyCodeSelector from './InventoryIdentifyCodeSelector.vue'

export default {
  name: 'TraceabilityManager',
  components: {
    TraceabilityChain,
    InventoryIdentifyCodeSelector
  },
  props: {
    value: {
      type: Object,
      default: () => ({
        currentIdentifyCode: '',
        currentFlowStep: '',
        sourceCodes: []
      })
    },
    orderType: {
      type: String,
      default: ''
    },
    canEditIdentifyCode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentIdentifyCode: '',
      currentFlowStep: '',
      sourceCodes: [],
      flowStepOptions: FLOW_STEP_OPTIONS,
      changeReasonOptions: IDENTIFY_CODE_CHANGE_REASON_OPTIONS,
      traceabilityDialogVisible: false,
      sourceCodeSelectorVisible: false,
      isUpdating: false // 防止循环更新的标志
    }
  },
  computed: {
    // 移除自动生成相关的计算属性
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal && !this.isUpdating) {
          this.currentIdentifyCode = newVal.currentIdentifyCode || ''
          this.currentFlowStep = newVal.currentFlowStep || ''
          this.sourceCodes = newVal.sourceCodes || []
        }
      },
      immediate: true,
      deep: true
    },
    currentIdentifyCode() {
      this.emitChange()
    },
    currentFlowStep() {
      this.emitChange()
    },
    sourceCodes: {
      handler() {
        this.emitChange()
      },
      deep: true
    }
  },
  methods: {
    // 移除自动生成识别码的方法

    // 流转步骤变更
    onFlowStepChange(step) {
      // 如果是采购步骤，清空源识别码
      if (step === 'purchase') {
        this.sourceCodes = []
      }
    },

    // 添加源识别码
    addSourceCode() {
      this.sourceCodes.push({
        identifyCode: '',
        flowStep: '',
        goodName: '',
        goodCount: 0,
        goodWeight: '',
        changeReason: 'initial'
      })
    },

    // 移除源识别码
    removeSourceCode(index) {
      this.sourceCodes.splice(index, 1)
    },

    // 显示源识别码选择器
    showSourceCodeSelector() {
      this.sourceCodeSelectorVisible = true
    },

    // 处理源识别码选择
    handleSourceCodeSelected(selectedCodes) {
      selectedCodes.forEach(code => {
        this.sourceCodes.push({
          identifyCode: code.identifyCode,
          flowStep: code.flowStep,
          goodName: code.goodName,
          goodCount: code.goodCount,
          goodWeight: code.goodWeight,
          changeReason: 'initial'
        })
      })
      this.sourceCodeSelectorVisible = false
    },

    // 显示追溯链弹窗
    showTraceabilityDialog() {
      if (!this.currentIdentifyCode) {
        this.$message.warning('请先输入识别码')
        return
      }
      this.traceabilityDialogVisible = true
    },

    // 获取流转步骤标签类型
    getFlowStepTagType(step) {
      const typeMap = {
        'purchase': 'success',
        'transport': 'info',
        'process': 'warning',
        'storage': 'primary',
        'sales': 'danger'
      }
      return typeMap[step] || 'info'
    },

    // 获取流转步骤文本
    getFlowStepText,

    // 获取变更原因文本
    getChangeReasonText,

    // 发送变更事件
    emitChange() {
      this.isUpdating = true
      const value = {
        currentIdentifyCode: this.currentIdentifyCode,
        currentFlowStep: this.currentFlowStep,
        sourceCodes: this.sourceCodes
      }
      this.$emit('input', value)
      this.$emit('change', value)
      this.$nextTick(() => {
        this.isUpdating = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.traceability-manager {
  .identify-code-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .source-codes-section {
    margin-bottom: 10px;
    
    .el-button {
      margin-right: 10px;
    }
  }

  .goods-info {
    .goods-detail {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}
</style>
