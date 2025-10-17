<template>
  <div class="relationship-graph">
    <div class="graph-header">
      <!-- 操作按钮 -->
      <div class="graph-toolbar">
        <el-button-group size="small">
          <el-button icon="el-icon-refresh" @click="resetLayout">重置布局</el-button>
          <el-button icon="el-icon-full-screen" @click="fitView">适应视图</el-button>
        </el-button-group>
      </div>

      <!-- 图例说明 -->
      <div class="graph-legend">
        <span class="legend-title">订单类型：</span>
        <div class="legend-items">
          <div
            v-for="item in orderTypeLegends"
            :key="item.value"
            class="legend-item"
          >
            <div
              class="legend-color"
              :style="{ backgroundColor: item.color }"
            />
            <span>{{ item.label }}</span>
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
  ORDER_TYPE_OPTIONS,
  getOrderTypeText
} from '@/constants/orderTypes'

export default {
  name: 'RelationshipGraph',
  props: {
    graphData: {
      type: Object,
      default: () => ({})
    },
    allOrders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null,
      loading: false,
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
  computed: {
    // 动态生成图例数据
    orderTypeLegends() {
      return ORDER_TYPE_OPTIONS.map(option => ({
        label: option.label,
        value: option.value,
        color: this.nodeColors[option.value] || this.nodeColors[ORDER_TYPES.OTHER]
      }))
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
                const changeReason = params.data.changeReason || '--'
                return `
                  <div style="padding: 8px;">
                    <div style="font-weight: bold;">变更原因: ${changeReason}</div>
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
                const identifyCode = data.identifyCode || '--'
                // 显示订单类型和识别码
                return `${typeText}\n${identifyCode}`
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

      

      // 第一遍遍历：收集所有出现在 value 中的节点信息
      Object.keys(this.graphData).forEach(orderId => {
        
        const targetOrders = this.graphData[orderId]
        
        // 为 value 中的节点收集 context 信息
        if (targetOrders && targetOrders.length > 0) {
          targetOrders.forEach(targetOrder => {
            if (!nodeMap.has(targetOrder.orderId)) {
              const orderType = targetOrder.context.type || ORDER_TYPES.OTHER
              
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
              changeReason: targetOrder.changeReason || '--', // 变更原因
              lineStyle: {
                color: this.nodeColors[orderType] || this.nodeColors[ORDER_TYPES.OTHER]
              }
            })
          })
        }
      })

      // 将 Map 转换为数组
      nodes.push(...nodeMap.values())

      
      

      return { nodes, links }
    },

    // 查找订单信息
    findOrderInfo(orderId) {
      
      // 从 allOrders 数组中查找订单信息
      if (!this.allOrders || !Array.isArray(this.allOrders)) {
        return null
      }
      
      const order = this.allOrders.find(o => o.id === orderId)
      
      if (order) {
        // 组装 context 格式
        return {
          no: order.no,
          type: order.type,
          identifyCode: order.identifyCode
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

    // 处理窗口大小变化
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
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
    justify-content: center;
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
