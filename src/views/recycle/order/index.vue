<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form" @submit.native.prevent>
      <el-form-item label="订单类型">
        <el-select v-model="searchForm.type" placeholder="请选择订单类型">
          <el-option 
            v-for="option in orderTypeOptions" 
            :key="option.value" 
            :label="option.label" 
            :value="option.value" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option 
            v-for="option in orderStatusOptions" 
            :key="option.value" 
            :label="option.label" 
            :value="option.value" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单识别码">
        <el-input v-model="searchForm.identifyCode" placeholder="请输入订单识别码" />
      </el-form-item>
      <el-form-item label="合作方">
        <el-input v-model="searchForm.partner" readonly @focus="openPartnerSelector" placeholder="请选择合作方" />
      </el-form-item>
      <el-form-item label="走款状态">
        <el-select v-model="searchForm.fundflowStatus" placeholder="请选择走款状态">
          <el-option label="未走款" value="0" />
          <el-option label="已走款" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="发票状态">
        <el-select v-model="searchForm.invoiceStatus" placeholder="请选择发票状态">
          <el-option label="未开票" value="0" />
          <el-option label="已开票" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          新增订单
        </el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleBatchFundflow">批量走款</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleBatchInvoice">批量开票</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row
      @selection-change="handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单编号" prop="no" width="180" align="center" show-overflow-tooltip />
      <el-table-column label="合同名称" prop="contractName" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="订单类型" prop="type" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getOrderTypeTagType(scope.row.type)" size="medium">
            {{ getOrderTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getOrderStatusTagType(scope.row.status)" size="medium">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="甲方" prop="partyAName" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="乙方" prop="partyBName" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="经办人" prop="processor" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="订单识别码" prop="identifyCode" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="订单总金额" prop="totalAmount" width="120" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.totalAmount">¥{{ scope.row.totalAmount }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="起始时间" prop="startTime" width="180" align="center" sortable="custom">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="结束时间" prop="endTime" width="180" align="center" sortable="custom">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="上传时间" prop="uploadTime" width="180" align="center" sortable="custom">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.uploadTime) }}
        </template>
      </el-table-column>
      <el-table-column label="订单应走金额" prop="contractPrice" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="订单实走金额" prop="totalAmount" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="订单应开发票" prop="orderAmount" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="订单实开发票" prop="orderAmount" width="120" align="center" show-overflow-tooltip />

      <el-table-column label="操作" width="590" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-sell" @click="handleCreateOrder(scope.row)">
            创建订单
          </el-button>
          <el-button size="mini" type="success" icon="el-icon-sell" @click="handleSettle(scope.row)">
            结算
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-edit" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">
            删除
          </el-button>
          <el-button size="mini" type="primary" icon="el-icon-sell" @click="handleSettle(scope.row)">
            申请单
          </el-button>
          <el-button size="mini" type="primary" icon="el-icon-sell" @click="handleSettlementPDF(scope.row)">
            结算单
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination :current-page="pagination.page" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
      :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" class="pagination" />

    <!-- 订单编辑弹窗组件 -->
    <order-edit 
      :visible.sync="detailVisible" 
      :mode="dialogMode" 
      :order-id="currentOrderId"
      :identify-code="currentIdentifyCode"
      @success="handleEditSuccess"
      @cancel="handleEditCancel" />

    <!-- 批量走款弹窗组件 -->
    <batch-fundflow 
      :visible.sync="batchFundflowVisible" 
      :selected-orders="selectedRows"
      @success="handleBatchFundflowSuccess"
      @cancel="handleBatchFundflowCancel" />

    <!-- 批量开票弹窗组件 -->
    <batch-invoice 
      :visible.sync="batchInvoiceVisible" 
      :selected-orders="selectedRows"
      @success="handleBatchInvoiceSuccess"
      @cancel="handleBatchInvoiceCancel" />

    <!-- 合作方选择弹窗组件 -->
    <user-selector :visible.sync="partnerSelectorVisible" title="选择合作方" :multiple="false"
      @confirm="handlePartnerSelected" />
  </div>
</template>

<script>
import { getRecyclePage, deleteRecycle, assignRecycle, approveRecycle } from '@/api/recycle'
import { getUserPage } from '@/api/user'
import { parseTime } from '@/utils'
import UserSelector from '@/components/UserSelector'
import OrderEdit from './OrderEdit.vue'
import BatchFundflow from './BatchFundflow.vue'
import BatchInvoice from './BatchInvoice.vue'

import { 
  ORDER_TYPE_OPTIONS, 
  ORDER_STATUS_OPTIONS,
  ORDER_TYPE_TAG_TYPE,
  getOrderStatusTagType,
  getOrderTypeText,
  getOrderStatusText
} from '@/constants/orderTypes'

