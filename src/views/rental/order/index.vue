<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="订单号">
        <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
      </el-form-item>
      <el-form-item label="用户名称">
        <el-input v-model="searchForm.userName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option 
            v-for="item in statusOptions" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value" 
          />
        </el-select>
        <el-tooltip content="状态说明：待审核 → 租赁中 → 待开票 → 已完成" placement="top">
          <i class="el-icon-question" style="margin-left: 8px; color: #909399; cursor: help;"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button type="primary" @click="handleAdd">新增订单</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="订单号" prop="orderNo" width="180" align="center" />
      <el-table-column label="用户" prop="userName" width="120" align="center" />
      <el-table-column label="订单总金额" prop="totalAmount" width="120" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column label="已支付金额" prop="paidAmount" width="120" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.paidAmount }}
        </template>
      </el-table-column>
      <el-table-column label="押金金额" prop="depositAmount" width="120" align="center">
        <template slot-scope="scope">
          ¥{{ scope.row.depositAmount }}
        </template>
      </el-table-column>
      <el-table-column label="租赁开始时间" prop="leaseStartTime" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.leaseStartTime) }}
        </template>
      </el-table-column>
      <el-table-column label="租赁结束时间" prop="leaseEndTime" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.leaseEndTime) }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="160" align="center">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="合同信息" prop="contractInfo" width="150" align="center" class-name="contract-info-column">
        <template slot-scope="scope">
          <div v-if="scope.row.contractId">
            <el-tag type="success" size="mini">已绑定</el-tag>
            <div class="contract-detail">
              {{ scope.row.contractName || '合同详情' }}
            </div>
          </div>
          <el-tag v-else type="info" size="mini">未绑定</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <!-- 待审核状态时显示审核通过按钮 -->
          <el-button 
            v-if="scope.row.status === 'PENDING_REVIEW'" 
            size="mini" 
            type="success" 
            @click="handleApprove(scope.row)"
          >
            审核通过
          </el-button>
          <!--租赁中状态时才显示上传发票按钮-->
          <el-button 
            v-if="scope.row.status === 'LEASING'" 
            size="mini" 
            type="primary" 
            @click="handleUploadInvoice(scope.row)"
          >
          确认开票
          </el-button>
          <!-- 绑定合同按钮 -->
          <el-button 
            v-if="scope.row.status === 'LEASING'" 
            size="mini" 
            type="info" 
            @click="handleBindContract(scope.row)"
          >
            绑定合同
          </el-button>
          <!-- 解绑合同按钮 -->
          <el-button 
            v-if="scope.row.status === 'LEASING'" 
            size="mini" 
            type="warning" 
            @click="handleUnbindContract(scope.row)"
          >
            解绑合同
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <div class="pagination-container" style="margin-top: 20px;">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1200px">
      <el-form :model="form" :rules="formRules" ref="form" label-width="120px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="用户" prop="userName">
              <el-input v-model="form.userName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="form.status" disabled style="width: 100%">
                <el-option 
                  v-for="item in statusOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="押金金额" prop="depositAmount">
              <el-input-number v-model="form.depositAmount" :min="0" :precision="2" style="width: 100%" :disabled="form.id && form.status !== 'PENDING_REVIEW'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="已支付金额" prop="paidAmount">
              <el-input-number v-model="form.paidAmount" :min="0" :precision="2" style="width: 100%" :disabled="form.id && form.status !== 'PENDING_REVIEW'" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 租赁时间 -->
        <el-divider content-position="left">租赁时间</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租赁开始时间" prop="leaseStartTime">
              <el-date-picker 
                v-model="form.leaseStartTime" 
                type="datetime" 
                placeholder="选择租赁开始时间" 
                style="width: 100%"
                @change="calculateLeaseDays"
                :disabled="form.id && form.status !== 'PENDING_REVIEW'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租赁结束时间" prop="leaseEndTime">
              <el-date-picker 
                v-model="form.leaseEndTime" 
                type="datetime" 
                placeholder="选择租赁结束时间" 
                style="width: 100%"
                @change="calculateLeaseDays"
                :disabled="form.id && form.status !== 'PENDING_REVIEW'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="订单备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入订单备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
            <div style="margin-top: 30px;">
        <el-divider>订单明细</el-divider>
        <el-button 
          v-if="!form.id" 
          type="primary" 
          size="mini" 
          @click="handleAddItem"
        >
          添加商品
        </el-button>
        <el-table
          :data="orderItems"
          border
          fit
          style="margin-top: 10px;"
        >
          <el-table-column label="商品名称" prop="goodName" />
          <el-table-column label="商品单价" prop="goodPrice" align="center">
            <template slot-scope="scope">
              {{ scope.row.goodPrice }}元/天
            </template>
          </el-table-column>
          <el-table-column label="租赁数量" prop="quantity" align="center" />
          <el-table-column label="申请租赁开始时间" prop="leaseStartTime" align="center" />
          <el-table-column label="申请租赁结束时间" prop="leaseEndTime" align="center" />
          <el-table-column label="租赁天数" prop="leaseDays" align="center" />
          <el-table-column label="小计金额" prop="subtotal" align="center">
            <template slot-scope="scope">
              ¥{{ scope.row.subtotal }}
            </template>
          </el-table-column>
          <el-table-column v-if="!form.id" label="操作" align="center">
            <template slot-scope="scope">
              <el-button                
                size="mini" 
                @click="handleEditItem(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                size="mini" 
                type="danger" 
                @click="handleDeleteItem(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align: right; margin-top: 10px;">
          <el-button 
            v-if="!form.id" 
            type="primary" 
            @click="calculateTotalAmount"
          >
            计算总金额
          </el-button>
          <span style="margin-left: 20px; font-weight: bold; font-size: 16px; color: #409EFF;">
            订单总金额: ¥{{ form.totalAmount }}
          </span>
        </div>  
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="form.id" type="primary" @click="handleSave">更 新</el-button>
        <el-button v-if="!form.id" type="primary" @click="handleSave">添 加</el-button>
      </div>
    </el-dialog>
    
    <!-- 订单明细弹窗 -->
    <el-dialog :title="itemDialogTitle" :visible.sync="itemDialogVisible" width="800px">
      <el-form :model="itemForm" :rules="itemFormRules" ref="itemForm" label-width="120px">
        <!-- 商品信息 -->
        <el-divider content-position="left">商品信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品" prop="goodId">
              <el-select v-model="itemForm.goodId" placeholder="请选择商品" @change="handleGoodChange" style="width: 100%">
                <el-option v-for="good in goodOptions" :key="good.id" :label="good.name" :value="good.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="goodName">
              <el-input v-model="itemForm.goodName" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品单价" prop="goodPrice">
              <el-input v-model="itemForm.goodPrice" disabled>
                <template slot="append">元/天</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租赁数量" prop="quantity">
              <el-input-number v-model="itemForm.quantity" :min="1" @change="calculateItemSubtotal" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 租赁信息 -->
        <el-divider content-position="left">租赁信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租赁开始时间" prop="leaseStartTime">
              <el-date-picker v-model="itemForm.leaseStartTime" type="datetime" placeholder="选择开始时间" @change="calculateItemLeaseDays" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租赁结束时间" prop="leaseEndTime">
              <el-date-picker v-model="itemForm.leaseEndTime" type="datetime" placeholder="选择结束时间" @change="calculateItemLeaseDays" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租赁天数" prop="leaseDays">
              <el-input v-model="itemForm.leaseDays" disabled>
                <template slot="append">天</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="小计金额" prop="subtotal">
              <el-input v-model="itemForm.subtotal" disabled>
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="itemDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveItem">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 合同选择弹窗 -->
    <el-dialog title="选择合同" :visible.sync="contractDialogVisible" width="1000px" class="contract-dialog">
      <!-- 合同搜索表单 -->
      <el-form :inline="true" :model="contractSearchForm" class="demo-form-inline" style="margin-bottom: 20px;">
        <el-form-item label="合同名称">
          <el-input v-model="contractSearchForm.name" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="contractSearchForm.code" placeholder="请输入合同编号" />
        </el-form-item>
        <el-form-item label="合同类型">
          <el-input v-model="contractSearchForm.type" placeholder="请输入合同类型" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleContractSearch">搜索</el-button>
          <el-button @click="handleContractReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 合同列表 -->
      <el-table
        v-loading="contractListLoading"
        :data="contractList"
        border
        fit
        highlight-current-row
        @row-click="handleContractSelect"
        style="margin-bottom: 20px;"
      >
        <el-table-column label="合同名称" prop="name" />
        <el-table-column label="合同编号" prop="code" width="120" />
        <el-table-column label="合同识别号" prop="recognitionCode" width="150" />
        <el-table-column label="合同类型" prop="type" width="100" />
        <el-table-column label="起始日期" prop="startDate" width="120" />
        <el-table-column label="结束日期" prop="endDate" width="120" />
        <el-table-column label="甲方信息" prop="partyA" />
        <el-table-column label="乙方信息" prop="partyB" />
        <el-table-column label="选择" width="80" align="center">
          <template slot-scope="scope">
            <el-radio 
              v-model="selectedContractId" 
              :label="scope.row.id"
              @change="handleContractRadioChange(scope.row)"
            >
              选择
            </el-radio>
          </template>
        </el-table-column>
      </el-table>

      <!-- 合同分页 -->
      <div style="text-align: center; margin-bottom: 20px;">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="contractTotal"
          :current-page="contractCurrentPage"
          :page-size="contractPageSize"
          @size-change="handleContractSizeChange"
          @current-change="handleContractCurrentChange"
        />
      </div>

      <!-- 已选合同信息 -->
      <div v-if="selectedContract" class="selected-contract-info">
        <h4>已选择的合同：</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="合同名称">{{ selectedContract.name }}</el-descriptions-item>
          <el-descriptions-item label="合同编号">{{ selectedContract.code }}</el-descriptions-item>
          <el-descriptions-item label="合同识别号">{{ selectedContract.recognitionCode }}</el-descriptions-item>
          <el-descriptions-item label="合同类型">{{ selectedContract.type }}</el-descriptions-item>
          <el-descriptions-item label="起始日期">{{ selectedContract.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ selectedContract.endDate }}</el-descriptions-item>
          <el-descriptions-item label="甲方信息" :span="2">{{ selectedContract.partyA }}</el-descriptions-item>
          <el-descriptions-item label="乙方信息" :span="2">{{ selectedContract.partyB }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="contractDialogVisible = false">取 消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirmBindContract"
          :disabled="!selectedContract"
        >
          确认绑定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLeaseOrderListPage, getLeaseOrderDetail, addLeaseOrder, updateLeaseOrder, deleteLeaseOrder, approveOrder, getGoodList, getOrderItemList, addOrderItem, updateOrderItem, deleteOrderItem, updateOrderLogistics, getOrderStatusAll, bindContract, unbindContract } from '@/api/leaseOrder';
