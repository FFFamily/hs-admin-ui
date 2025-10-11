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
            <el-select v-model="detailData.type" placeholder="请选择订单类型" style="width: 100%;" :disabled="dialogMode === 'edit'">
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
          <el-form-item label="货物总金额" prop="goodsTotalAmount">
            <el-input v-model="detailData.goodsTotalAmount" disabled placeholder="货物总金额由系统自动计算">
              <template slot="prepend">¥</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="detailData.status"  placeholder="请选择状态" style="width: 100%;" :disabled="dialogMode === 'edit'">
              <el-option 
                v-for="option in orderStatusOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结算时间" prop="settlementTime">
            <el-date-picker v-model="detailData.settlementTime" type="datetime" placeholder="请选择结算时间" style="width: 100%;"
              format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :disabled="dialogMode === 'add'" />
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
      <el-row :gutter="20" v-if="detailData.type === 'storage'">
        <el-col :span="12">
          <el-form-item label="仓库地址" prop="warehouseAddress">
            <!--可手填可下拉选择地址-->
            <el-input v-model="detailData.warehouseAddress" placeholder="请输入仓库地址或点击选择">
              <el-button slot="append"  icon="el-icon-location" @click="openWarehouseSelector">选择地址</el-button>
            </el-input>
          </el-form-item>
        </el-col>
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
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="交付地点" prop="deliveryAddress">
            <!--可手填可下拉选择地址-->
            <el-input v-model="detailData.deliveryAddress" placeholder="请输入交付地点或点击选择">
              <el-button slot="append"  icon="el-icon-location" @click="openDeliverySelector">选择地址</el-button>
            </el-input>
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

      <!-- PDF文件信息 -->
      <el-divider content-position="left">PDF文件信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="结算文件" prop="settlementPdfUrl">
            <div class="file-info-container">
              <div v-if="detailData.settlementPdfUrl" class="file-info">
                <i class="el-icon-document" style="color: #67c23a; margin-right: 8px;"></i>
                <span class="file-name">结算单已上传</span>
                <el-button type="primary" size="mini" icon="el-icon-download" @click="downloadFile(detailData.settlementPdfUrl, '结算单')">
                  下载
                </el-button>
              </div>
              <div v-else class="no-file">
                <i class="el-icon-warning" style="color: #e6a23c; margin-right: 8px;"></i>
                <span>未上传结算文件</span>
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请文件" prop="applicationPdfUrl">
            <div class="file-info-container">
              <div v-if="detailData.applicationPdfUrl" class="file-info">
                <i class="el-icon-document" style="color: #67c23a; margin-right: 8px;"></i>
                <span class="file-name">申请单已上传</span>
                <el-button type="primary" size="mini" icon="el-icon-download" @click="downloadFile(detailData.applicationPdfUrl, '申请单')">
                  下载
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeApplicationFile">
                  删除
                </el-button>
              </div>
              <div v-else class="no-file">
                <i class="el-icon-warning" style="color: #e6a23c; margin-right: 8px;"></i>
                <span>未上传申请文件</span>
              </div>
              <!-- 申请文件上传区域 -->
              <div class="upload-area">
                <el-upload
                  ref="applicationUpload"
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :before-upload="beforeApplicationUpload"
                  :on-success="handleApplicationUploadSuccess"
                  :on-error="handleApplicationUploadError"
                  :show-file-list="false"
                  accept=".pdf"
                  :disabled="applicationUploading"
                >
                  <el-button type="success" size="mini" icon="el-icon-upload" :loading="applicationUploading">
                    {{ applicationUploading ? '上传中...' : '上传申请文件' }}
                  </el-button>
                </el-upload>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 货物追溯管理 -->
      <el-divider content-position="left">货物追溯管理</el-divider>
      <traceability-manager 
        v-model="detailData.traceabilityData"
        :order-type="detailData.type"
        :can-edit-identify-code="true"
        @change="handleTraceabilityChange"
      />

      <!-- 订单明细 - 用户手动选择进项或销项 -->
      <el-divider content-position="left">订单明细</el-divider>
      
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="进项" name="purchase">
          <purchase-item :dialog-mode="dialogMode" :order-data="detailData" :items="detailData.items" :items-loading="itemsLoading"
            @selection-change="handleSelectionChange" @recalc-order-amount="recalcOrderAmount" @add-item="addOrderItem"
            @delete-items="deleteSelectedItems" />
        </el-tab-pane>
        <el-tab-pane label="销项" name="sales">
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
      <!-- PDF生成按钮 - 只在编辑模式下显示 -->
      <template v-if="dialogMode === 'edit' && detailData && detailData.id">
        <el-button type="success" icon="el-icon-document" @click="handleApplicationPDF">
          申请单
        </el-button>
        <el-button type="warning" icon="el-icon-document" @click="handleSettlementPDF">
          结算单
        </el-button>
      </template>
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
import TraceabilityManager from '@/components/TraceabilityManager'
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
  getOrderStatusText,
  getFlowDirectionText
} from '@/constants/orderTypes'


