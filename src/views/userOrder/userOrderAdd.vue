<template>
  <div class="app-container">
    <div class="page-header">
      <h2>用户订单</h2>
    </div>


      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单编号">
              <el-input v-model="form.no" placeholder="系统自动生成" readonly disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单状态阶段">
              <el-select v-model="form.stage" placeholder="请选择订单状态阶段" style="width: 100%;" disabled>
                <el-option
                  v-for="item in stageOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单状态">
              <el-select v-model="form.status" placeholder="请选择订单状态" style="width: 100%;" disabled>
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置" prop="location">
              <el-input v-model="form.location" placeholder="请输入位置" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同" prop="contractId">
              <el-input
                v-model="form.contractName"
                placeholder="请选择合同"
                readonly
                @focus="showContractSelector"
              >
                <el-button slot="append" type="primary" @click="showContractSelector">选择合同</el-button>
              </el-input>
              <div v-if="form.contractNo" style="margin-top: 8px; color: #666; font-size: 12px;">
                合同编号：{{ form.contractNo }}
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经办人" prop="processorId">
              <el-input
                v-model="form.processorName"
                placeholder="请选择经办人"
                readonly
                @focus="showProcessorSelector"
              >
                <el-button slot="append" type="primary" @click="showProcessorSelector">选择经办人</el-button>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="甲方" prop="partyA">
              <el-input
                v-model="form.partyAName"
                placeholder="请选择甲方"
                readonly
                @focus="showPartyASelector"
              >
                <el-button slot="append" type="primary" @click="showPartyASelector">选择甲方</el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="乙方" prop="partyB">
              <el-input
                v-model="form.partyBName"
                placeholder="请选择乙方"
                readonly
                @focus="showPartyBSelector"
              >
                <el-button slot="append" type="primary" @click="showPartyBSelector">选择乙方</el-button>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="订单图片" prop="imgUrl">
          <ImageUploader
            v-model="form.imgUrl"
            :multiple="false"
            :limit="1"
            action="/api/system/file/upload"
            list-type="picture-card"
            :emit-raw="true"
            tips="支持JPG、PNG格式，大小不超过2MB"
          />
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <div class="form-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '更新' : '保存' }}
        </el-button>
      </div>


    <!-- 合同选择器 -->
    <ContractSelector
      :visible.sync="contractSelectorVisible"
      title="选择合同"
      :multiple="false"
      @confirm="handleContractSelected"
    />

    <!-- 经办人选择器 -->
    <agent-selector
      :visible.sync="processorSelectorVisible"
      title="选择经办人"
      :multiple="false"
      @confirm="handleProcessorSelected"
    />

    <!-- 甲方选择器 -->
    <UserSelector
      :visible.sync="partyASelectorVisible"
      title="选择甲方"
      :multiple="false"
      @confirm="handlePartyASelected"
    />

    <!-- 乙方选择器 -->
    <UserSelector
      :visible.sync="partyBSelectorVisible"
      title="选择乙方"
      :multiple="false"
      @confirm="handlePartyBSelected"
    />
  </div>
</template>

<script>
import { createUserOrder, updateUserOrder, getUserOrderDetail } from '@/api/userOrder'
import ContractSelector from '@/components/ContractSelector'
import AgentSelector from '@/components/AgentSelector'
import UserSelector from '@/components/UserSelector'
import ImageUploader from '@/components/ImageUploader'
import {
  USER_ORDER_STAGE_OPTIONS,
  USER_ORDER_STATUS_OPTIONS
} from '@/constants/userOrder'

