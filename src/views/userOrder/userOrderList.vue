<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="订单编号">
        <el-input
          v-model="searchForm.no"
          placeholder="请输入订单编号"
          clearable
          style="width: 180px;"
        />
      </el-form-item>
      <el-form-item label="订单状态阶段">
        <el-select
          v-model="searchForm.stage"
          placeholder="请选择订单状态阶段"
          clearable
          style="width: 150px;"
        >
          <el-option
            v-for="item in stageOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择订单状态"
          clearable
          style="width: 150px;"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="el-icon-plus" @click="handleAdd">添加订单</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="no" label="订单编号" width="150" />
      <el-table-column prop="stage" label="订单状态阶段" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStageTagType(scope.row.stage)" size="small">
            {{ getStageText(scope.row.stage) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contractNo" label="合同编号" width="150" />
      <el-table-column prop="contractName" label="合同名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="settlementTime" label="结算完成时间" width="180" >
        <template slot-scope="scope">
          {{ scope.row.settlementTime || '订单尚未完成' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="success" @click="handleRegisterInfo(scope.row)">登记信息</el-button>
          <el-button size="mini" type="warning" @click="handleDelivery(scope.row)">交付</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: right;"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 交付对话框 -->
    <el-dialog
      :title="'订单交付 - ' + currentOrder.no"
      :visible.sync="deliveryDialogVisible"
      width="700px"
      @close="handleDeliveryDialogClose"
    >
      <!-- 第一步：选择交付模式 -->
      <div v-if="deliveryStep === 1">
        <h3>请选择交付模式</h3>
        <el-radio-group v-model="deliveryMode" size="large" style="display: flex; flex-direction: column; gap: 20px;">
          <el-radio label="online" border style="width: 50%; margin-left: 10px;">
            <span>线上交付</span>
            <p style=" color: #909399;">需填写交付时间、上传交付照片和签字照片</p>
          </el-radio>
          <el-radio label="offline" border style="width: 50%;">
            <span>线下交付</span>
            <p style=" color: #909399;">需上传交付单（PDF格式）</p>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 第二步：填写交付信息 -->
      <div v-if="deliveryStep === 2">
        <!-- 线上交付表单 -->
        <el-form
          v-if="deliveryMode === 'online'"
          ref="deliveryOnlineForm"
          :model="deliveryOnlineForm"
          :rules="deliveryOnlineRules"
          label-width="120px"
        >
          <el-form-item label="交付时间" prop="deliveryTime">
            <el-date-picker
              v-model="deliveryOnlineForm.deliveryTime"
              type="datetime"
              placeholder="请选择交付时间"
              style="width: 100%;"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          
          <el-form-item label="交付照片" prop="deliveryPhoto">
            <ImageUploader
              v-model="deliveryOnlineForm.deliveryPhoto"
              :multiple="false"
              :limit="1"
              action="/api/system/file/upload"
              list-type="picture-card"
              :emit-raw="true"
              tips="支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>
          
          <el-form-item label="合作方签字" prop="partnerSignature">
            <ImageUploader
              v-model="deliveryOnlineForm.partnerSignature"
              :multiple="false"
              :limit="1"
              action="/api/system/file/upload"
              list-type="picture-card"
              :emit-raw="true"
              tips="支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>
          
          <el-form-item label="司机签字" prop="driverSignature">
            <ImageUploader
              v-model="deliveryOnlineForm.driverSignature"
              :multiple="false"
              :limit="1"
              action="/api/system/file/upload"
              list-type="picture-card"
              :emit-raw="true"
              tips="支持JPG、PNG格式，大小不超过2MB"
            />
          </el-form-item>
        </el-form>

        <!-- 线下交付表单 -->
        <el-form
          v-if="deliveryMode === 'offline'"
          ref="deliveryOfflineForm"
          :model="deliveryOfflineForm"
          :rules="deliveryOfflineRules"
          label-width="120px"
        >
          <el-form-item label="交付单(PDF)" prop="deliveryDocument">
            <el-upload
              class="upload-demo"
              :action="uploadAction"
              :on-success="handleDeliveryDocumentSuccess"
              :on-remove="handleDeliveryDocumentRemove"
              :file-list="deliveryDocumentList"
              :limit="1"
              accept=".pdf"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传PDF文件，且不超过10MB</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="deliveryDialogVisible = false">取消</el-button>
        <el-button v-if="deliveryStep === 1" type="primary" :disabled="!deliveryMode" @click="handleNextStep">下一步</el-button>
        <el-button v-if="deliveryStep === 2" @click="deliveryStep = 1">上一步</el-button>
        <el-button v-if="deliveryStep === 2" type="primary" :loading="deliverySubmitLoading" @click="handleDeliverySubmit">提交交付</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getUserOrderListPage, deleteUserOrder, submitDelivery } from '@/api/userOrder'
import ImageUploader from '@/components/ImageUploader'
import {
  USER_ORDER_STAGE_OPTIONS,
  USER_ORDER_STATUS_OPTIONS,
  USER_ORDER_STAGE,
  getUserOrderStageText,
  getUserOrderStageTagType,
  getUserOrderStatusText,
  getUserOrderStatusTagType
} from '@/constants/userOrder'

export default {
  name: 'UserOrderList',
  components: {
    ImageUploader
  },
  data() {
    return {
      loading: false,

      // 搜索表单
      searchForm: {
        no: '',
        stage: '',
        status: '',
        contractNo: '',
        contractName: '',
        contractPartnerName: '',
        partyAName: '',
        partyBName: '',
        processorName: ''
      },

      // 表格数据
      tableData: [],

      // 分页
      pagination: {
      page: 1,
        size: 10,
        total: 0
      },

      // 订单状态阶段选项
      stageOptions: USER_ORDER_STAGE_OPTIONS,

      // 订单状态选项
      statusOptions: USER_ORDER_STATUS_OPTIONS,

      // 交付对话框
      deliveryDialogVisible: false,
      deliveryStep: 1, // 1: 选择模式, 2: 填写信息
      deliveryMode: '', // online/offline
      deliverySubmitLoading: false,
      currentOrder: {},
      uploadAction: '/api/system/file/upload',
      
      // 线上交付表单
      deliveryOnlineForm: {
        deliveryTime: '',
        deliveryPhoto: '',
        partnerSignature: '',
        driverSignature: ''
      },
      deliveryOnlineRules: {
        deliveryTime: [
          { required: true, message: '请选择交付时间', trigger: 'change' }
        ],
        deliveryPhoto: [
          { required: true, message: '请上传交付照片', trigger: 'change' }
        ],
        partnerSignature: [
          { required: true, message: '请上传合作方签字', trigger: 'change' }
        ],
        driverSignature: [
          { required: true, message: '请上传司机签字', trigger: 'change' }
        ]
      },
      
      // 线下交付表单
      deliveryOfflineForm: {
        deliveryDocument: ''
      },
      deliveryOfflineRules: {
        deliveryDocument: [
          { required: true, message: '请上传交付单', trigger: 'change' }
        ]
      },
      deliveryDocumentList: []
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    // 获取列表数据
    async fetchList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.pagination.page,
          pageSize: this.pagination.size
        }
        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === '') {
            delete params[key]
          }
        })
        const response = await getUserOrderListPage(params)
        if (response && response.data) {
          this.tableData = response.data.records || response.data.list || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取用户订单列表失败:', error)
        this.$message.error('获取用户订单列表失败')
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchList()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        no: '',
        stage: '',
        status: '',
        contractNo: '',
        contractName: '',
        contractPartnerName: '',
        partyAName: '',
        partyBName: '',
        processorName: ''
      }
      this.pagination.page = 1
      this.fetchList()
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.fetchList()
    },

    // 页码改变
    handleCurrentChange(page) {
      this.pagination.page = page
      this.fetchList()
    },

    // 编辑订单
    handleEdit(row) {
      this.$router.push({
        name: 'UserOrderAdd',
        query: { id: row.id }
      })
    },

    // 登记信息（统一入口）
    handleRegisterInfo(row) {
      this.$router.push({
        name: 'UserOrderRegister',
        query: { id: row.id }
      })
    },

    // 删除订单
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteUserOrder(row.id)
        this.$message.success('删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除订单失败:', error)
          this.$message.error('删除订单失败')
        }
      }
    },

    // 获取订单状态阶段文本
    getStageText(stage) {
      return getUserOrderStageText(stage)
    },

    // 获取订单状态阶段标签类型
    getStageTagType(stage) {
      return getUserOrderStageTagType(stage)
    },

    // 获取订单状态文本
    getStatusText(status) {
      return getUserOrderStatusText(status)
    },

    // 获取订单状态标签类型
    getStatusTagType(status) {
      return getUserOrderStatusTagType(status)
    },

    // 显示图片URL（处理相对路径和绝对路径）
    displayUrl(url) {
      if (!url) return ''
      // 如果是绝对路径，直接返回
      if (/^(https?:)?\/\//.test(url)) {
        return url
      }
      // 如果是相对路径，拼接基础URL
      const baseUrl = process.env.VUE_APP_BASE_URL || ''
      return baseUrl + (url.startsWith('/') ? url : '/' + url)
    },

    // 添加订单
    handleAdd() {
      this.$router.push({ name: 'UserOrderAdd' })
    },

    // 交付订单
    handleDelivery(row) {
      this.currentOrder = row
      this.deliveryDialogVisible = true
    },

    // 进入下一步
    handleNextStep() {
      this.deliveryStep = 2
    },

    // 关闭交付对话框
    handleDeliveryDialogClose() {
      this.deliveryStep = 1
      this.deliveryMode = ''
      this.deliveryOnlineForm = {
        deliveryTime: '',
        deliveryPhoto: '',
        partnerSignature: '',
        driverSignature: ''
      }
      this.deliveryOfflineForm = {
        deliveryDocument: ''
      }
      this.deliveryDocumentList = []
      
      if (this.$refs.deliveryOnlineForm) {
        this.$refs.deliveryOnlineForm.clearValidate()
      }
      if (this.$refs.deliveryOfflineForm) {
        this.$refs.deliveryOfflineForm.clearValidate()
      }
    },

    // 交付单上传成功
    handleDeliveryDocumentSuccess(response, file) {
      if (response && response.data) {
        this.deliveryOfflineForm.deliveryDocument = response.data.url || response.data
        if (this.$refs.deliveryOfflineForm) {
          this.$refs.deliveryOfflineForm.validateField('deliveryDocument')
        }
      }
    },

    // 交付单移除
    handleDeliveryDocumentRemove() {
      this.deliveryOfflineForm.deliveryDocument = ''
      this.deliveryDocumentList = []
    },

    // 提交交付
    async handleDeliverySubmit() {
      const formRef = this.deliveryMode === 'online' ? 'deliveryOnlineForm' : 'deliveryOfflineForm'
      
      if (!this.$refs[formRef]) return
      
      this.$refs[formRef].validate(async(valid) => {
        if (!valid) {
          return false
        }
        
        this.deliverySubmitLoading = true
        try {
          const deliveryData = {
            orderId: this.currentOrder.id,
            deliveryMode: this.deliveryMode
          }
          
          if (this.deliveryMode === 'online') {
            deliveryData.deliveryTime = this.deliveryOnlineForm.deliveryTime
            deliveryData.deliveryPhoto = this.deliveryOnlineForm.deliveryPhoto
            deliveryData.partnerSignature = this.deliveryOnlineForm.partnerSignature
            deliveryData.driverSignature = this.deliveryOnlineForm.driverSignature
          } else {
            deliveryData.deliveryDocument = this.deliveryOfflineForm.deliveryDocument
          }
          
          await submitDelivery(deliveryData)
          this.$message.success('交付成功')
          this.deliveryDialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('交付失败:', error)
          this.$message.error('交付失败')
        } finally {
          this.deliverySubmitLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .search-form {
    margin-bottom: 20px;
  }
}
</style>
