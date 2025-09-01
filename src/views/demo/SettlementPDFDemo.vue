<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>结算单PDF生成演示</span>
      </div>
      
      <el-form :inline="true" class="demo-form">
        <el-form-item label="订单编号">
          <el-input v-model="demoOrder.no" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="订单类型">
          <el-select v-model="demoOrder.type" placeholder="请选择订单类型">
            <el-option label="采购订单" value="purchase" />
            <el-option label="销售订单" value="sales" />
            <el-option label="运输订单" value="transport" />
          </el-select>
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number v-model="demoOrder.totalAmount" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openSettlementPDF">生成结算单PDF</el-button>
        </el-form-item>
      </el-form>

      <el-divider content-position="left">订单信息预览</el-divider>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ demoOrder.no }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">{{ getOrderTypeText(demoOrder.type) }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ formatAmount(demoOrder.totalAmount) }}</el-descriptions-item>
        <el-descriptions-item label="经办人">{{ demoOrder.processor }}</el-descriptions-item>
        <el-descriptions-item label="合同编号">{{ demoOrder.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="合同名称">{{ demoOrder.contractName }}</el-descriptions-item>
        <el-descriptions-item label="起始时间">{{ demoOrder.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ demoOrder.endTime }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">订单明细</el-divider>
      
      <el-table :data="demoOrder.items" border style="width: 100%">
        <el-table-column prop="goodNo" label="货物编号" width="120" />
        <el-table-column prop="goodType" label="货物类型" width="120" />
        <el-table-column prop="goodName" label="货物名称" width="150" />
        <el-table-column prop="goodModel" label="规格型号" width="120" />
        <el-table-column prop="goodCount" label="数量" width="80" />
        <el-table-column prop="goodPrice" label="单价" width="100">
          <template slot-scope="scope">
            ¥{{ formatAmount(scope.row.goodPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="goodTotalPrice" label="总价" width="100">
          <template slot-scope="scope">
            ¥{{ formatAmount(scope.row.goodTotalPrice) }}
          </template>
        </el-table-column>
        <el-table-column prop="goodWeight" label="重量" width="80" />
        <el-table-column prop="goodRemark" label="备注" />
      </el-table>
    </el-card>

    <!-- 结算单PDF弹窗 -->
    <settlement-pdf-dialog 
      :visible.sync="settlementPDFVisible" 
      :order-id="demoOrder.id"
      :order-data="demoOrder"
      @cancel="handleSettlementPDFCancel" />
  </div>
</template>

<script>
import SettlementPDFDialog from '@/components/SettlementPDFDialog'

export default {
  name: 'SettlementPDFDemo',
  components: {
    SettlementPDFDialog
  },
  data() {
    return {
      settlementPDFVisible: false,
      demoOrder: {
        id: 1,
        no: 'ORD20231201001',
        type: 'purchase',
        status: 'processing',
        totalAmount: 150000.00,
        processor: '张三 - 13800138000',
        processorPhone: '13800138000',
        contractNo: 'HT20231201001',
        contractName: '电子产品采购合同',
        contractPartner: '甲方',
        partyA: '回收管理有限公司',
        partyB: '供应商A公司',
        startTime: '2023-12-01 09:00:00',
        endTime: '2023-12-31 18:00:00',
        warehouseAddress: '北京市朝阳区仓库A',
        deliveryAddress: '北京市海淀区交付点B',
        identifyCode: 'ID20231201001',
        items: [
          {
            goodNo: 'GOOD001',
            goodType: '电子产品',
            goodName: '笔记本电脑',
            goodModel: 'ThinkPad X1',
            goodCount: 10,
            goodPrice: 8500.00,
            goodTotalPrice: 85000.00,
            goodWeight: '2.5kg',
            goodRemark: '高配置版本'
          },
          {
            goodNo: 'GOOD002',
            goodType: '办公用品',
            goodName: '办公桌椅',
            goodModel: '标准款',
            goodCount: 20,
            goodPrice: 800.00,
            goodTotalPrice: 16000.00,
            goodWeight: '15kg',
            goodRemark: '人体工学设计'
          },
          {
            goodNo: 'GOOD003',
            goodType: '网络设备',
            goodName: '路由器',
            goodModel: 'TP-Link AC1200',
            goodCount: 5,
            goodPrice: 200.00,
            goodTotalPrice: 1000.00,
            goodWeight: '0.5kg',
            goodRemark: '双频千兆'
          },
          {
            goodNo: 'GOOD004',
            goodType: '办公设备',
            goodName: '打印机',
            goodModel: 'HP LaserJet Pro',
            goodCount: 3,
            goodPrice: 1500.00,
            goodTotalPrice: 4500.00,
            goodWeight: '8.2kg',
            goodRemark: '激光打印'
          },
          {
            goodNo: 'GOOD005',
            goodType: '电子产品',
            goodName: '平板电脑',
            goodModel: 'iPad Pro',
            goodCount: 8,
            goodPrice: 6000.00,
            goodTotalPrice: 48000.00,
            goodWeight: '1.2kg',
            goodRemark: '专业版'
          }
        ]
      }
    }
  },
  methods: {
    // 打开结算单PDF弹窗
    openSettlementPDF() {
      this.settlementPDFVisible = true
    },

    // 结算单PDF弹窗取消
    handleSettlementPDFCancel() {
      this.settlementPDFVisible = false
    },

    // 获取订单类型文本
    getOrderTypeText(type) {
      const textMap = {
        'purchase': '采购订单',
        'sales': '销售订单',
        'transport': '运输订单',
        'process': '加工订单',
        'storage': '仓储订单',
        'other': '其他订单'
      }
      return textMap[type] || '未知类型'
    },

    // 格式化金额
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.demo-form {
  margin-bottom: 20px;
}

.el-divider {
  margin: 20px 0;
}

.el-descriptions {
  margin-bottom: 20px;
}
</style> 