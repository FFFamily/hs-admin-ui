<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form" @submit.native.prevent>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          新增订单
        </el-button>
      </el-form-item>
    </el-form>


    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row
      @selection-change="handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单编号" prop="no" width="180" align="center" show-overflow-tooltip />
      <el-table-column label="订单类型" prop="type" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getTypeType(scope.row.type)" size="medium">
            {{ getTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="medium">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="合同名称" prop="contractName" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="经办人" prop="processor" width="120" align="center" show-overflow-tooltip />
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
      <el-table-column label="订单总金额" prop="totalAmount" width="120" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.totalAmount">¥{{ scope.row.totalAmount }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="节点时间" prop="orderNodeTime" width="180" align="center" sortable="custom">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.orderNodeTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="success" icon="el-icon-sell"
            @click="handleSettle(scope.row)">
            结算
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-edit"
            @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete"
            @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination :current-page="pagination.page" :page-sizes="[10, 20, 50, 100]" :page-size="pagination.size"
      :total="pagination.total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" class="pagination" />

    <!-- 订单弹窗（新增/编辑/查看） -->
    <el-dialog :title="getDialogTitle()" :visible.sync="detailVisible" width="900px" :close-on-click-modal="false"
      top="5vh">
      <el-form ref="detailForm" :model="detailData" :rules="formRules" label-width="120px" class="detail-form">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单编号" prop="no">
              <el-input v-model="detailData.no" :readonly="dialogMode === 'view'" placeholder="请输入订单编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单类型" prop="type">
              <el-select v-model="detailData.type" disabled placeholder="请选择订单类型" style="width: 100%;">
                <el-option label="采购订单" value="purchase" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="detailData.status" :disabled="dialogMode === 'view'" placeholder="请选择状态"
                style="width: 100%;">
                <el-option label="执行中" value="processing" />
                <el-option label="已结束" value="completed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单识别码" prop="identifyCode">
              <el-input v-model="detailData.identifyCode" :readonly="dialogMode === 'view'" placeholder="请输入订单识别码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="起始时间" prop="startTime">
              <el-date-picker v-model="detailData.startTime" :disabled="dialogMode === 'view'" type="datetime"
                placeholder="请选择起始时间" style="width: 100%;" format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="detailData.endTime" :disabled="dialogMode === 'view'" type="datetime"
                placeholder="请选择结束时间" style="width: 100%;" format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经办人" prop="processor">
              <el-input v-model="detailData.processor" :readonly="dialogMode === 'view'" placeholder="请输入经办人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经办人电话" prop="processorPhone">
              <el-input v-model="detailData.processorPhone" :readonly="dialogMode === 'view'" placeholder="请输入经办人电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单总金额" prop="totalAmount">
              <el-input v-model="detailData.totalAmount" :readonly="dialogMode === 'view'" placeholder="请输入订单总金额">
                <template slot="prepend">¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogMode !== 'add'">
            <el-form-item label="创建时间">
              <el-input :value="formatDateTime(detailData.createTime)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 订单节点信息 -->
        <el-divider content-position="left">订单节点信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单节点时间" prop="orderNodeTime">
              <el-date-picker v-model="detailData.orderNodeTime" :disabled="dialogMode === 'view'" type="datetime"
                placeholder="请选择订单节点时间" style="width: 100%;" format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提货位置" prop="orderNodePickupLocation">
              <el-input v-model="detailData.orderNodePickupLocation" :readonly="dialogMode === 'view'"
                placeholder="请输入提货位置" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="送货位置" prop="orderNodeDeliveryLocation">
              <el-input v-model="detailData.orderNodeDeliveryLocation" :readonly="dialogMode === 'view'"
                placeholder="请输入送货位置" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单节点图片" prop="orderNodeImg">
              <div v-if="dialogMode === 'view' && detailData.orderNodeImg">
                <el-image :src="detailData.orderNodeImg" :preview-src-list="[detailData.orderNodeImg]" fit="cover"
                  style="width: 100%; height: 150px; border-radius: 8px;" />
              </div>
              <el-upload v-else-if="dialogMode !== 'view'" class="image-uploader" :action="uploadUrl"
                :show-file-list="false" :on-success="handleOrderNodeImgSuccess" :before-upload="beforeImageUpload">
                <img v-if="detailData.orderNodeImg" :src="detailData.orderNodeImg" class="uploaded-image" />
                <i v-else class="el-icon-plus image-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 合同相关信息 -->
        <el-divider content-position="left">合同相关信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同编号" prop="contractNo">
              <el-input v-model="detailData.contractNo" :readonly="dialogMode === 'view'" placeholder="请输入合同编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同名称" prop="contractName">
              <el-input v-model="detailData.contractName" :readonly="dialogMode === 'view'" placeholder="请输入合同名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合作方" prop="contractPartner">
              <el-input v-model="detailData.contractPartner" :readonly="dialogMode === 'view'" placeholder="请输入合作方" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">取消</el-button>
        <el-button
          v-if="dialogMode === 'view' && detailData.status === 'pending' && hasPermission('recycle:order:assign')"
          type="primary" @click="handleAssignPerson">
          分配专人
        </el-button>
        <el-button v-if="dialogMode !== 'view'" type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ dialogMode === 'add' ? '新增' : '保存' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 分配专人弹窗 -->
    <el-dialog title="选择处理人员" :visible.sync="assignPersonVisible" width="80%" :close-on-click-modal="false" top="5vh">
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="输入用户名或手机号搜索" style="width: 300px; margin-right: 10px;" clearable
          @keyup.enter.native="fetchUserList">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-button type="primary" icon="el-icon-search" @click="fetchUserList">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetUserSearch">重置</el-button>
      </div>

      <el-table v-loading="userLoading" :data="userList" style="width: 100%; margin-top: 20px;" border
        highlight-current-row @current-change="handleCurrentUser">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="150" align="center" />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'company' ? 'primary' : 'success'" size="mini">
              {{ scope.row.type === 'company' ? '企业' : '个人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
      </el-table>

      <div style="margin-top: 20px; text-align: right;">
        <el-pagination background layout="total, prev, pager, next, jumper" :total="userTotal" :page-size="userPageSize"
          :current-page.sync="userCurrentPage" @current-change="fetchUserList" />
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="assignPersonVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect" :disabled="!selectedProcessor">
          确认分配
        </el-button>
      </div>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog title="审批订单" :visible.sync="approvalVisible" width="500px" :close-on-click-modal="false">
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item label="审批结果" required>
          <el-radio-group v-model="approvalForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" required>
          <el-input v-model="approvalForm.comment" type="textarea" :rows="4" placeholder="请输入审批意见" maxlength="200"
            show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="approvalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApproval">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRecyclePage, getRecycleDetail, deleteRecycle, assignRecycle, approveRecycle, createRecycle, updateRecycle } from '@/api/recycle'
import { getUserPage } from '@/api/user'
import { parseTime } from '@/utils'

export default {
  name: 'RecycleOrder',
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        no: '',
        type: '',
        status: '',
        contractNo: '',
        contractName: '',
        processor: '',
        dateRange: []
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      selectedRows: [],
      detailVisible: false,
      detailData: {},
      dialogMode: 'view', // 'add', 'edit', 'view'
      submitLoading: false,
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
      // 表单验证规则
      formRules: {
        no: [
          { required: true, message: '请输入订单编号', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择订单类型', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择起始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ],
        processor: [
          { required: true, message: '请输入经办人', trigger: 'blur' }
        ],
        processorPhone: [
          { required: true, message: '请输入经办人电话', trigger: 'blur' }
        ],
        totalAmount: [
          { required: true, message: '请输入订单总金额', trigger: 'blur' }
        ],
        contractNo: [
          { required: true, message: '请输入合同编号', trigger: 'blur' }
        ],
        contractName: [
          { required: true, message: '请输入合同名称', trigger: 'blur' }
        ]
      },
      // 上传地址
      uploadUrl: process.env.VUE_APP_BASE_API + '/upload/image'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    fetchData() {
      this.listLoading = true
      const params = {
        no: this.searchForm.no || undefined,
        type: this.searchForm.type || undefined,
        status: this.searchForm.status || undefined,
        contractNo: this.searchForm.contractNo || undefined,
        contractName: this.searchForm.contractName || undefined,
        processor: this.searchForm.processor || undefined,
        startDate: this.searchForm.dateRange?.[0] || undefined,
        endDate: this.searchForm.dateRange?.[1] || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }

      getRecyclePage(params).then(response => {
        this.list = response.data.records || response.data || []
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
    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        no: '',
        type: '',
        status: '',
        contractNo: '',
        contractName: '',
        processor: '',
        dateRange: []
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
      this.detailData = this.getDefaultFormData()
      this.detailVisible = true
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
      this.dialogMode = 'view'
      getRecycleDetail(row.id).then(response => {
        this.detailData = response.data
        this.detailVisible = true
      }).catch(() => {
        this.$message.error('获取详情失败')
      })
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
      getRecycleDetail(row.id).then(response => {
        this.detailData = response.data
        this.detailVisible = true
      }).catch(() => {
        this.$message.error('获取订单详情失败')
      })
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

    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        processing: 'primary',
        completed: 'info'
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝',
        processing: '进行中',
        completed: '已完成'
      }
      return statusMap[status] || status
    },

    // 获取订单类型类型
    getTypeType(type) {
      const typeMap = {
        purchase: 'primary',
        sale: 'success',
        transport: 'warning',
        storage: 'info'
      }
      return typeMap[type] || 'info'
    },

    // 获取订单类型文本
    getTypeText(type) {
      const typeMap = {
        purchase: '采购订单',
        sale: '销售订单',
        transport: '运输订单',
        storage: '仓储订单'
      }
      return typeMap[type] || type
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

    // 获取弹框标题
    getDialogTitle() {
      const titleMap = {
        add: '新增订单',
        edit: '编辑订单',
        view: '订单详情'
      }
      return titleMap[this.dialogMode] || '订单详情'
    },

    // 获取默认表单数据
    getDefaultFormData() {
      return {
        no: '',
        type: 'purchase',
        status: 'pending',
        startTime: '',
        endTime: '',
        identifyCode: '',
        processor: '',
        processorPhone: '',
        totalAmount: '',
        orderNodeTime: '',
        orderNodeImg: '',
        orderNodePickupLocation: '',
        orderNodeDeliveryLocation: '',
        contractNo: '',
        contractReferencePrice: '',
        contractName: '',
        contractPartner: ''
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.detailForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const api = this.dialogMode === 'add' ? createRecycle : updateRecycle
          const params = this.dialogMode === 'add' ? this.detailData : { ...this.detailData, id: this.detailData.id }

          api(params).then(() => {
            this.$message.success(this.dialogMode === 'add' ? '新增成功' : '保存成功')
            this.detailVisible = false
            this.fetchData()
          }).catch(() => {
            this.$message.error(this.dialogMode === 'add' ? '新增失败' : '保存失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 图片上传前验证
    beforeImageUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    // 货物图片上传成功
    handleCargoImgSuccess(response) {
      this.detailData.cargoImg = response.data
      this.$message.success('货物图片上传成功')
    },

    // 取货图片上传成功
    handlePickupImgSuccess(response) {
      this.detailData.pickupImg = response.data
      this.$message.success('取货图片上传成功')
    },

    // 签收图片上传成功
    handleSignImgSuccess(response) {
      this.detailData.signImg = response.data
      this.$message.success('签收图片上传成功')
    },

    // 订单节点图片上传成功
    handleOrderNodeImgSuccess(response) {
      this.detailData.orderNodeImg = response.data
      this.$message.success('订单节点图片上传成功')
    },

    // 订单节点图片上传成功
    handleOrderNodeImgSuccess(response) {
      this.detailData.orderNodeImg = response.data
      this.$message.success('订单节点图片上传成功')
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

  .detail-form {
    .el-divider {
      margin: 20px 0;

      .el-divider__text {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .el-form-item {
      margin-bottom: 18px;

      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }

      .el-input__inner {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #606266;
      }

      .el-textarea__inner {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #606266;
      }
    }
  }

  .image-section {
    margin-top: 20px;

    .image-item {
      margin-bottom: 20px;

      h4 {
        margin-bottom: 10px;
        color: #606266;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .hover-zoom {
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .search-container {
    margin-bottom: 20px;
  }

  .image-uploader {
    .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 150px;

      &:hover {
        border-color: #409eff;
      }
    }

    .image-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100%;
      height: 150px;
      line-height: 150px;
      text-align: center;
    }

    .uploaded-image {
      width: 100%;
      height: 150px;
      display: block;
      object-fit: cover;
      border-radius: 6px;
    }
  }
}
</style>