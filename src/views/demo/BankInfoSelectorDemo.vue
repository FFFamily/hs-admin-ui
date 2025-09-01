<template>
  <div class="bank-info-selector-demo">
    <el-card>
      <div slot="header">
        <span>银行信息选择器演示</span>
      </div>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <h3>单选模式</h3>
          <el-form :model="singleForm" label-width="100px">
            <el-form-item label="选择的银行信息">
              <el-input 
                v-model="singleForm.bankInfoText" 
                placeholder="请选择银行信息" 
                readonly
                style="width: 300px;"
              >
                <el-button slot="append" icon="el-icon-search" @click="showSingleSelector"></el-button>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="showSingleSelector">选择银行信息</el-button>
            </el-form-item>
          </el-form>
          
          <div v-if="singleForm.selectedBankInfo" class="selected-info">
            <h4>已选择的银行信息：</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="账户ID">{{ singleForm.selectedBankInfo.accountId }}</el-descriptions-item>
              <el-descriptions-item label="开户行">{{ singleForm.selectedBankInfo.bankName }}</el-descriptions-item>
              <el-descriptions-item label="银行卡号">{{ singleForm.selectedBankInfo.cardNumber }}</el-descriptions-item>
              <el-descriptions-item label="联行号">{{ singleForm.selectedBankInfo.bankCode }}</el-descriptions-item>
              <el-descriptions-item label="是否默认">
                <el-tag v-if="singleForm.selectedBankInfo.isDefault === '1'" type="success">是</el-tag>
                <el-tag v-else type="info">否</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
        
        <el-col :span="12">
          <h3>多选模式</h3>
          <el-form :model="multipleForm" label-width="100px">
            <el-form-item label="选择的银行信息">
              <el-input 
                v-model="multipleForm.bankInfoText" 
                placeholder="请选择银行信息" 
                readonly
                style="width: 300px;"
              >
                <el-button slot="append" icon="el-icon-search" @click="showMultipleSelector"></el-button>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="showMultipleSelector">选择银行信息</el-button>
            </el-form-item>
          </el-form>
          
          <div v-if="multipleForm.selectedBankInfos.length > 0" class="selected-info">
            <h4>已选择的银行信息 ({{ multipleForm.selectedBankInfos.length }})：</h4>
            <el-table :data="multipleForm.selectedBankInfos" border style="width: 100%">
              <el-table-column prop="accountId" label="账户ID" width="100" />
              <el-table-column prop="bankName" label="开户行" width="120" />
              <el-table-column prop="cardNumber" label="银行卡号" width="150" />
              <el-table-column label="是否默认" width="80" align="center">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.isDefault === '1'" type="success" size="mini">是</el-tag>
                  <el-tag v-else type="info" size="mini">否</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 单选银行信息选择器 -->
    <BankInfoSelector
      :visible.sync="singleSelectorVisible"
      title="选择银行信息（单选）"
      :multiple="false"
      @confirm="handleSingleConfirm"
      @close="singleSelectorVisible = false"
    />
    
    <!-- 多选银行信息选择器 -->
    <BankInfoSelector
      :visible.sync="multipleSelectorVisible"
      title="选择银行信息（多选）"
      :multiple="true"
      @confirm="handleMultipleConfirm"
      @close="multipleSelectorVisible = false"
    />
  </div>
</template>

<script>
import BankInfoSelector from '@/components/BankInfoSelector'

export default {
  name: 'BankInfoSelectorDemo',
  components: {
    BankInfoSelector
  },
  data() {
    return {
      singleSelectorVisible: false,
      multipleSelectorVisible: false,
      singleForm: {
        selectedBankInfo: null,
        bankInfoText: ''
      },
      multipleForm: {
        selectedBankInfos: [],
        bankInfoText: ''
      }
    }
  },
  methods: {
    // 显示单选选择器
    showSingleSelector() {
      this.singleSelectorVisible = true
    },
    
    // 显示多选选择器
    showMultipleSelector() {
      this.multipleSelectorVisible = true
    },
    
    // 处理单选确认
    handleSingleConfirm(bankInfos) {
      if (bankInfos && bankInfos.length > 0) {
        const bankInfo = bankInfos[0]
        this.singleForm.selectedBankInfo = bankInfo
        this.singleForm.bankInfoText = `${bankInfo.bankName} - ${bankInfo.cardNumber}`
        this.$message.success('选择成功')
      }
    },
    
    // 处理多选确认
    handleMultipleConfirm(bankInfos) {
      this.multipleForm.selectedBankInfos = bankInfos
      this.multipleForm.bankInfoText = `已选择 ${bankInfos.length} 个银行信息`
      this.$message.success(`成功选择 ${bankInfos.length} 个银行信息`)
    }
  }
}
</script>

<style scoped>
.bank-info-selector-demo {
  padding: 20px;
}

.selected-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.selected-info h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
}
</style> 