import { getUserList } from '@/api/user';
import { getContractPage } from '@/api/contract';
export default {
  components: {},
  data() {
    return {
      list: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      listLoading: false,
      searchForm: {
        orderNo: '',
        userId: '',
        userName: '',
        userPhone: '',
        status: ''
      },
      dialogVisible: false,
      viewDialogVisible: false,
      dialogTitle: '新增订单',
      form: {
        id: null,
        orderNo: '',
        userId: '',
        userName: '',
        userPhone: '',
        status: 'PENDING_REVIEW',
        totalAmount: 0.00,
        paidAmount: 0.00,
        depositAmount: 0.00,
        leaseStartTime: '',
        leaseEndTime: '',
        leaseDays: 0,
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        returnAddress: '',
        remark: ''
      },
      formRules: {
        userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
        status: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
        leaseStartTime: [{ required: true, message: '请选择租赁开始时间', trigger: 'change' }],
        leaseEndTime: [{ required: true, message: '请选择租赁结束时间', trigger: 'change' }],
        receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
        receiverPhone: [{ required: true, message: '请输入收货人手机号', trigger: 'blur' }],
        receiverAddress: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
      },
      orderItems: [],
      itemDialogVisible: false,
      itemDialogTitle: '新增商品',
      itemForm: {
        id: null,
        orderId: '',
        goodId: '',
        goodName: '',
        goodPrice: 0,
        quantity: 1,
        leaseStartTime: '',
        leaseEndTime: '',
        leaseDays: 1,
        subtotal: 0.00,
        remark: ''
      },
      itemFormRules: {
        goodId: [{ required: true, message: '请选择商品', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入租赁数量', trigger: 'blur' }],
        leaseStartTime: [{ required: true, message: '请选择租赁开始时间', trigger: 'change' }],
        leaseEndTime: [{ required: true, message: '请选择租赁结束时间', trigger: 'change' }]
      },
      detailForm: {},
      userOptions: [],
      goodOptions: [],
      statusOptions: [],
      contractDialogVisible: false,
      contractSearchForm: {
        name: '',
        code: '',
        type: ''
      },
      contractList: [],
      contractListLoading: false,
      contractTotal: 0,
      contractCurrentPage: 1,
      contractPageSize: 10,
      selectedContractId: null,
      selectedContract: null
    }
  },
  created() {
    this.fetchData()
    this.getUserOptions()
    this.getGoodOptions()
    this.getStatusOptions()
  },
  methods: {
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getUserOptions() {
      getUserList()
        .then(response => {
          this.userOptions = response.data || []
        })
        .catch(error => {
          console.error('获取用户列表失败:', error)
          this.$message.error('获取用户列表失败')
        })
    },
    getGoodOptions() {
      getGoodList()
        .then(response => {
          this.goodOptions = response.data || []
        })
        .catch(error => {
          console.error('获取商品列表失败:', error)
          this.$message.error('获取商品列表失败')
        })
    },
    getStatusOptions() {
      getOrderStatusAll()
        .then(response => {
          this.statusOptions = response.data || []
        })
        .catch(error => {
          console.error('获取订单状态失败:', error)
          this.$message.error('获取订单状态失败')
        })
    },
    fetchData() {
      this.listLoading = true
      // 调用API获取订单列表
      getLeaseOrderListPage({
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        ...this.searchForm
      })
        .then(response => {
          this.list = response.data.records || []
          this.total = response.data.total || 0
          this.listLoading = false
        })
        .catch(error => {
          console.error('获取订单列表失败:', error)
          this.$message.error('获取订单列表失败')
          this.listLoading = false
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = {
        orderNo: '',
        userId: '',
        userName: '',
        userPhone: '',
        status: ''
      }
      this.currentPage = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增订单'
      this.form = {
        id: null,
        orderNo: '',
        userId: '',
        userName: '',
        userPhone: '',
        status: 'PENDING_REVIEW',
        totalAmount: 0.00,
        paidAmount: 0.00,
        depositAmount: 0.00,
        leaseStartTime: '',
        leaseEndTime: '',
        leaseDays: 0,
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        returnAddress: '',
        remark: ''
      }
      this.orderItems = []
      this.dialogVisible = true
    },
    handleView(row) {
      // 查看订单详情
      getLeaseOrderDetail({ id: row.id })
        .then(response => {
          this.detailForm = response.data || {}
          this.viewDialogVisible = true
        })
        .catch(error => {
          console.error('获取订单详情失败:', error)
          this.$message.error('获取订单详情失败')
        })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑订单'
      // 根据API获取订单详情
      getLeaseOrderDetail({ id: row.id })
        .then(response => {
          this.form = { ...response.data }
          // 如果接口返回的数据中包含订单明细，直接使用
          if (response.data && response.data.orderItems) {
            this.orderItems = response.data.orderItems
          } else {
            // 如果接口没有返回明细，才单独获取
            this.getOrderItems(row.id)
          }
          this.dialogVisible = true
        })
        .catch(error => {
          console.error('获取订单详情失败:', error)
          this.$message.error('获取订单详情失败')
        })
    },
    getOrderItems(orderId) {
      getOrderItemList({ orderId })
        .then(response => {
          this.orderItems = response.data || []
        })
        .catch(error => {
          console.error('获取订单明细失败:', error)
          this.$message.error('获取订单明细失败')
        })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该订单吗？', '提示', { type: 'warning' })
        .then(() => {
          // 调用API删除订单
          deleteLeaseOrder({ id: row.id })
            .then(() => {
              this.$message.success('删除成功')
              this.fetchData()
            })
            .catch(error => {
              console.error('删除订单失败:', error)
              this.$message.error('删除订单失败')
            })
        })
        .catch(() => {})
    },
    handleApprove(row) {
      this.$confirm('确定要审核通过该订单吗？', '审核确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用审核接口
        approveOrder({
          id: row.id
        })
          .then(() => {
            this.$message.success('订单审核通过成功')
            this.fetchData()
          })
          .catch(error => {
            console.error('审核失败:', error)
            this.$message.error('审核失败：' + (error.message || '未知错误'))
          })
      }).catch(() => {})
    },
    handleUserChange(userId) {
      const user = this.userOptions.find(item => item.id === userId)
      if (user) {
        this.form.userName = user.name
        this.form.userPhone = user.phone
      }
    },
    handleGoodChange(goodId) {
      const good = this.goodOptions.find(item => item.id === goodId)
      if (good) {
        this.itemForm.goodName = good.name
        this.itemForm.goodPrice = good.price
        this.calculateItemSubtotal()
      }
    },
    calculateLeaseDays() {
      if (this.form.leaseStartTime && this.form.leaseEndTime) {
        const start = new Date(this.form.leaseStartTime)
        const end = new Date(this.form.leaseEndTime)
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        this.form.leaseDays = days > 0 ? days : 0
      }
    },
    calculateItemLeaseDays() {
      if (this.itemForm.leaseStartTime && this.itemForm.leaseEndTime) {
        const start = new Date(this.itemForm.leaseStartTime)
        const end = new Date(this.itemForm.leaseEndTime)
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        this.itemForm.leaseDays = days > 0 ? days : 1
        this.calculateItemSubtotal()
      }
    },
    calculateItemSubtotal() {
      this.itemForm.subtotal = (this.itemForm.goodPrice * this.itemForm.quantity * this.itemForm.leaseDays).toFixed(2)
    },
    calculateTotalAmount() {
      let total = 0
      this.orderItems.forEach(item => {
        // 确保小计金额计算正确
        if (item.goodPrice && item.quantity && item.leaseDays) {
          item.subtotal = (item.goodPrice * item.quantity * item.leaseDays).toFixed(2)
        }
        total += parseFloat(item.subtotal || 0)
      })
      this.form.totalAmount = total.toFixed(2)
      
      // 显示计算结果
      this.$message.success(`订单总金额已更新：¥${this.form.totalAmount}`)
    },
    handleAddItem() {
      this.itemDialogTitle = '新增商品'
      this.itemForm = {
        id: null,
        orderId: this.form.id || '',
        goodId: '',
        goodName: '',
        goodPrice: 0,
        quantity: 1,
        leaseStartTime: '',
        leaseEndTime: '',
        leaseDays: 1,
        subtotal: 0.00,
        remark: ''
      }
      this.itemDialogVisible = true
    },
    handleEditItem(row) {
      this.itemDialogTitle = '编辑商品'
      this.itemForm = { ...row }
      this.itemDialogVisible = true
    },
    handleDeleteItem(row) {
      this.$confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
        .then(() => {
          // 无论是否保存，都从本地数组删除
          this.orderItems = this.orderItems.filter(item => item.id !== row.id)
          this.calculateTotalAmount()
          this.$message.success('删除成功')
        })
        .catch(() => {})
    },
    handleSaveItem() {
      this.$refs.itemForm.validate((valid) => {
        if (!valid) return
        
        // 验证租赁时间逻辑
        const startTime = new Date(this.itemForm.leaseStartTime)
        const endTime = new Date(this.itemForm.leaseEndTime)
        if (startTime >= endTime) {
          this.$message.error('租赁结束时间必须大于开始时间')
          return
        }

        const formData = { ...this.itemForm }

        if (formData.id) {
          // 编辑现有商品（本地）
          const index = this.orderItems.findIndex(item => item.id === formData.id)
          if (index !== -1) {
            this.orderItems.splice(index, 1, formData)
            this.$message.success('编辑成功')
          }
        } else {
          // 新增商品（本地）
          // 生成临时ID，避免与后端ID冲突
          formData.id = 'temp_' + Date.now()
          this.orderItems.push(formData)
          this.$message.success('新增成功')
        }

        this.calculateTotalAmount()
        this.itemDialogVisible = false
      })
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        
        // 如果是编辑模式且不是待审核状态，只验证基本信息
        if (this.form.id && this.form.status !== 'PENDING_REVIEW') {
          // 编辑模式且非待审核状态，只保存基本信息
          const formData = { ...this.form }
          updateLeaseOrder(formData)
            .then(() => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.fetchData()
            })
            .catch(error => {
              console.error('编辑订单失败:', error)
              this.$message.error('编辑订单失败')
            })
          return
        }
        
        if (this.orderItems.length === 0) {
          this.$message.error('请添加商品')
          return
        }

        // 验证订单明细的完整性
        for (let i = 0; i < this.orderItems.length; i++) {
          const item = this.orderItems[i]
          if (!item.goodId || !item.goodName) {
            this.$message.error(`第${i + 1}个商品信息不完整，请检查`)
            return
          }
          if (!item.leaseStartTime || !item.leaseEndTime) {
            this.$message.error(`第${i + 1}个商品的租赁时间不完整，请检查`)
            return
          }
          if (!item.quantity || item.quantity <= 0) {
            this.$message.error(`第${i + 1}个商品的数量必须大于0`)
            return
          }
        }

        const formData = { ...this.form }

        if (formData.id) {
          // 编辑订单
          this.$confirm('确定要保存订单信息吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            updateLeaseOrder(formData)
              .then(() => {
                // 处理商品更新
                const promises = this.orderItems.map(item => {
                  item.orderId = formData.id
                  if (item.id && !item.id.startsWith('temp_')) {
                    // 更新已有商品
                    return updateOrderItem(item)
                  } else {
                    // 添加新商品
                    // 删除临时ID
                    delete item.id
                    return addOrderItem(item)
                  }
                })

                Promise.all(promises)
                  .then(() => {
                    this.$message.success('编辑成功')
                    this.dialogVisible = false
                    this.fetchData()
                  })
                  .catch(error => {
                    console.error('更新商品失败:', error)
                    this.$message.error('更新商品失败，但订单已保存')
                  })
              })
              .catch(error => {
                console.error('编辑订单失败:', error)
                this.$message.error('编辑订单失败')
              })
          }).catch(() => {})
        } else {
          // 新增订单 - 显示确认对话框
          this.$confirm('确定要创建订单吗？请确认以下信息：\n' +
            `用户：${this.userOptions.find(u => u.id === this.form.userId)?.name || '未知'}\n` +
            `收货人：${this.form.receiverName}\n` +
            `商品数量：${this.orderItems.length}个\n` +
          `订单总金额：¥${this.form.totalAmount}`, 
            '确认创建订单', {
            confirmButtonText: '确定创建',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }).then(() => {
            // 显示加载状态
            const loading = this.$loading({
              lock: true,
              text: '正在创建订单...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            // 准备订单数据
            const orderData = {
              ...formData,
              orderItems: this.orderItems.map(item => ({
                goodId: item.goodId,
                goodName: item.goodName,
                goodPrice: item.goodPrice,
                quantity: item.quantity,
                leaseStartTime: item.leaseStartTime,
                leaseEndTime: item.leaseEndTime,
                leaseDays: item.leaseDays,
                subtotal: item.subtotal,
                remark: item.remark
              }))
            }
            
            // 调用创建订单接口
            addLeaseOrder(orderData)
              .then(response => {
                loading.close()
                this.$message.success('订单创建成功！')
                this.dialogVisible = false
                this.fetchData()
              })
              .catch(error => {
                loading.close()
                console.error('创建订单失败:', error)
                this.$message.error('创建订单失败：' + (error.message || '未知错误'))
              })
          }).catch(() => {
            console.log('用户取消创建订单')
          })
        }
      })
    },
    getStatusName(status) {
      // 为不同状态设置友好的显示名称
      // 状态枚举说明：
      // PENDING_REVIEW: 待审核 - 订单创建后等待管理员审核
      // LEASING: 租赁中 - 订单已审核通过，正在租赁期间
      // PENDING_INVOICE: 待开票 - 租赁结束，等待开具发票
      // COMPLETED: 已完成 - 发票已开具，订单完成
      switch (status) {
        case 'PENDING_REVIEW':
          return '待审核'
        case 'LEASING':
          return '租赁中'
        case 'PENDING_INVOICE':
          return '待开票'
        case 'COMPLETED':
          return '已完成'
        default:
          // 如果后端返回的状态没有匹配，尝试从statusOptions中获取
          const statusInfo = this.statusOptions.find(item => item.value === status)
          return statusInfo ? statusInfo.label : '未知'
      }
    },
    getStatusType(status) {
      // 为不同状态设置不同颜色的标签
      // 状态颜色说明：
      // PENDING_REVIEW: warning(橙色) - 需要关注和处理的待审核状态
      // LEASING: primary(蓝色) - 正在进行的租赁状态
      // PENDING_INVOICE: info(灰色) - 等待处理的待开票状态
      // COMPLETED: success(绿色) - 已完成的成功状态
      switch (status) {
        case 'PENDING_REVIEW':
          return 'warning' // 待审核 - 橙色
        case 'LEASING':
          return 'primary' // 租赁中 - 蓝色
        case 'PENDING_INVOICE':
          return 'info' // 待开票 - 灰色
        case 'COMPLETED':
          return 'success' // 已完成 - 绿色
        default:
          // 如果后端返回的状态没有匹配，尝试从statusOptions中获取
          const statusInfo = this.statusOptions.find(item => item.value === status)
          return statusInfo ? statusInfo.type || 'info' : 'info'
      }
    },
    // 处理上传发票
    handleUploadInvoice(row) {
      this.$message.info('上传发票功能待实现')
      // TODO: 实现上传发票逻辑
      console.log('上传发票:', row)
    },
    // 处理绑定合同
    handleBindContract(row) {
      this.form.id = row.id // 将当前订单的ID设置为form的id，以便在合同选择弹窗中使用
      // 重置合同选择状态
      this.selectedContract = null
      this.selectedContractId = null
      this.contractDialogVisible = true
      this.fetchContractData() // 重新获取合同列表，因为搜索条件可能改变
    },
    // 处理解绑合同
    handleUnbindContract(row) {
      this.$confirm(`确定要解绑订单 ${row.orderNo} 的合同吗？`, '解绑合同', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        unbindContract({ orderId: row.id })
          .then(() => {
            this.$message.success('合同解绑成功！')
            this.fetchData()
          })
          .catch(error => {
            console.error('解绑合同失败:', error)
            this.$message.error('解绑合同失败：' + (error.message || '未知错误'))
          })
      }).catch(() => {})
    },
    // 合同选择相关方法
    handleContractSearch() {
      this.contractCurrentPage = 1
      this.fetchContractData()
    },
    handleContractReset() {
      this.contractSearchForm = {
        name: '',
        code: '',
        type: ''
      }
      this.contractCurrentPage = 1
      this.fetchContractData()
    },
    fetchContractData() {
      this.contractListLoading = true
      getContractPage({
        page: this.contractCurrentPage,
        size: this.contractPageSize,
        ...this.contractSearchForm
      })
        .then(response => {
          this.contractList = response.data.records || []
          this.contractTotal = response.data.total || 0
          this.contractListLoading = false
        })
        .catch(error => {
          console.error('获取合同列表失败:', error)
          this.$message.error('获取合同列表失败')
          this.contractListLoading = false
        })
    },
    handleContractSizeChange(val) {
      this.contractPageSize = val
      this.fetchContractData()
    },
    handleContractCurrentChange(val) {
      this.contractCurrentPage = val
      this.fetchContractData()
    },
    handleContractSelect(row) {
      this.selectedContract = row
      this.selectedContractId = row.id
    },
    handleContractRadioChange(row) {
      this.selectedContract = row
      this.selectedContractId = row.id
    },
    handleConfirmBindContract() {
      if (!this.selectedContract) {
        this.$message.error('请选择要绑定的合同')
        return
      }
      
      // 获取当前要绑定合同的订单信息
      const currentOrder = this.list.find(order => order.id === this.form.id)
      if (!currentOrder) {
        this.$message.error('订单信息获取失败')
        return
      }
      
      this.$confirm(`确定要将合同 "${this.selectedContract.name}" 绑定到订单 ${currentOrder.orderNo} 吗？`, '绑定合同', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        bindContract({ orderId: this.form.id, contractId: this.selectedContract.id })
          .then(() => {
            this.$message.success('合同绑定成功！')
            this.fetchData()
            this.contractDialogVisible = false
            // 重置选择状态
            this.selectedContract = null
            this.selectedContractId = null
          })
          .catch(error => {
            console.error('绑定合同失败:', error)
            this.$message.error('绑定合同失败：' + (error.message || '未知错误'))
          })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}

.el-divider {
  margin: 20px 0;
}

.el-divider__text {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.pagination-container {
  text-align: center;
}

.dialog-footer {
  text-align: right;
}

/* 表格样式优化 */
.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.el-table td {
  padding: 12px 0;
}

/* 按钮组样式 */
.el-button + .el-button {
  margin-left: 8px;
}

/* 表单项样式 */
.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 弹窗内容样式 */
.el-dialog__body {
  padding: 20px 30px;
}

/* 分割线样式 */
.el-divider--horizontal {
  margin: 24px 0;
}

/* 金额显示样式 */
.amount-display {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}

/* 状态标签样式 */
.el-tag {
  font-weight: 500;
}

/* 搜索表单样式 */
.demo-form-inline {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 预览信息样式 */
.preview-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin: 10px 0;
}

/* 商品明细表格样式 */
.order-items-table {
  margin-top: 15px;
}

.order-items-table .el-table th {
  background-color: #f0f9ff;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .el-dialog {
    width: 95% !important;
  }
  
  .el-col {
    margin-bottom: 15px;
  }
}

/* 合同选择弹窗样式 */
.contract-dialog .el-dialog__body {
  padding: 20px;
}

.contract-dialog .el-table {
  margin-bottom: 20px;
}

.contract-dialog .el-pagination {
  text-align: center;
  margin: 20px 0;
}

.contract-dialog .selected-contract-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
}

.contract-dialog .selected-contract-info h4 {
  margin: 0 0 10px 0;
  color: #409EFF;
  font-size: 14px;
}

/* 合同信息列样式 */
.contract-info-column {
  text-align: center;
}

.contract-info-column .el-tag {
  margin-bottom: 5px;
}

.contract-info-column .contract-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>