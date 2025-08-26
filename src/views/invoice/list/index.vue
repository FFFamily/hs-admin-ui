<template>
  <div class="invoice-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.number" placeholder="发票号码" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="search.title" placeholder="抬头名称" style="width: 200px; margin-right: 10px;" />
        <el-select v-model="search.status" placeholder="状态" style="width: 150px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="已开" value="issued" />
          <el-option label="未开" value="pending" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增发票</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="number" label="发票号码" width="180" />
        <el-table-column prop="title" label="抬头名称" width="200" />
        <el-table-column prop="amount" label="金额" width="120" />
        <el-table-column prop="planDate" label="计划开票日期" width="150" />
        <el-table-column prop="orderNo" label="订单编号" width="150" />
        <el-table-column prop="orderType" label="订单类型" width="150" />
        <el-table-column prop="invoiceType" label="发票类型" width="150" />
        <el-table-column prop="invoiceDate" label="开票日期" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'issued' ? 'success' : 'info'">{{ scope.row.status === 'issued' ? '已开' : '未开' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="handleConfirm(scope.row)">确认</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="page"
          @current-change="fetchList"
        />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="1000px">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <div class="form-section">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="发票号码" prop="number">
                <el-input v-model="form.number" placeholder="请输入发票号码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联订单" prop="orderId">
                <el-input v-model="form.orderId" placeholder="请选择关联订单" readonly @focus="openOrderSelector">
                  <el-button slot="append" icon="el-icon-search" @click="openOrderSelector">选择</el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单类型" prop="orderType">
                <el-input v-model="form.orderType" placeholder="订单类型" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发票类型" prop="invoiceType">
                <el-select v-model="form.invoiceType" placeholder="请选择发票类型" style="width: 100%;">
                  <el-option label="进项" value="进项" />
                  <el-option label="销项" value="销项" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合作方" prop="partner">
                <el-input v-model="form.partner" placeholder="合作方" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开票银行" prop="invoiceBank">
                <el-input v-model="form.invoiceBank" placeholder="请输入开票银行" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 发票明细 -->
        <el-divider content-position="left">发票明细</el-divider>
        <div class="form-section">
          <!-- 合计行 -->
          <div class="summary-row">
            <el-row :gutter="16">
              <el-col :span="6">
                <span class="summary-label">合计订单总金额：</span>
                <span class="summary-value">¥{{ formatAmount(totalOrderAmount) }}</span>
              </el-col>
              <el-col :span="6">
                <span class="summary-label">合计实开发票：</span>
                <span class="summary-value">¥{{ formatAmount(totalActualInvoice) }}</span>
              </el-col>
              <el-col :span="6">
                <span class="summary-label">合计应开发票：</span>
                <span class="summary-value">¥{{ formatAmount(totalShouldInvoice) }}</span>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" size="small" @click="addDetail">添加明细</el-button>
              </el-col>
            </el-row>
          </div>
          
          <el-table :data="form.details" border style="width: 100%; margin-top: 10px;">
            <el-table-column prop="orderNo" label="订单编号" width="180" />
            <el-table-column prop="orderTotalAmount" label="订单总金额" width="140">
              <template slot-scope="scope">
                ¥{{ formatAmount(scope.row.orderTotalAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderActualInvoice" label="订单实开发票" width="140">
              <template slot-scope="scope">
                ¥{{ formatAmount(scope.row.orderActualInvoice) }}
              </template>
            </el-table-column>
            <el-table-column prop="orderShouldInvoice" label="订单应开发票" width="140">
              <template slot-scope="scope">
                ¥{{ formatAmount(scope.row.orderShouldInvoice) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="removeDetail(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 订单选择器 -->
    <order-selector
      :visible.sync="orderSelectorVisible"
      title="选择订单"
      :multiple="false"
      :show-pagination="true"
      @confirm="handleOrderConfirm"
    />

    <!-- 确认发票弹窗 -->
    <el-dialog title="确认发票" :visible.sync="confirmDialogVisible" width="600px">
      <el-form :model="confirmForm" :rules="confirmRules" ref="confirmForm" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="经办人" prop="processor">
              <el-input v-model="confirmForm.processor" placeholder="请输入经办人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票编号" prop="invoiceNumber">
              <el-input v-model="confirmForm.invoiceNumber" placeholder="请输入发票编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票时间" prop="invoiceTime">
              <el-date-picker 
                v-model="confirmForm.invoiceTime" 
                type="datetime" 
                placeholder="选择开票时间" 
                style="width: 100%;" 
                value-format="yyyy-MM-dd HH:mm:ss" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总金额" prop="totalAmount">
              <el-input-number 
                v-model="confirmForm.totalAmount" 
                :min="0" 
                :precision="2" 
                style="width: 100%;" 
                placeholder="请输入总金额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税额" prop="taxAmount">
              <el-input-number 
                v-model="confirmForm.taxAmount" 
                :min="0" 
                :precision="2" 
                style="width: 100%;" 
                placeholder="请输入税额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="不含税金额" prop="amountWithoutTax">
              <el-input-number 
                v-model="confirmForm.amountWithoutTax" 
                :min="0" 
                :precision="2" 
                style="width: 100%;" 
                placeholder="请输入不含税金额"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmSubmit">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'InvoiceList',
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        number: '',
        title: '',
        status: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: null,
        number: '',
        orderId: '',
        orderType: '',
        invoiceType: '',
        partner: '',
        invoiceBank: '',
        details: []
      },
      rules: {
        number: [{ required: true, message: '请输入发票号码', trigger: 'blur' }],
        orderId: [{ required: true, message: '请选择关联订单', trigger: 'blur' }],
        invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
        invoiceBank: [{ required: true, message: '请输入开票银行', trigger: 'blur' }]
      },
      orderSelectorVisible: false,
      // 确认弹窗相关数据
      confirmDialogVisible: false,
      confirmForm: {
        id: null,
        processor: '',
        invoiceNumber: '',
        invoiceTime: '',
        totalAmount: 0,
        taxAmount: 0,
        amountWithoutTax: 0
      },
      confirmRules: {
        processor: [{ required: true, message: '请输入经办人', trigger: 'blur' }],
        invoiceNumber: [{ required: true, message: '请输入发票编号', trigger: 'blur' }],
        invoiceTime: [{ required: true, message: '请选择开票时间', trigger: 'change' }],
        totalAmount: [{ required: true, message: '请输入总金额', trigger: 'blur' }],
        taxAmount: [{ required: true, message: '请输入税额', trigger: 'blur' }],
        amountWithoutTax: [{ required: true, message: '请输入不含税金额', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchList()
  },
  computed: {
    totalOrderAmount() {
      return this.form.details.reduce((sum, detail) => sum + (Number(detail.orderTotalAmount) || 0), 0)
    },
    totalActualInvoice() {
      return this.form.details.reduce((sum, detail) => sum + (Number(detail.orderActualInvoice) || 0), 0)
    },
    totalShouldInvoice() {
      return this.form.details.reduce((sum, detail) => sum + (Number(detail.orderShouldInvoice) || 0), 0)
    }
  },
  methods: {
    async fetchList() {
      this.loading = true
      setTimeout(() => {
        this.list = [
          { id: 1, number: 'FP20240001', title: '北京某公司', amount: 1000, date: '2024-06-01', status: 'issued' },
          { id: 2, number: 'FP20240002', title: '上海某企业', amount: 500, date: '2024-06-02', status: 'pending' }
        ]
        this.total = 2
        this.loading = false
      }, 500)
    },
    handleAdd() {
      this.dialogTitle = '新增发票'
      this.form = { 
        id: null, 
        number: '', 
        orderId: '', 
        orderType: '', 
        invoiceType: '', 
        partner: '', 
        invoiceBank: '', 
        details: [] 
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑发票'
      this.form = { ...row }
      this.dialogVisible = true
    },
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },
    openOrderSelector() {
      this.orderSelectorVisible = true
    },
    handleOrderConfirm(selected) {
      const order = Array.isArray(selected) ? selected[0] : selected
      if (!order) return
      this.form.orderId = order.id || order.orderId || ''
      this.form.orderType = order.orderType || ''
      this.form.partner = order.partner || ''
      this.orderSelectorVisible = false
    },
    addDetail() {
      this.form.details.push({
        orderNo: '',
        orderTotalAmount: 0,
        orderActualInvoice: 0,
        orderShouldInvoice: 0
      })
    },
    removeDetail(index) {
      this.form.details.splice(index, 1)
    },
    handleConfirm(row) {
      this.confirmForm = {
        id: row.id,
        processor: '',
        invoiceNumber: '',
        invoiceTime: '',
        totalAmount: 0,
        taxAmount: 0,
        amountWithoutTax: 0
      }
      this.confirmDialogVisible = true
    },
    handleConfirmSubmit() {
      this.$refs.confirmForm.validate((valid) => {
        if (!valid) return
        
        // 这里调用确认发票的API
        // 假设有一个confirmInvoice的API方法
        const confirmData = {
          id: this.confirmForm.id,
          processor: this.confirmForm.processor,
          invoiceNumber: this.confirmForm.invoiceNumber,
          invoiceTime: this.confirmForm.invoiceTime,
          totalAmount: this.confirmForm.totalAmount,
          taxAmount: this.confirmForm.taxAmount,
          amountWithoutTax: this.confirmForm.amountWithoutTax
        }
        
        // 这里需要根据实际的API调整
        // confirmInvoice(confirmData).then(() => {
        //   this.$message.success('确认发票成功')
        //   this.confirmDialogVisible = false
        //   this.fetchList()
        // }).catch(() => {
        //   this.$message.error('确认发票失败')
        // })
        
        // 模拟成功
        this.$message.success('确认发票成功')
        this.confirmDialogVisible = false
        this.fetchList()
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该发票吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('删除成功（模拟）')
        this.fetchList()
      })
    },
    handleSave() {
      this.$message.success('保存成功（模拟）')
      this.dialogVisible = false
      this.fetchList()
    }
  }
}
</script>

<style scoped>
.invoice-list {
  padding: 20px;
}
.filter-container {
  margin-bottom: 10px;
}

.form-section {
  margin-bottom: 20px;
}

.el-divider {
  margin: 24px 0 16px 0;
}

.el-divider__text {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  background-color: #f5f7fa;
  padding: 0 16px;
}

.summary-row {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.summary-label {
  font-weight: 600;
  color: #606266;
  margin-right: 8px;
}

.summary-value {
  font-weight: 600;
  color: #409EFF;
  font-size: 16px;
}
</style> 