export default {
  name: 'UserOrderAdd',
  components: {
    ContractSelector,
    AgentSelector,
    UserSelector,
    ImageUploader
  },
  data() {
    return {
      submitLoading: false,
      isEdit: false,
      orderId: null,
      contractSelectorVisible: false,
      processorSelectorVisible: false,
      partyASelectorVisible: false,
      partyBSelectorVisible: false,

      // 表单数据
      form: {
        id: '',
        no: '',
        stage: '',
        status: '',
        contractId: '',
        contractNo: '',
        contractName: '',
        contractPartner: '',
        contractPartnerName: '',
        partyA: '',
        partyAName: '',
        partyB: '',
        partyBName: '',
        processorId: '',
        processorName: '',
        imgUrl: '',
        location: ''
      },

      // 表单验证规则
      rules: {
        contractId: [
          { required: true, message: '请选择合同', trigger: 'change' }
        ],
        processorId: [
          { required: true, message: '请选择经办人', trigger: 'change' }
        ]
      },

      // 订单状态阶段选项
      stageOptions: USER_ORDER_STAGE_OPTIONS,

      // 订单状态选项
      statusOptions: USER_ORDER_STATUS_OPTIONS
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    // 初始化数据
    async initData() {
      const id = this.$route.query.id
      if (id) {
        this.isEdit = true
        this.orderId = id
        await this.loadOrderDetail(id)
      } else {
        this.isEdit = false
        this.resetForm()
      }
    },

    // 加载订单详情
    async loadOrderDetail(id) {
      try {
        const response = await getUserOrderDetail({ id })
        if (response && response.data) {
          const data = response.data
          this.form = {
            id: data.id,
            no: data.no || '',
            stage: data.stage || '',
            status: data.status || '',
            contractId: data.contractId || '',
            contractNo: data.contractNo || '',
            contractName: data.contractName || '',
            contractPartner: data.contractPartner || '',
            contractPartnerName: data.contractPartnerName || '',
            partyA: data.partyA || '',
            partyAName: data.partyAName || '',
            partyB: data.partyB || '',
            partyBName: data.partyBName || '',
            processorId: data.processorId || '',
            processorName: data.processorName || '',
            imgUrl: data.imgUrl || '',
            location: data.location || ''
          }
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败')
      }
    },

    // 重置表单
    resetForm() {
      this.form = {
        id: '',
        no: '',
        stage: '',
        status: '',
        contractId: '',
        contractNo: '',
        contractName: '',
        contractPartner: '',
        contractPartnerName: '',
        partyA: '',
        partyAName: '',
        partyB: '',
        partyBName: '',
        processorId: '',
        processorName: '',
        imgUrl: '',
        location: ''
      }
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },

    // 显示合同选择器
    showContractSelector() {
      this.contractSelectorVisible = true
    },

    // 合同选择确认
    handleContractSelected(contracts) {
      if (contracts && contracts.length > 0) {
        const contract = contracts[0]
        this.form.contractId = contract.id
        this.form.contractNo = contract.no
        this.form.contractName = contract.name
        this.form.contractPartner = contract.partner
        this.form.contractPartnerName = contract.partnerName
        this.$refs.form.validateField('contractId')
      }
    },

    // 显示经办人选择器
    showProcessorSelector() {
      this.processorSelectorVisible = true
    },

    // 经办人选择确认
    handleProcessorSelected(agents) {
      if (agents && agents.length > 0) {
        const agent = agents[0]
        this.form.processorId = agent.id
        this.form.processorName = agent.name || agent.accountName
        this.$refs.form.validateField('processorId')
      }
    },

    // 显示甲方选择器
    showPartyASelector() {
      this.partyASelectorVisible = true
    },

    // 甲方选择确认
    handlePartyASelected(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.form.partyA = user.id
        this.form.partyAName = user.nickname || user.username
      }
    },

    // 显示乙方选择器
    showPartyBSelector() {
      this.partyBSelectorVisible = true
    },

    // 乙方选择确认
    handlePartyBSelected(users) {
      if (users && users.length > 0) {
        const user = users[0]
        this.form.partyB = user.id
        this.form.partyBName = user.nickname || user.username
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }

        this.submitLoading = true
        try {
          if (this.isEdit) {
            await updateUserOrder(this.form)
            this.$message.success('更新订单成功')
          } else {
            await createUserOrder(this.form)
            this.$message.success('创建订单成功')
          }
          this.$router.push({ name: 'UserOrderList' })
        } catch (error) {
          console.error(this.isEdit ? '更新订单失败' : '创建订单失败:', error)
          this.$message.error(this.isEdit ? '更新订单失败' : '创建订单失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 取消
    handleCancel() {
      this.$router.push({ name: 'UserOrderList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .form-card {
    max-width: 1200px;
    margin: 0 auto;
  }

  .form-footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
    text-align: right;

    .el-button {
      margin-left: 10px;
    }
  }
}
</style>

