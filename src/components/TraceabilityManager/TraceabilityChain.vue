<template>
  <div class="traceability-chain">
    <!-- <div class="chain-header">
      <el-input 
        v-model="searchIdentifyCode" 
        placeholder="请输入识别码查询追溯链"
        style="width: 300px;"
      >
        <el-button slot="append" icon="el-icon-search" @click="loadTraceabilityChain" />
      </el-input>
      <el-button type="primary" @click="exportTraceabilityData">导出追溯数据</el-button>
    </div> -->

    <div class="chain-content" v-loading="loading">
      <!-- 追溯链时间轴 -->
      <el-timeline v-if="traceabilityData.length > 0">
        <el-timeline-item 
          v-for="(item, index) in traceabilityData" 
          :key="index"
          :timestamp="formatDateTime(item.createTime)"
          :type="getTimelineType(item.flowStep)"
          :icon="getTimelineIcon(item.flowStep)"
          placement="top"
        >
          <el-card class="timeline-card" shadow="hover">
            <div class="card-header">
              <div class="step-info">
                <el-tag :type="getFlowStepTagType(item.flowStep)" size="medium">
                  {{ getFlowStepText(item.flowStep) }}
                </el-tag>
                <span class="identify-code">{{ item.identifyCode }}</span>
              </div>
            </div>
            
            <div class="card-content">
              <!-- 货物信息 -->
              <div class="goods-section" v-if="item.goods && item.goods.length > 0">
                <h4>货物信息</h4>
                <el-table :data="item.goods" size="small" border>
                  <el-table-column prop="goodNo" label="货物编号" width="150" />
                  <el-table-column prop="goodName" label="货物名称" min-width="200" />
                </el-table>
              </div>

              <!-- 源识别码信息 -->
              <div class="source-section" v-if="item.sourceCodes && item.sourceCodes.length > 0">
                <h4>源识别码</h4>
                <div class="source-codes">
                  <el-tag 
                    v-for="(source, idx) in item.sourceCodes" 
                    :key="idx"
                    class="source-tag"
                    @click="jumpToSourceCode(source.identifyCode)"
                  >
                    {{ source.identifyCode }}
                    <span class="change-reason">({{ getChangeReasonText(source.changeReason) }})</span>
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 空状态 -->
      <el-empty 
        v-else-if="!loading" 
        description="暂无追溯数据"
        :image-size="100"
      />
    </div>

    <!-- 关系图谱 -->
    <el-divider content-position="left">关系图谱</el-divider>
    <div v-if="traceabilityData.length > 0">
      <relationship-graph :traceability-data="traceabilityData" />
    </div>
    <el-empty 
      v-else 
      description="暂无数据生成关系图谱"
      :image-size="100"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import { 
  getFlowStepText, 
  getChangeReasonText,
  getGoodsStatusText
} from '@/constants/traceability'
import RelationshipGraph from './RelationshipGraph.vue'

