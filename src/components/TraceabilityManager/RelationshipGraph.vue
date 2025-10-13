<template>
  <div class="relationship-graph">
    <div class="graph-header">
      <!-- 操作按钮 -->
      <div class="graph-toolbar">
        <el-button-group size="small">
          <el-button @click="resetLayout" icon="el-icon-refresh">重置布局</el-button>
          <el-button @click="fitView" icon="el-icon-full-screen">适应视图</el-button>
          <el-button @click="exportGraph" icon="el-icon-download">导出图片</el-button>
        </el-button-group>
        
        <div class="layout-options">
          <span class="option-label">布局方式：</span>
          <el-select v-model="layoutType" @change="updateLayout" size="small" style="width: 120px;">
            <el-option label="力导向图" value="force" />
            <el-option label="环形布局" value="circular" />
            <el-option label="层次布局" value="none" />
          </el-select>
        </div>
      </div>
      
      <!-- 图例说明 -->
      <div class="graph-legend">
        <span class="legend-title">订单类型：</span>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color purchase"></div>
            <span>采购</span>
          </div>
          <div class="legend-item">
            <div class="legend-color transport"></div>
            <span>运输</span>
          </div>
          <div class="legend-item">
            <div class="legend-color process"></div>
            <span>加工</span>
          </div>
          <div class="legend-item">
            <div class="legend-color storage"></div>
            <span>仓储</span>
          </div>
          <div class="legend-item">
            <div class="legend-color sales"></div>
            <span>销售</span>
          </div>
        </div>
      </div>
    </div>
    
    <div 
      ref="chartContainer" 
      class="chart-container"
      v-loading="loading"
      element-loading-text="正在生成关系图..."
    ></div>
    

    <!-- 节点详情弹窗 -->
    <el-dialog 
      title="订单详情" 
      :visible.sync="nodeDetailVisible" 
      width="60%"
      append-to-body
    >
      <div v-if="selectedNode">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="识别码">{{ selectedNode.identifyCode }}</el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <el-tag :type="getFlowStepTagType(selectedNode.flowStep)">
              {{ getFlowStepText(selectedNode.flowStep) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">{{ selectedNode.processor || '--' }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ formatDateTime(selectedNode.operationTime) }}</el-descriptions-item>
          <el-descriptions-item label="地点">{{ selectedNode.location || '--' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ selectedNode.remark || '--' }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 货物信息 -->
        <el-divider content-position="left">货物信息</el-divider>
        <el-table :data="selectedNode.goods" size="small" border>
          <el-table-column prop="goodNo" label="货物编号" width="120" />
          <el-table-column prop="goodName" label="货物名称" min-width="150" />
          <el-table-column prop="goodCount" label="数量" width="80" align="center" />
          <el-table-column prop="goodWeight" label="重量" width="100" align="center" />
        </el-table>
        
        <!-- 源识别码信息 -->
        <div v-if="selectedNode.sourceCodes && selectedNode.sourceCodes.length > 0">
          <el-divider content-position="left">源识别码</el-divider>
          <div class="source-codes">
            <el-tag 
              v-for="(source, idx) in selectedNode.sourceCodes" 
              :key="idx"
              class="source-tag"
              @click="jumpToSourceNode(source.identifyCode)"
            >
              {{ source.identifyCode }}
              <span class="change-reason">({{ getChangeReasonText(source.changeReason) }})</span>
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { parseTime } from '@/utils'
import { 
  getFlowStepText, 
  getChangeReasonText 
} from '@/constants/traceability'

export default {
  name: 'RelationshipGraph',
  props: {
    traceabilityData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null,
      loading: false,
      layoutType: 'force',
      nodeDetailVisible: false,
      selectedNode: null,
      // 节点颜色配置
      nodeColors: {
        purchase: '#67C23A',
        transport: '#409EFF', 
        process: '#E6A23C',
        storage: '#909399',
        sales: '#F56C6C'
      }
    }
  },
  mounted() {
    this.initChart()
    this.updateChart()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  watch: {
    traceabilityData: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  methods: {
    // 初始化图表
    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer)
      
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
      
      // 监听节点点击事件
      this.chart.on('click', this.handleNodeClick)
    },

    // 更新图表
    updateChart() {
      if (!this.chart || !this.traceabilityData.length) return
      
      this.loading = true
      
      try {
        const { nodes, links } = this.transformData()
        
        const option = {
          title: {
            text: '货物追溯关系图',
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
              if (params.dataType === 'node') {
                const data = params.data
                return `
                  <div style="padding: 8px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${data.name}</div>
                    <div>类型: ${this.getFlowStepText(data.category)}</div>
                    <div>时间: ${this.formatDateTime(data.createTime)}</div>
                    <div>操作人: ${data.processor || '--'}</div>
                    <div>地点: ${data.location || '--'}</div>
                  </div>
                `
              } else if (params.dataType === 'edge') {
                return `
                  <div style="padding: 8px;">
                    <div style="font-weight: bold;">关系连接</div>
                    <div>从: ${params.data.source}</div>
                    <div>到: ${params.data.target}</div>
                    <div>关系: ${this.getRelationText(params.data.relation)}</div>
                  </div>
                `
              }
            }
          },
          series: [{
            type: 'graph',
            layout: this.layoutType,
            data: nodes,
            links: links,
            categories: this.getCategories(),
            roam: true,
            label: {
              show: true,
              position: 'inside',
              formatter: (params) => {
                const data = params.data
                const stepText = this.getFlowStepText(data.category)
                const code = data.name
                // 显示订单类型和识别码（截断）
                const shortCode = code.length > 15 ? code.substring(0, 15) + '...' : code
                return `${stepText}\n${shortCode}`
              },
              fontSize: 11,
              fontWeight: 'bold',
              color: '#fff',
              textBorderColor: 'rgba(0,0,0,0.3)',
              textBorderWidth: 1
            },
            labelLayout: {
              hideOverlap: true
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3,
              width: 2
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 4
              },
              itemStyle: {
                borderWidth: 3,
                borderColor: '#333'
              }
            },
            force: this.layoutType === 'force' ? {
              repulsion: 1500,
              gravity: 0.08,
              edgeLength: [200, 400],
              layoutAnimation: true
            } : undefined,
            circular: this.layoutType === 'circular' ? {
              rotateLabel: true
            } : undefined,
            symbol: 'rect',
            symbolSize: [120, 60], // [宽度, 高度]
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 6
            }
          }]
        }
        
        this.chart.setOption(option, true)
      } catch (error) {
        console.error('图表更新失败:', error)
        this.$message.error('关系图生成失败')
      } finally {
        this.loading = false
      }
    },

    // 转换数据格式
    transformData() {
      const nodes = []
      const links = []
      const nodeMap = new Map()
      
      // 创建节点
      this.traceabilityData.forEach((item, index) => {
        const totalGoodsCount = item.goods ? item.goods.reduce((sum, good) => sum + (good.goodCount || 0), 0) : 0
        
        const node = {
          id: item.identifyCode,
          name: item.identifyCode,
          category: item.flowStep,
          value: totalGoodsCount,
          goodsCount: totalGoodsCount,
          itemStyle: {
            color: this.nodeColors[item.flowStep] || '#909399'
          },
          // 保存完整的原始数据用于详情展示
          ...item
        }
        
        nodes.push(node)
        nodeMap.set(item.identifyCode, node)
      })
      
      // 创建连接线
      this.traceabilityData.forEach(item => {
        if (item.sourceCodes && item.sourceCodes.length > 0) {
          item.sourceCodes.forEach(source => {
            if (nodeMap.has(source.identifyCode)) {
              links.push({
                source: source.identifyCode,
                target: item.identifyCode,
                relation: source.changeReason || 'flow',
                lineStyle: {
                  color: this.getRelationColor(source.changeReason)
                }
              })
            }
          })
        }
      })
      
      return { nodes, links }
    },

    // 获取分类配置
    getCategories() {
      return [
        { name: 'purchase', itemStyle: { color: this.nodeColors.purchase } },
        { name: 'transport', itemStyle: { color: this.nodeColors.transport } },
        { name: 'process', itemStyle: { color: this.nodeColors.process } },
        { name: 'storage', itemStyle: { color: this.nodeColors.storage } },
        { name: 'sales', itemStyle: { color: this.nodeColors.sales } }
      ]
    },

    // 获取关系线颜色
    getRelationColor(relation) {
      const colorMap = {
        'initial': '#409EFF',
        'merge': '#67C23A',
        'split': '#E6A23C',
        'reprocess': '#F56C6C',
        'category_change': '#909399'
      }
      return colorMap[relation] || '#DCDFE6'
    },

    // 获取关系文本
    getRelationText(relation) {
      const textMap = {
        'initial': '初始创建',
        'merge': '合并批次',
        'split': '分拆批次',
        'reprocess': '重新加工',
        'category_change': '分类变化',
        'flow': '流转'
      }
      return textMap[relation] || '流转'
    },

    // 处理节点点击事件
    handleNodeClick(params) {
      if (params.dataType === 'node') {
        this.selectedNode = params.data
        this.nodeDetailVisible = true
      }
    },

    // 跳转到源节点
    jumpToSourceNode(identifyCode) {
      this.nodeDetailVisible = false
      // 高亮显示指定节点
      this.chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: this.traceabilityData.findIndex(item => item.identifyCode === identifyCode)
      })
    },

    // 重置布局
    resetLayout() {
      if (this.chart) {
        this.chart.dispatchAction({
          type: 'graphRoam',
          zoom: 1,
          x: 0,
          y: 0
        })
      }
    },

    // 适应视图
    fitView() {
      if (this.chart) {
        this.chart.resize()
      }
    },

    // 导出图片
    exportGraph() {
      if (this.chart) {
        const url = this.chart.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        })
        
        const link = document.createElement('a')
        link.download = `追溯关系图_${new Date().getTime()}.png`
        link.href = url
        link.click()
      }
    },

    // 更新布局
    updateLayout() {
      this.updateChart()
    },

    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
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

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 获取流转步骤文本
    getFlowStepText,

    // 获取变更原因文本
    getChangeReasonText
  }
}
</script>

<style lang="scss" scoped>
.relationship-graph {
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .graph-header {
    margin-bottom: 15px;
  }
  
  .graph-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding: 12px 15px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    
    .layout-options {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .option-label {
        font-size: 13px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
  
  .graph-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 15px;
    background: #fafbfc;
    border-radius: 6px;
    border: 1px solid #ebeef5;
    
    .legend-title {
      font-size: 13px;
      color: #606266;
      font-weight: 500;
      margin-right: 15px;
    }
    
    .legend-items {
      display: flex;
      gap: 20px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #606266;
      
      .legend-color {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.8);
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        
        &.purchase { background-color: #67C23A; }
        &.transport { background-color: #409EFF; }
        &.process { background-color: #E6A23C; }
        &.storage { background-color: #909399; }
        &.sales { background-color: #F56C6C; }
      }
    }
  }
  
  .chart-container {
    width: 90%;
    height: 550px;
    margin: 0 auto;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
</style>