export default {
  name: 'RecycleOrder',
  components: { UserSelector, OrderEdit, BatchFundflow, BatchInvoice },
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        type: '',
        status: '',
        identifyCode: '',
        partner: '',
        fundflowStatus: '',
        invoiceStatus: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      selectedRows: [],
      detailVisible: false,
      dialogMode: 'add', // 'add', 'edit'
      currentOrderId: null,
      currentIdentifyCode: '',
      assignPersonVisible: false,
      selectedProcessor: '',
      userList: [],
      userLoading: false,
      searchQuery: '',
      userTotal: 0,
      userPageSize: 10,
      userCurrentPage: 1,
      approvalVisible: false,
      approvalForm: {
        result: 'approved',
        comment: '',
        orderId: null
      },
      // 合作方选择弹窗
      partnerSelectorVisible: false,
      // 批量走款弹窗
      batchFundflowVisible: false,
      // 批量开票弹窗
      batchInvoiceVisible: false,
      // 枚举选项
      orderTypeOptions: ORDER_TYPE_OPTIONS,
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      getOrderTypeTagType: ORDER_TYPE_TAG_TYPE
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 打开合作方选择器
    openPartnerSelector() {
      this.partnerSelectorVisible = true
    },
    // 合作方选择回填
    handlePartnerSelected(selected) {
      this.searchForm.partner = selected[0].nickname
    },
    // 获取数据
    fetchData() {
      this.listLoading = true
      const params = {
        identifyCode: this.searchForm.identifyCode || undefined,
        type: this.searchForm.type || undefined,
        status: this.searchForm.status || undefined,
        partner: this.searchForm.partner || undefined,
        fundflowStatus: this.searchForm.fundflowStatus || undefined,
        invoiceStatus: this.searchForm.invoiceStatus || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }

      getRecyclePage(params).then(response => {
        this.list = response.data.records || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取数据失败')
      })
    },
    // 结算
    handleSettle(row) {
      // 提示是否结算
      this.$confirm('是否结算该订单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log(row)
      })
    },

    // 生成结算单PDF
    handleSettlementPDF(row) {
      // 跳转到结算单页面
      this.$router.push({
        name: 'SettlementPDF',
        params: { orderId: row.id }
      })
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        type: '',
        status: '',
        identifyCode: '',
        partner: '',
        fundflowStatus: '',
        invoiceStatus: ''
      }
      this.pagination.page = 1
      this.fetchData()
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 排序变化
    handleSortChange({ column, prop, order }) {
      // 这里可以添加排序逻辑
      console.log('排序变化:', prop, order)
    },

    // 新增订单
    handleAdd() {
      this.dialogMode = 'add'
      this.currentOrderId = null
      this.currentIdentifyCode = ''
      this.detailVisible = true
    },

    // 创建订单（从现有订单创建）
    handleCreateOrder(row) {
      this.dialogMode = 'add'
      this.currentOrderId = null
      this.currentIdentifyCode = row.identifyCode || ''
      this.detailVisible = true
    },

    // 批量走款
    handleBatchFundflow() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要走款的订单')
        return
      }
      this.batchFundflowVisible = true
    },

    // 批量走款成功回调
    handleBatchFundflowSuccess(fundflowData) {
      console.log('批量走款数据:', fundflowData)
      this.$message.success('批量走款操作成功')
      this.fetchData() // 刷新列表
    },

    // 批量走款取消回调
    handleBatchFundflowCancel() {
      // 可以在这里添加取消时的逻辑
    },

    // 批量开票
    handleBatchInvoice() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要开票的订单')
        return
      }
      this.batchInvoiceVisible = true
    },

    // 批量开票成功回调
    handleBatchInvoiceSuccess(invoiceData) {
      console.log('批量开票数据:', invoiceData)
      this.$message.success('批量开票操作成功')
      this.fetchData() // 刷新列表
    },

    // 批量开票取消回调
    handleBatchInvoiceCancel() {
      // 可以在这里添加取消时的逻辑
    },

    // 批量审批
    handleBatchApprove() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要审批的订单')
        return
      }

      this.$confirm(`确定要批量审批通过选中的 ${this.selectedRows.length} 个订单吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        // 这里实现批量审批逻辑
        this.$message.success('批量审批成功')
        this.fetchData()
      }).catch(() => { })
    },

    // 导出数据
    handleExport() {
      this.$message.info('导出功能待实现')
    },

    // 分配专人
    handleAssignPerson() {
      this.resetUserSearch()
      this.fetchUserList()
      this.assignPersonVisible = true
    },

    // 获取用户列表
    fetchUserList() {
      this.userLoading = true
      const params = {
        pageNum: this.userCurrentPage,
        pageSize: this.userPageSize,
        keyword: this.searchQuery || undefined
      }

      getUserPage(params).then(response => {
        this.userList = response.data.records || response.data || []
        this.userTotal = response.data.total || 0
        this.userLoading = false
      }).catch(() => {
        this.userLoading = false
        this.$message.error('获取用户列表失败')
      })
    },

    // 重置用户搜索
    resetUserSearch() {
      this.searchQuery = ''
      this.userCurrentPage = 1
      this.selectedProcessor = ''
    },

    // 选中用户
    handleCurrentUser(row) {
      this.selectedProcessor = row.id
    },

    // 确认分配
    confirmSelect() {
      if (!this.selectedProcessor) {
        this.$message.error('请选择一个用户')
        return
      }

      const orderId = this.detailData.id
      const processorId = this.selectedProcessor

      assignRecycle({
        orderId,
        processor: processorId
      }).then(() => {
        this.$message.success('分配成功')
        this.assignPersonVisible = false
        this.fetchData()
      }).catch(() => {
        this.$message.error('分配失败')
      })
    },

    // 查看详情
    handleDetail(row) {
      this.dialogMode = 'edit'
      this.currentOrderId = row.id
      this.detailVisible = true
    },

    // 审批订单
    handleApprove(row) {
      this.approvalForm = {
        result: 'approved',
        comment: '',
        orderId: row.id
      }
      this.approvalVisible = true
    },

    // 拒绝订单
    handleReject(row) {
      this.approvalForm = {
        result: 'rejected',
        comment: '',
        orderId: row.id
      }
      this.approvalVisible = true
    },

    // 提交审批
    submitApproval() {
      if (!this.approvalForm.comment.trim()) {
        this.$message.error('请输入审批意见')
        return
      }

      const params = {
        orderId: this.approvalForm.orderId,
        result: this.approvalForm.result,
        comment: this.approvalForm.comment
      }

      approveRecycle(params).then(() => {
        this.$message.success('审批成功')
        this.approvalVisible = false
        this.fetchData()
      }).catch(() => {
        this.$message.error('审批失败')
      })
    },

    // 编辑订单
    handleEdit(row) {
      this.dialogMode = 'edit'
      this.currentOrderId = row.id
      this.detailVisible = true
    },

    // 删除订单
    handleDelete(row) {
      this.$confirm('确定要删除该订单吗？删除后无法恢复！', '警告', {
        type: 'warning',
        confirmButtonText: '确定删除',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        deleteRecycle(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => { })
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '--'
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    // 获取订单类型显示文本
    getOrderTypeText(type) {
      const textMap = {
        'purchase': '采购订单',
        'transport': '运输订单',
        'process': '加工订单',
        'sales': '销售订单',
        'storage': '仓储订单',
        'other': '其他订单'
      }
      return textMap[type] || '未知类型'
    },

    // 获取订单状态显示文本
    getOrderStatusText(status) {
      const textMap = {
        'processing': '执行中',
        'completed': '已结算',
        'uploaded': '已上传'
      }
      return textMap[status] || '未知状态'
    },

    // 获取订单状态标签类型
    getOrderStatusTagType(status) {
      const tagTypeMap = {
        'processing': 'warning',
        'completed': 'success',
        'uploaded': 'info'
      }
      return tagTypeMap[status] || 'info'
    },

    // 获取打款状态类型
    getPaymentStatusType(status) {
      const statusMap = {
        pending: 'warning',
        paid: 'success',
        failed: 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取打款状态文本
    getPaymentStatusText(status) {
      const statusMap = {
        pending: '待打款',
        paid: '已打款',
        failed: '打款失败'
      }
      return statusMap[status] || status || '--'
    },

    // 获取开票状态类型
    getInvoiceStatusType(status) {
      const statusMap = {
        pending: 'warning',
        issued: 'success',
        failed: 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取开票状态文本
    getInvoiceStatusText(status) {
      const statusMap = {
        pending: '待开票',
        issued: '已开票',
        failed: '开票失败'
      }
      return statusMap[status] || status || '--'
    },

    // 权限检查（示例方法）
    hasPermission(permission) {
      // 这里应该根据实际的权限系统实现
      return true
    },

    // 编辑成功回调
    handleEditSuccess() {
      this.fetchData()
    },

    // 编辑取消回调
    handleEditCancel() {
      // 可以在这里添加取消时的逻辑
    },

    // 金额格式化
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    }

  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .search-card {
    margin-bottom: 20px;
  }

  .operation-card {
    margin-bottom: 20px;
  }

  .table-card {
    .pagination {
      margin-top: 20px;
      text-align: right;
    }
  }
}
</style> 