export default {
  name: 'TraceabilityChain',
  components: {
    RelationshipGraph
  },
  props: {
    identifyCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchIdentifyCode: '',
      traceabilityData: [],
      loading: false
    }
  },
  mounted() {
    if (this.identifyCode) {
      this.searchIdentifyCode = this.identifyCode
      this.loadTraceabilityChain()
    }
  },
  methods: {
    // 加载追溯链数据
    async loadTraceabilityChain() {
      if (!this.searchIdentifyCode) {
        this.$message.warning('请输入识别码')
        return
      }

      this.loading = true
      try {
        // 模拟API调用
        const response = await this.mockTraceabilityAPI(this.searchIdentifyCode)
        this.traceabilityData = response.data || []
        
        if (this.traceabilityData.length === 0) {
          this.$message.info('未找到相关追溯数据')
        }
      } catch (error) {
        this.$message.error('加载追溯数据失败')
        console.error('追溯数据加载失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 模拟追溯API（实际项目中替换为真实API）
    async mockTraceabilityAPI(identifyCode) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              {
                identifyCode: 'PUR20241011ABC123',
                flowStep: 'purchase',
                createTime: '2024-10-01 09:00:00',
                operationTime: '2024-10-01 09:30:00',
                processor: '张三',
                location: '采购部门',
                orderId: 'ORD001',
                goods: [
                  {
                    goodNo: 'G001',
                    goodName: 'PVC原料',
                    goodCount: 1000,
                    goodWeight: '500kg',
                    goodStatus: 'completed'
                  }
                ],
                sourceCodes: [],
                remark: '初次采购'
              },
              {
                identifyCode: 'TRA20241011DEF456',
                flowStep: 'transport',
                createTime: '2024-10-02 10:00:00',
                operationTime: '2024-10-02 14:00:00',
                processor: '李四',
                location: '运输途中',
                orderId: 'ORD002',
                goods: [
                  {
                    goodNo: 'G001',
                    goodName: 'PVC原料',
                    goodCount: 1000,
                    goodWeight: '500kg',
                    goodStatus: 'in_transit'
                  }
                ],
                sourceCodes: [
                  {
                    identifyCode: 'PUR20241011ABC123',
                    changeReason: 'initial'
                  }
                ],
                remark: '运输至加工厂'
              },
              {
                identifyCode: 'PRO20241011GHI789',
                flowStep: 'process',
                createTime: '2024-10-03 08:00:00',
                operationTime: '2024-10-03 16:00:00',
                processor: '王五',
                location: '加工车间A',
                orderId: 'ORD003',
                goods: [
                  {
                    goodNo: 'G002',
                    goodName: 'PVC透明片',
                    goodCount: 800,
                    goodWeight: '400kg',
                    goodStatus: 'processing'
                  },
                  {
                    goodNo: 'G003',
                    goodName: 'PVC绿色片',
                    goodCount: 200,
                    goodWeight: '100kg',
                    goodStatus: 'processing'
                  }
                ],
                sourceCodes: [
                  {
                    identifyCode: 'TRA20241011DEF456',
                    changeReason: 'category_change'
                  }
                ],
                remark: '加工分拣为透明和绿色两种'
              }
            ]
          })
        }, 1000)
      })
    },

    // 获取时间轴类型
    getTimelineType(flowStep) {
      const typeMap = {
        'purchase': 'success',
        'transport': 'info',
        'process': 'warning',
        'storage': 'primary',
        'sales': 'danger'
      }
      return typeMap[flowStep] || 'info'
    },

    // 获取时间轴图标
    getTimelineIcon(flowStep) {
      const iconMap = {
        'purchase': 'el-icon-shopping-cart-2',
        'transport': 'el-icon-truck',
        'process': 'el-icon-setting',
        'storage': 'el-icon-box',
        'sales': 'el-icon-sell'
      }
      return iconMap[flowStep] || 'el-icon-info'
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

    // 获取货物状态标签类型
    getGoodsStatusTagType(status) {
      const typeMap = {
        'in_stock': 'success',
        'in_transit': 'info',
        'processing': 'warning',
        'completed': 'primary',
        'sold': 'danger'
      }
      return typeMap[status] || 'info'
    },

    // 跳转到源识别码
    jumpToSourceCode(sourceCode) {
      this.searchIdentifyCode = sourceCode
      this.loadTraceabilityChain()
    },

    // 查看订单详情
    viewOrderDetail(item) {
      this.$emit('view-order', item.orderId)
    },

    // 导出追溯数据
    exportTraceabilityData() {
      if (this.traceabilityData.length === 0) {
        this.$message.warning('暂无数据可导出')
        return
      }
      
      // 实现导出逻辑
      this.$message.success('导出功能开发中...')
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 获取流转步骤文本
    getFlowStepText,

    // 获取变更原因文本
    getChangeReasonText,

    // 获取货物状态文本
    getGoodsStatusText
  }
}
</script>

<style lang="scss" scoped>
.traceability-chain {
  .chain-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .chain-content {
    min-height: 400px;
  }

  .timeline-card {
    margin-bottom: 10px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      .step-info {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .identify-code {
          font-family: monospace;
          font-weight: bold;
          color: #409eff;
        }
      }
    }

    .card-content {
      .goods-section,
      .source-section,
      .operation-section {
        margin-bottom: 15px;
        
        h4 {
          margin: 0 0 10px 0;
          color: #303133;
          font-size: 14px;
        }
      }

      .source-codes {
        .source-tag {
          margin-right: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          
          .change-reason {
            font-size: 12px;
            opacity: 0.8;
          }
          
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .relationship-graph {
    min-height: 300px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .graph-placeholder {
      text-align: center;
      color: #909399;
    }
  }
}
</style>
