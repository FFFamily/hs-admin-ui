<template>
  <el-dialog :title="getDialogTitle()" :visible.sync="visible" width="80%" :close-on-click-modal="false" top="5vh">
    <el-form ref="detailForm" :model="detailData" :rules="formRules" label-width="120px" class="detail-form">
      <!-- 合同相关信息 -->
      <el-divider content-position="left">合同相关信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合同编号" prop="contractNo">
            <el-input v-model="detailData.contractNo" @focus="openContractSelector" placeholder="请选择合同">
              <el-button slot="append"  @click="openContractSelector">选择合同</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同名称" prop="contractName">
            <el-input disabled v-model="detailData.contractName" placeholder="请输入合同名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="甲方" prop="partyA">
            <el-input v-model="detailData.partyAName" disabled placeholder="请输入甲方" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="乙方" prop="partyB">
            <el-input v-model="detailData.partyBName" disabled placeholder="请输入乙方" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合同金额" prop="contractReferencePrice">
            <el-input v-model="detailData.contractPrice" disabled placeholder="请输入合同金额">
              <template slot="prepend">¥</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合作方" prop="contractPartner">
            <el-input v-model="detailData.contractPartnerName" disabled placeholder="请输入合作方" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 基本信息 -->
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单编号" prop="no">
            <el-input v-model="detailData.no" disabled placeholder="订单编号由系统自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单类型" prop="type">
            <el-select v-model="detailData.type" placeholder="请选择订单类型" style="width: 100%;">
              <el-option 
                v-for="option in orderTypeOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单总金额" prop="totalAmount">
            <el-input v-model="detailData.totalAmount" disabled placeholder="请输入订单总金额">
              <template slot="prepend">¥</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="detailData.status"  placeholder="请选择状态" style="width: 100%;">
              <el-option 
                v-for="option in orderStatusOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="起始时间" prop="startTime">
            <el-date-picker v-model="detailData.startTime" type="datetime" placeholder="请选择起始时间" style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker v-model="detailData.endTime" type="datetime" placeholder="请选择结束时间" style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="上传时间" prop="uploadTime">
            <el-date-picker v-model="detailData.uploadTime" type="datetime" placeholder="请选择上传时间" style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="经办人" prop="processor">
            <el-input v-model="detailData.processor" :readonly="true" placeholder="请选择经办人"
              @click.native="openAgentSelector">
              <el-button slot="append" icon="el-icon-search" @click="openAgentSelector" />
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="经办人电话" prop="processorPhone">
            <el-input v-model="detailData.processorPhone" placeholder="请输入经办人电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="仓库地址" prop="warehouseAddress">
            <!--可手填可下拉选择地址-->
            <el-input v-model="detailData.warehouseAddress" placeholder="请输入仓库地址或点击选择">
              <el-button slot="append"  icon="el-icon-location" @click="openWarehouseSelector">选择地址</el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="交付地点" prop="deliveryAddress">
            <!--可手填可下拉选择地址-->
            <el-input v-model="detailData.deliveryAddress" placeholder="请输入交付地点或点击选择">
              <el-button slot="append"  icon="el-icon-location" @click="openDeliverySelector">选择地址</el-button>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="流转方向">
            <el-select v-model="detailData.flowDirection" placeholder="请选择流转方向" style="width: 100%;">
              <el-option 
                v-for="option in flowDirectionOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="走款账号">
            <el-input v-model="detailData.paymentAccount" placeholder="请输入走款账号">
              <el-button slot="append"  @click="openPaymentAccountSelector">选择账号</el-button>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单图片" prop="orderNodeImg">
            <ImageUploader v-model="detailData.orderNodeImg" :multiple="false" :limit="1" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 订单节点信息 -->
      <el-divider content-position="left">订单识别码</el-divider>
      <el-form-item label="订单识别码" prop="identifyCode">
        <el-input v-model="detailData.identifyCode" placeholder="请输入订单识别码" />
      </el-form-item>

      <el-tabs v-model="identifyCodeActiveTab" type="card">
        <el-tab-pane label="进项" name="new">
          <!-- 订单table -->
          <el-table :data="orderList" border fit style="width: 100%; margin-bottom: 20px;" v-loading="orderLoading">
            <el-table-column prop="orderNo" label="关联订单编号" width="180" align="center" />
            <el-table-column prop="orderType" label="订单类型" width="120" align="center">
              <template slot-scope="scope">
                  {{ getOrderTypeText(scope.row.orderType) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderAmount" label="订单金额" width="140" align="center">
              <template slot-scope="scope">
                <span class="amount-text">¥{{ formatAmount(scope.row.orderAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="起始时间" width="160" align="center">
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="160" align="center">
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template slot-scope="scope">
                <el-tag :type="getOrderStatusTagType(scope.row.status)">
                  {{ getOrderStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="viewOrderDetail(scope.row)">查看</el-button>
                <el-button type="text" size="small" @click="syncOrderItems(scope.row)">同步订单明细</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 进项订单明细组件 -->
          <purchase-item :dialog-mode="dialogMode" :order-data="detailData" :items="detailData.items" :items-loading="itemsLoading"
            @selection-change="handleSelectionChange" @recalc-order-amount="recalcOrderAmount" @add-item="addOrderItem"
            @delete-items="deleteSelectedItems" />
        </el-tab-pane>
        <el-tab-pane label="销项" name="existing">
          <!-- 销项订单明细组件 -->
          <sales-item :dialog-mode="dialogMode" :sales-items="salesItems" :sales-items-loading="salesItemsLoading"
            :purchase-items="detailData.items" :order-data="detailData"
            @sales-selection-change="handleSalesSelectionChange" @clear-sales-items="clearSalesItems"
            @sync-from-purchase="syncFromPurchaseItems" />
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
        {{ dialogMode === 'add' ? '新增' : '保存' }}
      </el-button>
    </div>

    <!-- 合同选择弹窗组件 -->
    <contract-selector :visible.sync="contractSelectorVisible" title="选择合同" :multiple="false"
      @confirm="handleContractSelected" />
    <!-- 经办人选择弹窗组件 -->
    <agent-selector :visible.sync="agentSelectorVisible" title="选择经办人" :multiple="false" @confirm="handleAgentSelected" />
    <!-- 仓库地址选择弹窗组件 -->
    <address-selector :visible.sync="warehouseSelectorVisible" title="选择仓库地址" :multiple="false"
      @confirm="handleWarehouseSelected" />
    <!-- 交付地址选择弹窗组件 -->
    <address-selector :visible.sync="deliverySelectorVisible" title="选择交付地址" :multiple="false"
      @confirm="handleDeliverySelected" />
    <!-- 银行信息选择弹窗组件 -->
    <bank-info-selector :visible.sync="bankInfoSelectorVisible" title="选择走款账号" :multiple="false"
      @confirm="handleBankInfoSelected" />
  </el-dialog>
</template>

<script>
import { getRecycleDetail, createRecycle, updateRecycle } from '@/api/recycle'
import { parseTime } from '@/utils'
import ImageUploader from '@/components/ImageUploader/index.vue'
import ContractSelector from '@/components/ContractSelector'
import AgentSelector from '@/components/AgentSelector'
import AddressSelector from '@/components/AddressSelector'
import BankInfoSelector from '@/components/BankInfoSelector'
import { getContractItems } from '@/api/recycleContract'
import PurchaseItem from './item/PurchaseItem.vue'
import SalesItem from './item/SalesItem.vue'
import { 
  ORDER_TYPE_OPTIONS, 
  ORDER_STATUS_OPTIONS, 
  FLOW_DIRECTION_OPTIONS, 
  CONTRACT_PARTNER_OPTIONS,
  getOrderStatusTagType,
  getOrderTypeText,
  getOrderStatusText
} from '@/constants/orderTypes'


export default {
  name: 'OrderEdit',
  components: { ContractSelector, AgentSelector, AddressSelector, BankInfoSelector, ImageUploader, PurchaseItem, SalesItem },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'add', // 'add', 'edit'
      validator: value => ['add', 'edit'].includes(value)
    },
    orderId: {
      type: [String, Number],
      default: null
    },
    identifyCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      detailData: {},
      submitLoading: false,
      // 合同选择弹窗
      contractSelectorVisible: false,
      // 经办人选择弹窗
      agentSelectorVisible: false,
      // 明细加载
      itemsLoading: false,
      // 仓库地址选择弹窗
      warehouseSelectorVisible: false,
      // 交付地址选择弹窗
      deliverySelectorVisible: false,
      // 银行信息选择弹窗
      bankInfoSelectorVisible: false,
      // 枚举选项
      orderTypeOptions: ORDER_TYPE_OPTIONS,
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      flowDirectionOptions: FLOW_DIRECTION_OPTIONS,
      contractPartnerOptions: CONTRACT_PARTNER_OPTIONS,
      getOrderTypeText,
      getOrderStatusText,
      getOrderStatusTagType,
      // 表单验证规则
      formRules: {
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
        ],
        warehouseAddress: [
          { required: false, message: '请输入仓库地址', trigger: 'blur' }
        ],
        deliveryAddress: [
          { required: false, message: '请输入交付地址', trigger: 'blur' }
        ]
      },
      // 新增订单列表
      orderList: [],
      orderLoading: false,
      // 新增订单明细列表
      orderDetailList: [],
      orderDetailLoading: false,
      // 订单识别码tab激活状态
      identifyCodeActiveTab: 'new',
      // 选中的订单明细项
      selectedItems: [],
      // 销项订单明细
      salesItems: [],
      // 销项明细加载状态
      salesItemsLoading: false,
      // 选中的销项明细项
      selectedSalesItems: []
    }
  },
  computed: {
    dialogMode() {
      return this.mode
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initData()
      }
    },
    orderId: {
      handler(newVal) {
        if (newVal && this.visible) {
          this.initData()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      if (this.dialogMode === 'add') {
        this.detailData = this.getDefaultFormData()
        // 如果传入了订单识别码，则设置到表单中
        if (this.identifyCode) {
          this.detailData.identifyCode = this.identifyCode
        }
      } else if (this.orderId) {
        try {
          const response = await getRecycleDetail(this.orderId)
          this.detailData = response.data
          // 确保items数组存在
          if (!this.detailData.items) {
            this.detailData.items = []
          }
        } catch (error) {
          this.$message.error('获取订单详情失败')
          this.handleCancel()
        }
      }
      // 初始化订单列表数据
      this.initOrderList()
      // 初始化销项数据
      this.initSalesData()
    },

    // 打开经办人选择器
    openAgentSelector() {
      this.agentSelectorVisible = true
    },

    // 经办人选择回填
    handleAgentSelected(selected) {
      const agent = Array.isArray(selected) ? selected[0] : selected
      if (!agent) return
      // 经办人显示编号和姓名
      this.detailData.processor = agent.name
      // 回填电话
      this.detailData.processorPhone = agent.phone
    },

    // 打开合同选择器
    openContractSelector() {
      this.contractSelectorVisible = true
    },

    // 合同选择回填
    handleContractSelected(selected) {
      const contract = Array.isArray(selected) ? selected[0] : selected
      if (!contract) return
      // 优先使用合同编号字段，如无则使用ID占位
      this.detailData.contractId = contract.id
      this.detailData.contractNo = contract.no
      this.detailData.contractName = contract.name
      this.detailData.contractPartner = contract.partner
      this.detailData.contractPartnerName = contract.partnerName
      // 甲方。乙方
      this.detailData.partyA = contract.partyA
      this.detailData.partyAName = contract.partyAName
      this.detailData.partyB = contract.partyB
      this.detailData.partyBName = contract.partyBName
      // 合同金额
      this.detailData.contractPrice = contract.totalAmount
    },

    // 获取合同明细并映射到订单明细
    async fetchContractItems(contractId) {
      if (!contractId) return
      this.itemsLoading = true
      try {
        const resp = await getContractItems(contractId)
        const list = resp && resp.data ? (resp.data.records || resp.data || []) : []
        this.detailData.items = (list || []).map(item => ({
          goodNo: item.goodNo,
          goodType: item.goodType,
          goodName: item.goodName,
          goodModel: item.goodModel,
          goodCount: item.goodCount,
          contractPrice: item.goodPrice || item.contractPrice || 0,
          goodPrice: item.goodPrice || 0,
          goodTotalPrice: this.calcTotal(item.goodCount, (item.goodPrice || 0)),
          goodWeight: item.goodWeight || '',
          goodRemark: item.goodRemark
        }))
        this.recalcOrderAmount()
      } catch (e) {
        this.$message.error('获取合同明细失败')
        this.detailData.items = []
      } finally {
        this.itemsLoading = false
      }
    },



    // 重新计算订单总金额
    recalcOrderAmount() {
      if (!Array.isArray(this.detailData.items)) return
      const sum = this.detailData.items.reduce((acc, it) => acc + (Number(it.goodTotalPrice) || 0), 0)
      this.detailData.totalAmount = Number(sum.toFixed(2))
    },

    // 打开仓库地址选择器
    openWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },

    // 仓库地址选择回填
    handleWarehouseSelected(selected) {
      if (selected && selected.length > 0) {
        const address = selected[0]
        this.detailData.warehouseAddress = address.realAddress
        this.$message.success('仓库地址选择成功')
      }
    },

    // 打开交付地址选择器
    openDeliverySelector() {
      this.deliverySelectorVisible = true
    },

    // 交付地址选择回填
    handleDeliverySelected(selected) {
      if (selected && selected.length > 0) {
        const address = selected[0]
        this.detailData.deliveryAddress = address.realAddress
        this.$message.success('交付地址选择成功')
      }
    },

    // 打开走款账号选择器
    openPaymentAccountSelector() {
      this.bankInfoSelectorVisible = true
    },

    // 处理银行信息选择确认
    handleBankInfoSelected(bankInfos) {
      if (bankInfos && bankInfos.length > 0) {
        const selectedBankInfo = bankInfos[0]
        // 显示格式：开户行 - 银行卡号
        this.detailData.paymentAccount = selectedBankInfo.cardNumber
        this.$message.success('走款账号选择成功')
      }
      this.bankInfoSelectorVisible = false
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
        type: ORDER_TYPE_OPTIONS[0].value, // 默认采购订单
        status: ORDER_STATUS_OPTIONS[0].value, // 默认执行中
        startTime: '',
        endTime: '',
        uploadTime: '',
        identifyCode: '',
        processor: '',
        processorPhone: '',
        totalAmount: 0,
        orderNodeTime: '',
        orderNodeImg: '',
        orderNodePickupLocation: '',
        orderNodeDeliveryLocation: '',
        contractNo: '',
        contractReferencePrice: '',
        contractName: '',
        contractPartner: '',
        warehouseAddress: '',
        deliveryAddress: '',
        paymentAccount: '',
        items: []
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
            this.$emit('success')
            this.handleCancel()
          }).catch(() => {
            this.$message.error(this.dialogMode === 'add' ? '新增失败' : '保存失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 取消操作
    handleCancel() {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 金额格式化
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },

    // 打开新增订单详情
    openIdentifyCodeSelector() {
      this.identifyCodeActiveTab = 'new'
    },

    // 初始化订单列表数据
    initOrderList() {
      // 模拟订单数据，实际项目中应该从API获取
      this.orderList = [
        {
          id: 1,
          orderNo: 'ORD20231201001',
          orderType: ORDER_TYPE_OPTIONS[0].value, // purchase
          orderAmount: 150000.00,
          startTime: '2023-12-01 09:00:00',
          endTime: '2023-12-31 18:00:00',
          status: ORDER_STATUS_OPTIONS[0].value // processing
        },
        {
          id: 2,
          orderNo: 'ORD20231202001',
          orderType: ORDER_TYPE_OPTIONS[1].value, // sales
          orderAmount: 89000.50,
          startTime: '2023-12-02 10:00:00',
          endTime: '2023-12-15 17:00:00',
          status: ORDER_STATUS_OPTIONS[1].value // completed
        },
        {
          id: 3,
          orderNo: 'ORD20231203001',
          orderType: ORDER_TYPE_OPTIONS[0].value, // purchase
          orderAmount: 234500.00,
          startTime: '2023-12-03 08:30:00',
          endTime: '2024-01-15 16:00:00',
          status: ORDER_STATUS_OPTIONS[0].value // processing
        }
      ]
    },

    // 查看订单详情
    viewOrderDetail(order) {
      this.$message.info(`查看订单详情：${order.orderNo}`)
      // 这里可以打开订单详情弹窗或跳转到详情页面
      this.$emit('view-order-detail', order)
    },

    // 同步订单货物明细
    async syncOrderItems(order) {
      this.orderDetailLoading = true
      try {
        // 模拟同步货物明细数据
        this.orderDetailList = [
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
          }
        ]
        this.$message.success('同步货物明细成功')
      } catch (e) {
        this.$message.error('同步货物明细失败')
        this.orderDetailList = []
      } finally {
        this.orderDetailLoading = false
      }
    },

    // 处理表格选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },

    // 新增订单明细行
    addOrderItem(newItem) {
      // 确保items数组存在
      if (!this.detailData.items) {
        this.detailData.items = []
      }

      this.detailData.items.push(newItem)
    },

    // 删除选中的订单明细行
    deleteSelectedItems(selectedItems) {
      // 从原数组中移除选中的项
      selectedItems.forEach(selectedItem => {
        const index = this.detailData.items.findIndex(item => item === selectedItem)
        if (index > -1) {
          this.detailData.items.splice(index, 1)
        }
      })

      // 重新计算订单总金额
      this.recalcOrderAmount()
    },

    // 处理销项表格选择变化
    handleSalesSelectionChange(selection) {
      this.selectedSalesItems = selection
    },

    // 清空销项明细
    clearSalesItems() {
      this.salesItems = []
      this.selectedSalesItems = []
    },

    // 从进项明细同步数据到销项明细
    syncFromPurchaseItems(newSalesItems) {
      this.salesItems = newSalesItems
    },



    // 初始化销项数据
    initSalesData() {
      // 模拟销项数据，实际项目中应该从API获取
      this.salesItems = [
        {
          goodNo: 'SALES001',
          goodType: '电子产品',
          goodName: '笔记本电脑',
          goodModel: 'ThinkPad X1',
          goodCount: 5,
          goodWeight: '2.5kg',
          goodRemark: '高配置版本',
          salesIdentifyCode: '',
          purchaseIdentifyCode: '',
          purchaseOrderNo: ''
        },
        {
          goodNo: 'SALES002',
          goodType: '办公用品',
          goodName: '办公桌椅',
          goodModel: '标准款',
          goodCount: 10,
          goodWeight: '15kg',
          goodRemark: '人体工学设计',
          salesIdentifyCode: '',
          purchaseIdentifyCode: '',
          purchaseOrderNo: ''
        },
        {
          goodNo: 'SALES003',
          goodType: '网络设备',
          goodName: '路由器',
          goodModel: 'TP-Link AC1200',
          goodCount: 8,
          goodWeight: '0.5kg',
          goodRemark: '双频千兆',
          salesIdentifyCode: '',
          purchaseIdentifyCode: '',
          purchaseOrderNo: ''
        },
        {
          goodNo: 'SALES004',
          goodType: '办公设备',
          goodName: '打印机',
          goodModel: 'HP LaserJet Pro',
          goodCount: 3,
          goodWeight: '8.2kg',
          goodRemark: '激光打印',
          salesIdentifyCode: '',
          purchaseIdentifyCode: '',
          purchaseOrderNo: ''
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
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

.amount-text {
  font-weight: 600;
  color: #e6a23c;
}

// 地址选择器按钮样式
.el-input-group__append {
  .el-button {
    border-radius: 0;
    
    &.el-button--primary {
      background-color: #409eff;
      border-color: #409eff;
      
      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }
    }
  }
}
</style>