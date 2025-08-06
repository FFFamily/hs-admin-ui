<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="订单号">
        <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
      </el-form-item>
      <el-form-item label="用户ID">
        <el-input v-model="searchForm.userId" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="用户名称">
        <el-input v-model="searchForm.userName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="searchForm.userPhone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="已下单" value="PENDING" />
          <el-option label="已支付" value="PAID" />
          <el-option label="已发货" value="SHIPPED" />
          <el-option label="已收货" value="RECEIVED" />
          <el-option label="已归还" value="RETURNED" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
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
      <el-table-column label="用户ID" prop="userId" width="120" align="center" />
      <el-table-column label="用户名称" prop="userName" width="120" align="center" />
      <el-table-column label="手机号" prop="userPhone" width="120" align="center" />
      <el-table-column label="订单总金额" prop="totalAmount" width="120" align="center" />
      <el-table-column label="实付金额" prop="paidAmount" width="120" align="center" />
      <el-table-column label="押金金额" prop="depositAmount" width="120" align="center" />
      <el-table-column label="租赁开始时间" prop="leaseStartTime" width="180" align="center" />
      <el-table-column label="租赁结束时间" prop="leaseEndTime" width="180" align="center" />
      <el-table-column label="租赁总天数" prop="totalLeaseDays" width="120" align="center" />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleDetail(scope.row)">详情</el-button>
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="mini" type="primary" @click="handleStatusChange(scope.row)">
            更改状态
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="用户ID">
          <el-select v-model="form.userId" placeholder="请选择用户" @change="handleUserChange">
            <el-option v-for="user in userOptions" :key="user.id" :label="user.id + ' - ' + user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="form.userName" disabled />
        </el-form-item>
        <el-form-item label="用户手机号" prop="userPhone">
          <el-input v-model="form.userPhone" disabled />
        </el-form-item>
        <el-form-item label="收货人姓名" prop="receiverName">
          <el-input v-model="form.receiverName" />
        </el-form-item>
        <el-form-item label="收货人手机号" prop="receiverPhone">
          <el-input v-model="form.receiverPhone" />
        </el-form-item>
        <el-form-item label="收货地址" prop="receiverAddress">
          <el-input v-model="form.receiverAddress" type="textarea" />
        </el-form-item>
        <el-form-item label="归还地址" prop="returnAddress">
          <el-input v-model="form.returnAddress" type="textarea" />
        </el-form-item>
        <el-form-item label="租赁开始时间" prop="leaseStartTime">
          <el-date-picker v-model="form.leaseStartTime" type="datetime" placeholder="选择开始时间" @change="calculateLeaseDays" />
        </el-form-item>
        <el-form-item label="租赁结束时间" prop="leaseEndTime">
          <el-date-picker v-model="form.leaseEndTime" type="datetime" placeholder="选择结束时间" @change="calculateLeaseDays" />
        </el-form-item>
        <el-form-item label="租赁总天数" prop="totalLeaseDays">
          <el-input v-model="form.totalLeaseDays" disabled />
        </el-form-item>
        <el-form-item label="押金金额" prop="depositAmount">
          <el-input v-model="form.depositAmount" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="已下单" value="PENDING" />
            <el-option label="已支付" value="PAID" />
            <el-option label="已发货" value="SHIPPED" />
            <el-option label="已收货" value="RECEIVED" />
            <el-option label="已归还" value="RETURNED" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      
      <div style="margin-top: 30px;">
        <el-divider>订单明细</el-divider>
        <el-button type="primary" size="mini" @click="handleAddItem">添加商品</el-button>
        <el-table
          :data="orderItems"
          border
          fit
          style="margin-top: 10px;"
        >
          <el-table-column label="商品ID" prop="goodId" width="120" align="center" />
          <el-table-column label="商品名称" prop="goodName" width="200" />
          <el-table-column label="商品单价" prop="goodPrice" width="100" align="center" />
          <el-table-column label="租赁数量" prop="quantity" width="100" align="center" />
          <el-table-column label="租赁天数" prop="leaseDays" width="100" align="center" />
          <el-table-column label="小计金额" prop="subtotal" width="100" align="center" />
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEditItem(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDeleteItem(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align: right; margin-top: 10px;">
          <el-button type="primary" @click="calculateTotalAmount">计算总金额</el-button>
          <el-button type="success" @click="previewOrder" style="margin-left: 10px;">预览订单</el-button>
          <span style="margin-left: 20px; font-weight: bold;">订单总金额: {{ form.totalAmount }} 元</span>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 订单明细弹窗 -->
    <el-dialog :title="itemDialogTitle" :visible.sync="itemDialogVisible">
      <el-form :model="itemForm" label-width="120px">
        <el-form-item label="商品ID">
          <el-select v-model="itemForm.goodId" placeholder="请选择商品" @change="handleGoodChange">
            <el-option v-for="good in goodOptions" :key="good.id" :label="good.name" :value="good.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="goodName">
          <el-input v-model="itemForm.goodName" disabled />
        </el-form-item>
        <el-form-item label="商品单价" prop="goodPrice">
          <el-input v-model="itemForm.goodPrice" disabled />
        </el-form-item>
        <el-form-item label="租赁数量" prop="quantity">
          <el-input-number v-model="itemForm.quantity" :min="1" @change="calculateItemSubtotal" />
        </el-form-item>
        <el-form-item label="租赁开始时间" prop="leaseStartTime">
          <el-date-picker v-model="itemForm.leaseStartTime" type="datetime" placeholder="选择开始时间" @change="calculateItemLeaseDays" />
        </el-form-item>
        <el-form-item label="租赁结束时间" prop="leaseEndTime">
          <el-date-picker v-model="itemForm.leaseEndTime" type="datetime" placeholder="选择结束时间" @change="calculateItemLeaseDays" />
        </el-form-item>
        <el-form-item label="租赁天数" prop="leaseDays">
          <el-input v-model="itemForm.leaseDays" disabled />
        </el-form-item>
        <el-form-item label="小计金额" prop="subtotal">
          <el-input v-model="itemForm.subtotal" disabled />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="itemForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="itemDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveItem">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 订单详情弹窗 -->
    <el-dialog :title="'订单详情'" :visible.sync="detailDialogVisible" width="800px">
      <el-form :model="detailForm" label-width="120px" disabled>
        <el-form-item label="订单号">
          <el-input v-model="detailForm.orderNo" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="detailForm.userId" />
        </el-form-item>
        <el-form-item label="用户名称">
          <el-input v-model="detailForm.userName" />
        </el-form-item>
        <el-form-item label="用户手机号">
          <el-input v-model="detailForm.userPhone" />
        </el-form-item>
        <el-form-item label="订单总金额">
          <el-input v-model="detailForm.totalAmount" />
        </el-form-item>
        <el-form-item label="实付金额">
          <el-input v-model="detailForm.paidAmount" />
        </el-form-item>
        <el-form-item label="押金金额">
          <el-input v-model="detailForm.depositAmount" />
        </el-form-item>
        <el-form-item label="租赁开始时间">
          <el-input v-model="detailForm.leaseStartTime" />
        </el-form-item>
        <el-form-item label="租赁结束时间">
          <el-input v-model="detailForm.leaseEndTime" />
        </el-form-item>
        <el-form-item label="租赁总天数">
          <el-input v-model="detailForm.totalLeaseDays" />
        </el-form-item>
        <el-form-item label="收货人姓名">
          <el-input v-model="detailForm.receiverName" />
        </el-form-item>
        <el-form-item label="收货人手机号">
          <el-input v-model="detailForm.receiverPhone" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="detailForm.receiverAddress" type="textarea" />
        </el-form-item>
        <el-form-item label="归还地址">
          <el-input v-model="detailForm.returnAddress" type="textarea" />
        </el-form-item>
        <el-form-item label="支付时间">
          <el-input v-model="detailForm.payTime" />
        </el-form-item>
        <el-form-item label="发货时间">
          <el-input v-model="detailForm.shipTime" />
        </el-form-item>
        <el-form-item label="收货时间">
          <el-input v-model="detailForm.receiveTime" />
        </el-form-item>
        <el-form-item label="归还时间">
          <el-input v-model="detailForm.returnTime" />
        </el-form-item>
        <el-form-item label="完成时间">
          <el-input v-model="detailForm.completeTime" />
        </el-form-item>
        <el-form-item label="取消时间">
          <el-input v-model="detailForm.cancelTime" />
        </el-form-item>
        <el-form-item label="取消原因">
          <el-input v-model="detailForm.cancelReason" type="textarea" />
        </el-form-item>
        <el-form-item label="物流公司">
          <el-input v-model="detailForm.logisticsCompany" />
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="detailForm.trackingNumber" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input :value="getStatusName(detailForm.status)" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="detailForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      
      <div style="margin-top: 30px;">
        <el-divider>订单明细</el-divider>
        <el-table
          :data="detailOrderItems"
          border
          fit
          style="margin-top: 10px;"
        >
          <el-table-column label="商品ID" prop="goodId" width="120" align="center" />
          <el-table-column label="商品名称" prop="goodName" width="200" />
          <el-table-column label="商品单价" prop="goodPrice" width="100" align="center" />
          <el-table-column label="租赁数量" prop="quantity" width="100" align="center" />
          <el-table-column label="租赁天数" prop="leaseDays" width="100" align="center" />
          <el-table-column label="小计金额" prop="subtotal" width="100" align="center" />
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template slot-scope="scope">
              {{ getItemStatusName(scope.row.status) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关 闭</el-button>
        <el-button type="primary" @click="handleUpdateLogistics">更新物流信息</el-button>
      </div>
    </el-dialog>
    
    <!-- 物流信息弹窗 -->
    <el-dialog :title="'更新物流信息'" :visible.sync="logisticsDialogVisible">
      <el-form :model="logisticsForm" label-width="120px">
        <el-form-item label="物流公司">
          <el-input v-model="logisticsForm.logisticsCompany" />
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="logisticsForm.trackingNumber" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="logisticsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveLogistics">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLeaseOrderListPage, getLeaseOrderDetail, addLeaseOrder, updateLeaseOrder, deleteLeaseOrder, updateOrderStatus, getGoodList, getOrderItemList, addOrderItem, updateOrderItem, deleteOrderItem, updateOrderLogistics } from '@/api/leaseOrder';
import { getUserList } from '@/api/user';
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
      dialogTitle: '新增订单',
      form: {
        id: null,
        orderNo: '',
        userId: '',
        userName: '',
        userPhone: '',
        status: 'PENDING',
        totalAmount: 0.00,
        paidAmount: 0.00,
        depositAmount: 0.00,
        leaseStartTime: '',
        leaseEndTime: '',
        totalLeaseDays: 1,
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        returnAddress: '',
        remark: ''
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
      detailDialogVisible: false,
      detailForm: {},
      detailOrderItems: [],
      logisticsDialogVisible: false,
      logisticsForm: {
        orderId: '',
        logisticsCompany: '',
        trackingNumber: ''
      },
      userOptions: [],
      goodOptions: []
    }
  },
  created() {
    this.fetchData()
    this.getUserOptions()
    this.getGoodOptions()
  },
  methods: {
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
        status: 'PENDING',
        totalAmount: 0.00,
        paidAmount: 0.00,
        depositAmount: 0.00,
        leaseStartTime: '',
        leaseEndTime: '',
        totalLeaseDays: 1,
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        returnAddress: '',
        remark: ''
      }
      this.orderItems = []
      this.dialogVisible = true
      
      // 提示用户操作步骤
      this.$nextTick(() => {
        this.$message({
          message: '请按以下步骤创建订单：1.选择用户 2.填写收货信息 3.设置租赁时间 4.添加商品 5.预览订单 6.确认创建',
          type: 'info',
          duration: 5000
        })
      })
    },
    handleEdit(row) {
      this.dialogTitle = '编辑订单'
      // 根据API获取订单详情
      getLeaseOrderDetail({ id: row.id })
        .then(response => {
          this.form = response.data || {}
          // 获取订单明细
          this.getOrderItems(row.id)
          this.dialogVisible = true
        })
        .catch(error => {
          console.error('获取订单详情失败:', error)
          this.$message.error('获取订单详情失败')
        })
    },
    handleDetail(row) {
      // 根据API获取订单详情
      getLeaseOrderDetail({ id: row.id })
        .then(response => {
          this.detailForm = response.data || {}
          // 获取订单明细
          this.getDetailOrderItems(row.id)
          this.detailDialogVisible = true
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
    getDetailOrderItems(orderId) {
      getOrderItemList({ orderId })
        .then(response => {
          this.detailOrderItems = response.data || []
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
    handleStatusChange(row) {
      this.$prompt('请选择新的订单状态', '状态变更', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputOptions: [
          { label: '已下单', value: 'PENDING' },
          { label: '已支付', value: 'PAID' },
          { label: '已发货', value: 'SHIPPED' },
          { label: '已收货', value: 'RECEIVED' },
          { label: '已归还', value: 'RETURNED' },
          { label: '已完成', value: 'COMPLETED' },
          { label: '已取消', value: 'CANCELLED' }
        ],
        inputType: 'select'
      }).then(({ value }) => {
        updateOrderStatus({
          id: row.id,
          status: value
        })
          .then(() => {
            this.$message.success('状态更新成功')
            this.fetchData()
          })
          .catch(error => {
            console.error('更新状态失败:', error)
            this.$message.error('更新状态失败')
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
        this.form.totalLeaseDays = days > 0 ? days : 1
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
      this.$message.success(`订单总金额已更新：${this.form.totalAmount}元`)
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
        leaseStartTime: this.form.leaseStartTime || '',
        leaseEndTime: this.form.leaseEndTime || '',
        leaseDays: this.form.totalLeaseDays || 1,
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
      // 表单验证
      if (!this.itemForm.goodId) {
        this.$message.error('请选择商品')
        return
      }
      if (!this.itemForm.goodName) {
        this.$message.error('商品名称不能为空')
        return
      }
      if (!this.itemForm.leaseStartTime || !this.itemForm.leaseEndTime) {
        this.$message.error('请选择租赁时间')
        return
      }
      if (!this.itemForm.quantity || this.itemForm.quantity <= 0) {
        this.$message.error('租赁数量必须大于0')
        return
      }
      if (!this.itemForm.leaseDays || this.itemForm.leaseDays <= 0) {
        this.$message.error('租赁天数必须大于0')
        return
      }

      // 验证租赁时间逻辑
      const startTime = new Date(this.itemForm.leaseStartTime)
      const endTime = new Date(this.itemForm.leaseEndTime)
      if (startTime >= endTime) {
        this.$message.error('租赁结束时间必须大于开始时间')
        return
      }

      // 验证租赁时间是否在订单时间范围内
      if (this.form.leaseStartTime && this.form.leaseEndTime) {
        const orderStartTime = new Date(this.form.leaseStartTime)
        const orderEndTime = new Date(this.form.leaseEndTime)
        if (startTime < orderStartTime || endTime > orderEndTime) {
          this.$message.error('商品租赁时间必须在订单租赁时间范围内')
          return
        }
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
    },
    handleSave() {
      // 表单验证
      if (!this.form.userId) {
        this.$message.error('请选择用户')
        return
      }
      if (!this.form.receiverName || !this.form.receiverPhone || !this.form.receiverAddress) {
        this.$message.error('请填写收货人信息')
        return
      }
      if (!this.form.leaseStartTime || !this.form.leaseEndTime) {
        this.$message.error('请选择租赁时间')
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
          `订单总金额：${this.form.totalAmount}元\n` +
          `租赁时间：${this.form.leaseStartTime} 至 ${this.form.leaseEndTime}`, 
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
          
          console.log('准备创建订单，数据：', orderData)
          console.log('开始调用 addLeaseOrder 函数')
          
          // 调用创建订单接口
          addLeaseOrder(orderData)
            .then(response => {
              loading.close()
              console.log('订单创建成功，响应：', response)
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
    },
    handleUpdateLogistics() {
      this.logisticsForm.orderId = this.detailForm.id
      this.logisticsDialogVisible = true
    },
    handleSaveLogistics() {
      // 表单验证
      if (!this.logisticsForm.logisticsCompany || !this.logisticsForm.trackingNumber) {
        this.$message.error('请填写物流信息')
        return
      }

      updateOrderLogistics(this.logisticsForm)
        .then(() => {
          this.$message.success('物流信息更新成功')
          this.logisticsDialogVisible = false
          // 刷新订单详情
          this.handleDetail(this.detailForm)
        })
        .catch(error => {
          console.error('更新物流信息失败:', error)
          this.$message.error('更新物流信息失败')
        })
    },
    getStatusName(status) {
      switch (status) {
        case 'PENDING':
          return '已下单'
        case 'PAID':
          return '已支付'
        case 'SHIPPED':
          return '已发货'
        case 'RECEIVED':
          return '已收货'
        case 'RETURNED':
          return '已归还'
        case 'COMPLETED':
          return '已完成'
        case 'CANCELLED':
          return '已取消'
        default:
          return '未知'
      }
    },
    getStatusType(status) {
      switch (status) {
        case 'PENDING':
          return 'info'
        case 'PAID':
          return 'primary'
        case 'SHIPPED':
          return 'success'
        case 'RECEIVED':
          return 'warning'
        case 'RETURNED':
          return 'success'
        case 'COMPLETED':
          return 'success'
        case 'CANCELLED':
          return 'danger'
        default:
          return ''
      }
    },
    getItemStatusName(status) {
      switch (status) {
        case 0:
          return '正常'
        case 1:
          return '已发货'
        case 2:
          return '已收货'
        case 3:
          return '已归还'
        default:
          return '未知'
      }
    },
    previewOrder() {
      // 验证基本信息
      if (!this.form.userId) {
        this.$message.error('请选择用户')
        return
      }
      if (!this.form.receiverName || !this.form.receiverPhone || !this.form.receiverAddress) {
        this.$message.error('请填写收货人信息')
        return
      }
      if (!this.form.leaseStartTime || !this.form.leaseEndTime) {
        this.$message.error('请选择租赁时间')
        return
      }
      if (this.orderItems.length === 0) {
        this.$message.error('请添加商品')
        return
      }

      // 验证订单明细
      for (let i = 0; i < this.orderItems.length; i++) {
        const item = this.orderItems[i]
        if (!item.goodId || !item.goodName) {
          this.$message.error(`第${i + 1}个商品信息不完整`)
          return
        }
        if (!item.leaseStartTime || !item.leaseEndTime) {
          this.$message.error(`第${i + 1}个商品的租赁时间不完整`)
          return
        }
      }

      // 计算总金额
      this.calculateTotalAmount()

      // 构建预览信息
      const user = this.userOptions.find(u => u.id === this.form.userId)
      const previewInfo = `
        <div style="text-align: left;">
          <h3>订单预览</h3>
          <p><strong>用户信息：</strong>${user ? user.name : '未知'} (ID: ${this.form.userId})</p>
          <p><strong>收货人：</strong>${this.form.receiverName}</p>
          <p><strong>联系电话：</strong>${this.form.receiverPhone}</p>
          <p><strong>收货地址：</strong>${this.form.receiverAddress}</p>
          <p><strong>归还地址：</strong>${this.form.returnAddress || '未设置'}</p>
          <p><strong>租赁时间：</strong>${this.form.leaseStartTime} 至 ${this.form.leaseEndTime}</p>
          <p><strong>租赁天数：</strong>${this.form.totalLeaseDays}天</p>
          <p><strong>押金金额：</strong>${this.form.depositAmount}元</p>
          <p><strong>订单总金额：</strong>${this.form.totalAmount}元</p>
          <p><strong>商品数量：</strong>${this.orderItems.length}个</p>
          <hr>
          <h4>商品明细：</h4>
          ${this.orderItems.map((item, index) => `
            <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
              <p><strong>商品${index + 1}：</strong>${item.goodName}</p>
              <p><strong>单价：</strong>${item.goodPrice}元/天</p>
              <p><strong>数量：</strong>${item.quantity}</p>
              <p><strong>租赁天数：</strong>${item.leaseDays}天</p>
              <p><strong>小计：</strong>${item.subtotal}元</p>
            </div>
          `).join('')}
        </div>
      `

      this.$alert(previewInfo, '订单预览', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        callback: () => {}
      })
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}
</style>