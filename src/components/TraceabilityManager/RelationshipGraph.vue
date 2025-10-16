<template>
  <div class="relationship-graph">
    <div class="graph-header">
      <!-- 操作按钮 -->
      <div class="graph-toolbar">
        <el-button-group size="small">
          <el-button icon="el-icon-refresh" @click="resetLayout">重置布局</el-button>
          <el-button icon="el-icon-full-screen" @click="fitView">适应视图</el-button>
          <el-button icon="el-icon-download" @click="exportGraph">导出图片</el-button>
        </el-button-group>
      </div>

      <!-- 图例说明 -->
      <div class="graph-legend">
        <span class="legend-title">订单类型：</span>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color purchase" />
            <span>采购</span>
          </div>
          <div class="legend-item">
            <div class="legend-color transport" />
            <span>运输</span>
          </div>
          <div class="legend-item">
            <div class="legend-color process" />
            <span>加工</span>
          </div>
          <div class="legend-item">
            <div class="legend-color storage" />
            <span>仓储</span>
          </div>
          <div class="legend-item">
            <div class="legend-color sales" />
            <span>销售</span>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="chartContainer"
      v-loading="loading"
      class="chart-container"
      element-loading-text="正在生成关系图..."
    />

    <!-- 节点详情弹窗 -->
    <el-dialog
      title="订单详情"
      :visible.sync="nodeDetailVisible"
      width="60%"
      append-to-body
    >
      <div v-if="selectedNode">
        <el-form label-width="100px" size="small" class="node-detail-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="订单ID">
                <span>{{ selectedNode.orderId }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单编号">
                <span>{{ selectedNode.orderNo }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="识别码">
                <span>{{ selectedNode.identifyCode }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单类型">
                <el-tag :type="getFlowStepTagType(selectedNode.orderType)">
                  {{ getOrderTypeText(selectedNode.orderType) }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
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
import {
  ORDER_TYPES,
  getOrderTypeText,
  ORDER_TYPE_TAG_TYPE
} from '@/constants/orderTypes'

export default {
  name: 'RelationshipGraph',
  props: {
    graphData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null,
      loading: false,
      nodeDetailVisible: false,
      selectedNode: null,
      // 节点颜色配置 - 与订单类型对应
      nodeColors: {
        [ORDER_TYPES.PURCHASE]: '#67C23A',    // 采购 - 绿色
        [ORDER_TYPES.TRANSPORT]: '#409EFF',   // 运输 - 蓝色
        [ORDER_TYPES.PROCESS]: '#E6A23C',     // 加工 - 橙色
        [ORDER_TYPES.STORAGE]: '#909399',     // 仓储 - 灰色
        [ORDER_TYPES.SALES]: '#F56C6C',       // 销售 - 红色
        [ORDER_TYPES.OTHER]: '#909399'        // 其他 - 灰色
      }
    }
  },
  watch: {
    graphData: {
      handler() {
        this.updateChart()
      },
      deep: true
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
      if (!this.chart || !this.graphData || Object.keys(this.graphData).length === 0) return

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
                    <div style="font-weight: bold; margin-bottom: 5px;">订单编号: ${data.orderNo}</div>
                    <div>订单ID: ${data.orderId}</div>
                    <div>类型: ${getOrderTypeText(data.orderType)}</div>
                    <div>识别码: ${data.identifyCode}</div>
                  </div>
                `
              } else if (params.dataType === 'edge') {
                return `
                  <div style="padding: 8px;">
                    <div style="font-weight: bold;">依赖关系</div>
                    <div>从: ${params.data.sourceName}</div>
                    <div>到: ${params.data.targetName}</div>
                  </div>
                `
              }
            }
          },
          series: [{
            type: 'graph',
            layout: 'force',
            data: nodes,
            links: links,
            categories: this.getCategories(),
            roam: true,
            label: {
              show: true,
              position: 'inside',
              formatter: (params) => {
                const data = params.data
                const typeText = getOrderTypeText(data.orderType)
                const orderNo = data.orderNo
                // 显示订单类型和订单编号（截断）
                const shortNo = orderNo.length > 12 ? orderNo.substring(0, 12) + '...' : orderNo
                return `${typeText}\n${shortNo}`
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
            force: {
              repulsion: 1500,
              gravity: 0.08,
              edgeLength: [200, 400],
              layoutAnimation: true
            },
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

    // 转换数据格式 - 适配邻接表
    transformData() {
      const nodes = []
      const links = []
      const nodeMap = new Map()

      console.log('开始转换图数据，原始数据:', this.graphData)

      // 第一遍遍历：收集所有出现在 value 中的节点信息
      Object.keys(this.graphData).forEach(orderId => {
        
        const targetOrders = this.graphData[orderId]
        console.log(`第一遍遍历：收集所有出现在 value 中的节点信息，orderId: ${orderId} 判断信息：${targetOrders && targetOrders.length > 0}`,)
        // 为 value 中的节点收集 context 信息
        if (targetOrders && targetOrders.length > 0) {
          targetOrders.forEach(targetOrder => {
            if (!nodeMap.has(targetOrder.orderId)) {
              const orderType = targetOrder.context.type || ORDER_TYPES.OTHER
              console.log(`节点 ${targetOrder.orderId} 订单类型: ${orderType}`)
              const node = {
                id: targetOrder.orderId,
                name: targetOrder.context.no,
                orderId: targetOrder.orderId,
                orderNo: targetOrder.context.no,
                orderType: orderType,
                identifyCode: targetOrder.context.identifyCode,
                category: orderType,
                itemStyle: {
                  color: this.nodeColors[orderType] || this.nodeColors[ORDER_TYPES.OTHER]
                }
              }
              nodeMap.set(targetOrder.orderId, node)
            }
          })
        }
      })

      // 第二遍遍历：创建 key 节点和连接线
      Object.keys(this.graphData).forEach(orderId => {
        const targetOrders = this.graphData[orderId]

        // 为 key 节点创建节点（如果还没创建）
        if (!nodeMap.has(orderId)) {
          console.log(`为 key 节点 ${orderId} 创建节点`)
          // 查找该节点的信息
          const orderInfo = this.findOrderInfo(orderId)
          const orderType = orderInfo ? (orderInfo.type || ORDER_TYPES.OTHER) : ORDER_TYPES.OTHER

          const node = {
            id: orderId,
            name: orderInfo ? orderInfo.no : orderId,
            orderId: orderId,
            orderNo: orderInfo ? orderInfo.no : orderId,
            orderType: orderType,
            identifyCode: orderInfo ? orderInfo.identifyCode : '--',
            category: orderType,
            itemStyle: {
              color: this.nodeColors[orderType] || this.nodeColors[ORDER_TYPES.OTHER]
            }
          }
          nodeMap.set(orderId, node)
        }

        // 创建连接线：从 key 指向 value
        if (targetOrders && targetOrders.length > 0) {
          targetOrders.forEach(targetOrder => {
            const orderType = targetOrder.context.type || ORDER_TYPES.OTHER
            links.push({
              source: orderId, // 从 key
              target: targetOrder.orderId, // 指向 value
              sourceName: nodeMap.get(orderId)?.orderNo || orderId,
              targetName: targetOrder.context.no,
              lineStyle: {
                color: this.nodeColors[orderType] || this.nodeColors[ORDER_TYPES.OTHER]
              }
            })
          })
        }
      })

      // 将 Map 转换为数组
      nodes.push(...nodeMap.values())

      console.log('图数据转换完成，节点数量:', nodes.length, '连接数量:', links.length)
      console.log('转换后的节点:', nodes)

      return { nodes, links }
    },

    // 查找订单信息
    findOrderInfo(orderId) {
      // 遍历所有节点的目标节点列表，查找该订单的 context 信息
      for (const targetOrders of Object.values(this.graphData)) {
        if (targetOrders && targetOrders.length > 0) {
          const found = targetOrders.find(t => t.orderId === orderId)
          if (found) {
            return found.context
          }
        }
      }
      return null
    },

    // 获取分类配置
    getCategories() {
      return [
        { name: ORDER_TYPES.PURCHASE, itemStyle: { color: this.nodeColors[ORDER_TYPES.PURCHASE] }},
        { name: ORDER_TYPES.TRANSPORT, itemStyle: { color: this.nodeColors[ORDER_TYPES.TRANSPORT] }},
        { name: ORDER_TYPES.PROCESS, itemStyle: { color: this.nodeColors[ORDER_TYPES.PROCESS] }},
        { name: ORDER_TYPES.STORAGE, itemStyle: { color: this.nodeColors[ORDER_TYPES.STORAGE] }},
        { name: ORDER_TYPES.SALES, itemStyle: { color: this.nodeColors[ORDER_TYPES.SALES] }},
        { name: ORDER_TYPES.OTHER, itemStyle: { color: this.nodeColors[ORDER_TYPES.OTHER] }}
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
    jumpToSourceNode(orderId) {
      this.nodeDetailVisible = false
      // 可以添加高亮逻辑
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

    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },

    // 获取流转步骤标签类型
    getFlowStepTagType(orderType) {
      const typeMap = {
        [ORDER_TYPES.PURCHASE]: 'success',
        [ORDER_TYPES.TRANSPORT]: 'info',
        [ORDER_TYPES.PROCESS]: 'warning',
        [ORDER_TYPES.STORAGE]: 'primary',
        [ORDER_TYPES.SALES]: 'danger',
        [ORDER_TYPES.OTHER]: 'info'
      }
      return typeMap[orderType] || 'info'
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 获取流转步骤文本
    getFlowStepText,

    // 获取变更原因文本
    getChangeReasonText,

    // 获取订单类型文本（从 orderTypes.js 导入）
    getOrderTypeText
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
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 10px;
    padding: 12px 15px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
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

  // 节点详情表单样式
  .node-detail-form {
    ::v-deep .el-form-item {
      margin-bottom: 15px;

      .el-form-item__label {
        font-weight: 600;
        color: #606266;
      }

      .el-form-item__content {
        span {
          color: #303133;
        }
      }
    }
  }
}
</style>
