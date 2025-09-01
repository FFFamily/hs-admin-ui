<template>
  <div class="bank-info-list">
    <el-card>
      <el-form :inline="true" :model="search" label-width="80px">
        <el-form-item label="账户ID">
          <el-input v-model="search.accountId" placeholder="请输入账户ID" style="width: 180px; margin-right: 10px;" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="showUserSelector">选择用户</el-button>
        </el-form-item>
        <el-form-item label="开户行">
          <el-input v-model="search.bankName" placeholder="开户行" style="width: 180px; margin-right: 10px;" />
        </el-form-item>
        <el-form-item label="银行卡号">
          <el-input v-model="search.cardNumber" placeholder="银行卡号" style="width: 180px; margin-right: 10px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
          <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增银行信息</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="accountId" label="账户ID" width="120" />
        <el-table-column prop="bankName" label="开户行" width="150" />
        <el-table-column prop="cardNumber" label="银行卡号" width="180" />
        <el-table-column prop="bankCode" label="联行号" width="120" />
        <el-table-column label="是否默认" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isDefault === '1'" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="warning" @click="handleSetDefault(scope.row)" 
                      :disabled="scope.row.isDefault === '1'">设为默认</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; text-align: right;">
        <el-pagination background layout="total, prev, pager, next, jumper" :total="total" :page-size="pageSize"
          :current-page.sync="page" @current-change="fetchList" />
      </div>
    </el-card>
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" width="500px" :visible.sync="dialogVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="账户ID" prop="accountId">
          <el-input v-model="form.accountId" placeholder="请输入账户ID" readonly>
            <el-button slot="append" icon="el-icon-search" @click="showUserSelector"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="开户行" prop="bankName">
          <el-input v-model="form.bankName" placeholder="请输入开户行名称" />
        </el-form-item>
        <el-form-item label="银行卡号" prop="cardNumber">
          <el-input v-model="form.cardNumber" placeholder="请输入银行卡号" />
        </el-form-item>
        <el-form-item label="联行号" prop="bankCode">
          <el-input v-model="form.bankCode" placeholder="请输入联行号" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-select v-model="form.isDefault" placeholder="请选择是否默认">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 用户选择器 -->
    <UserSelector
      :visible.sync="userSelectorVisible"
      title="选择用户"
      :multiple="false"
      @confirm="handleUserConfirm"
      @close="userSelectorVisible = false"
    />
  </div>
</template>

<script>
import {
  getBankInfoList,
  createBankInfo,
  updateBankInfo,
  deleteBankInfo,
  setDefaultBankInfo
} from '@/api/bankInfo'
import UserSelector from '@/components/UserSelector'

export default {
  name: 'BankInfoList',
  components: {
    UserSelector
  },
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        accountId: '',
        bankName: '',
        cardNumber: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      userSelectorVisible: false,
      form: {
        id: undefined,
        accountId: '',
        bankName: '',
        cardNumber: '',
        bankCode: '',
        isDefault: '0'
      },
      rules: {
        accountId: [{ required: true, message: '请输入账户ID', trigger: 'blur' }],
        bankName: [{ required: true, message: '请输入开户行名称', trigger: 'blur' }],
        cardNumber: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    fetchList() {
      this.loading = true
      getBankInfoList({
        pageNum: this.page,
        pageSize: this.pageSize,
        ...this.search
      }).then(res => {
        this.list = res.data.records
        this.total = res.data.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleAdd() {
      this.dialogTitle = '新增银行信息'
      this.form = {
        id: undefined,
        accountId: '',
        bankName: '',
        cardNumber: '',
        bankCode: '',
        isDefault: '0'
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑银行信息'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleSetDefault(row) {
      this.$confirm('确定要设为默认银行信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setDefaultBankInfo(row.id).then(res => {
          this.$message.success('设置默认成功')
          this.fetchList()
        })
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该银行信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBankInfo(row.id).then(res => {
          this.$message.success('删除成功')
          this.fetchList()
        })
      })
    },
    // 显示用户选择器（用于选择账户ID）
    showUserSelector() {
      this.userSelectorVisible = true
    },
    
    // 处理用户选择确认
    handleUserConfirm(users) {
      if (users && users.length > 0) {
        const selectedUser = users[0]
        this.form.accountId = selectedUser.id
        this.search.accountId = selectedUser.id
      }
      this.userSelectorVisible = false
    },
    
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.id) {
          updateBankInfo(this.form).then(res => {
            this.$message.success('更新成功')
            this.dialogVisible = false
            this.fetchList()
          })
        } else {
          createBankInfo(this.form).then(res => {
            this.$message.success('新增成功')
            this.dialogVisible = false
            this.fetchList()
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.bank-info-list {
  padding: 20px;
}
</style>