export default {
  name: 'OrderEdit',
  components: { ContractSelector, AgentSelector, AddressSelector, BankInfoSelector, ImageUploader, PurchaseItem, SalesItem, TraceabilityManager },
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
      detailData: {
        traceabilityData: {
          currentIdentifyCode: '',
          currentFlowStep: '',
          sourceCodes: []
        }
      },
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
      getFlowDirectionText,
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
      // 标签页激活状态
      activeTab: 'purchase',
      // 选中的订单明细项
      selectedItems: [],
      // 销项订单明细
      salesItems: [],
      // 销项明细加载状态
      salesItemsLoading: false,
      // 选中的销项明细项
      selectedSalesItems: [],
      // 申请文件上传相关
      applicationUploading: false,
      uploadUrl: process.env.VUE_APP_BASE_URL + '/system/file/upload',
      uploadHeaders: {
        'Token-Key': this.$store.getters.token || ''
      }
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
          this.detailData.traceabilityData.currentIdentifyCode = this.identifyCode
        }
      } else if (this.orderId) {
        try {
          const response = await getRecycleDetail(this.orderId)
          this.detailData = response.data
          // 确保items数组存在
          if (!this.detailData.items) {
            this.detailData.items = []
          }
          // 确保追溯数据存在
          if (!this.detailData.traceabilityData) {
            this.detailData.traceabilityData = {
              currentIdentifyCode: '',
              currentFlowStep: '',
              sourceCodes: []
            }
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
      // 同步货物总价到货物总金额字段
      this.detailData.goodsTotalAmount = Number(sum.toFixed(2))
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
        settlementTime: '', // 结算时间
        traceabilityData: {
          currentIdentifyCode: '',
          currentFlowStep: '',
          sourceCodes: []
        },
        processor: '',
        processorPhone: '',
        totalAmount: 0,
        goodsTotalAmount: 0, // 货物总金额
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
        settlementPdfUrl: '', // 结算文件URL
        applicationPdfUrl: '', // 申请文件URL
        items: []
      }
    },
    
    // 处理追溯数据变更
    handleTraceabilityChange(traceabilityData) {
      this.detailData.traceabilityData = traceabilityData
      
      // 根据订单类型自动设置流转步骤
      if (!traceabilityData.currentFlowStep && this.detailData.type) {
        const stepMapping = {
          'purchase': 'purchase',
          'transport': 'transport', 
          'process': 'process',
          'storage': 'storage',
          'sales': 'sales'
        }
        this.detailData.traceabilityData.currentFlowStep = stepMapping[this.detailData.type] || ''
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

    // 移除标签页相关方法，不再需要

    // 初始化订单列表数据
    initOrderList() {
      // 模拟订单数据，实际项目中应该从API获取
      this.orderList = []
    },

    // 查看订单详情
    viewOrderDetail(order) {
      this.$message.info(`查看订单详情：${order.orderNo}`)
      // 这里可以打开订单详情弹窗或跳转到详情页面
      this.$emit('view-order-detail', order)
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
        
      ]
    },

    // 生成申请单PDF
    handleApplicationPDF() {
      if (!this.detailData || !this.detailData.id) {
        this.$message.error('订单数据不完整')
        return
      }
      // 跳转到申请单页面
      this.$router.push({
        name: 'ApplicationPDF',
        params: { orderId: this.detailData.id }
      })
    },

    // 生成结算单PDF
    handleSettlementPDF() {
      if (!this.detailData || !this.detailData.id) {
        this.$message.error('订单数据不完整')
        return
      }
      // 跳转到结算单页面
      this.$router.push({
        name: 'SettlementPDF',
        params: { orderId: this.detailData.id }
      })
    },

    // 下载文件
    async downloadFile(fileUrl, fileName) {
      if (!fileUrl) {
        this.$message.warning('文件不存在')
        return
      }
      
      try {
        // 确保URL是完整的
        let fullUrl = fileUrl
        if (!fileUrl.startsWith('http')) {
          // 如果是相对路径，拼接完整URL
          const path = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl
          fullUrl = process.env.VUE_APP_BASE_URL + path
        }
        
        console.log('下载文件，完整URL:', fullUrl)
        
        // 获取token
        const token = this.$store.getters.token
        if (!token) {
          this.$message.error('请先登录')
          return
        }
        
        // 使用fetch下载文件，携带token
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Token-Key': token,
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        // 获取文件blob
        const blob = await response.blob()
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}_${this.detailData.no || this.detailData.id}_${new Date().getTime()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        window.URL.revokeObjectURL(url)
        
        this.$message.success('文件下载已开始')
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('文件下载失败：' + (error.message || '未知错误'))
      }
    },

    // 申请文件上传前验证
    beforeApplicationUpload(file) {
      const isPDF = file.type === 'application/pdf'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isPDF) {
        this.$message.error('只能上传PDF格式的文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
        return false
      }
      
      this.applicationUploading = true
      return true
    },

    // 申请文件上传成功
    handleApplicationUploadSuccess(response) {
      console.log('申请文件上传响应:', response)
      
      if (response && response.code === 200 && response.data) {
        const fileUrl = response.data.fileUrl || response.data.url
        console.log('后端返回的申请文件URL:', fileUrl)
        
        if (fileUrl) {
          // 确保返回完整的URL
          let fullUrl = fileUrl
          
          // 如果返回的是相对路径，需要拼接完整URL
          if (!fileUrl.startsWith('http')) {
            const path = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl
            fullUrl = process.env.VUE_APP_BASE_URL + path
            console.log('拼接后的完整URL:', fullUrl)
          }
          
          this.detailData.applicationPdfUrl = fullUrl
          console.log('申请文件上传成功，存储的URL:', this.detailData.applicationPdfUrl)
          this.$message.success('申请文件上传成功')
        } else {
          this.$message.error('申请文件上传失败：返回数据缺少文件地址')
        }
      } else {
        this.$message.error('申请文件上传失败：' + (response.message || '未知错误'))
      }
      
      this.applicationUploading = false
    },

    // 申请文件上传失败
    handleApplicationUploadError(error) {
      console.error('申请文件上传失败:', error)
      this.$message.error('申请文件上传失败，请重试')
      this.applicationUploading = false
    },

    // 删除申请文件
    removeApplicationFile() {
      this.$confirm('确定要删除申请文件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.detailData.applicationPdfUrl = ''
        this.$message.success('申请文件已删除')
      }).catch(() => {
        // 用户取消删除
      })
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

// PDF文件信息样式
.file-info-container {
  .file-info {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    margin-bottom: 8px;
    
    .file-name {
      flex: 1;
      color: #67c23a;
      font-weight: 500;
    }
    
    .el-button {
      margin-left: 8px;
    }
  }
  
  .no-file {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #fdf6ec;
    border: 1px solid #f5dab1;
    border-radius: 4px;
    color: #e6a23c;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .upload-area {
    text-align: center;
    
    .el-upload {
      display: inline-block;
    }
    
    .el-button {
      width: 100%;
    }
  }
}
</style>