<template>
  <div class="admin-user-list">
    <el-card>
      <el-form :inline="true" :model="search" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="search.username" placeholder="账号" style="width: 180px; margin-right: 10px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
          <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="username" label="账号" width="200" />
        <el-table-column prop="nickname" label="账号名称" width="200" />
        <el-table-column prop="accountTypeId" label="账号类型" width="200">
          <template slot-scope="scope">
            <span>{{ getAccountType(scope.row.accountTypeId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="纳税人识别号" prop="taxNumber" width="180" align="center" />
        <el-table-column prop="password" label="密码" width="200" />
        <el-table-column label="身份" prop="useType" width="100" align="center" >
          <template slot-scope="scope">
            <span>{{ getUseType(scope.row.useType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" prop="createTime" width="160" align="center" />
        <el-table-column label="评级" prop="score" width="60" align="center" />
        <el-table-column label="评级系数" prop="scoreFactor" width="60" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" active-value='use' inactive-value='disable'
              @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="145">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
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
        <el-form-item label="账号类型" prop="accountTypeId">
          <el-select v-model="form.accountTypeId" placeholder="请选择账号类型"
             @change="handleAccountTypeChange">
            <el-option v-for="accountType in accountTypes" :key="accountType.id" :label="accountType.typeName"
              :value="accountType.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="公司账号则为公司名，自然人账号则为该人的名字" />
        </el-form-item>
        <el-form-item label="纳税人识别号" prop="taxNumber">
          <el-input v-model="form.taxNumber" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="身份" prop="useType">
          <el-select v-model="form.useType" placeholder="请选择身份">
            <el-option v-for="item in useTypeList" :key="item.key" :label="item.value" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="评级" prop="score">
          <el-input v-model="form.score" />
        </el-form-item>
        <el-form-item label="评级系数" prop="scoreFactor">
          <el-input v-model="form.scoreFactor" />
        </el-form-item>
        <el-form-item label="编号(账号)" prop="username">
          <el-input disabled v-model="form.username" placeholder="专责用户类型后，自动按序生成账号编号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 这里的接口方法请后续补充联动
import {
  getUserPage, createWxUser, updateWxUser, changeWxUserStatus,
  deleteWxUser, changeWxUserType, generateAccountUsername, getUseTypeList
} from '@/api/user'
import { getAccountTypeList } from '@/api/accountType'
export default {
  name: 'AdminUserList',
  data() {
    return {
      useTypeList: [],
      accountTypes: [],
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      search: {
        username: '',
        type: '',
        phone: ''
      },
      loading: false,
      dialogVisible: false,
      dialogTitle: '',
      form: {
        id: undefined,
        type: '',
        username: '',
        password: '',
        // phone: '',
        // idCard: '',
        score: '',
        taxNumber: '',
        bankName: '',
        bankAccount: '',
        credit_code: '',
        address: '',
        contact_phone: '',
        nickname: '',
        status: 1
      },
      rules: {
        // type: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
        accountTypeId: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
      updateRules: {
        ...this.rules,
      }
    }
  },
  created() {
    this.getAccountTypes()
    this.getUseTypeList()
    this.fetchList()
  },
  methods: {
    getUseTypeList() {
      getUseTypeList().then(res => {
        this.useTypeList = res.data
      })
    },
    getAccountTypes() {
      getAccountTypeList().then(res => {
        this.accountTypes = res.data
      })
    },
    fetchList() {
      getUserPage({
        pageNum: this.page,
        pageSize: this.pageSize,
        isFilterPass: false,
        ...this.search
      }).then(res => {
        this.list = res.data.records
        this.total = res.data.total
      })
    },
    handleAdd() {
      this.dialogTitle = '新增用户'
      this.form = {
        id: null,
        type: '',
        username: '',
        password: '',
        phone: '',
        idCard: '',
        score: '',
        taxNumber: '',
        bankName: '',
        bankAccount: '',
        credit_code: '',
        address: '',
        contact_phone: '',
        payAccount1: '',
        payAccount2: '',
        payAccount3: '',
        nickname: '',
        status: 1
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑用户'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleEditPassword(row) {
      this.dialogTitle = '修改密码'
      this.form = { ...row }
      this.dialogVisible = true
    },
    // 设置用户使用类型方法
    handleChangeUseType(id, useType) {
      changeWxUserType(id, useType).then(res => {
        this.$message.success('设置成功')
        this.fetchList()
      })
    },
    handleDelete(row) {
      deleteWxUser(row.id).then(res => {
        this.$message.success('删除成功')
        this.fetchList()
      })
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.id) {
          updateWxUser(this.form).then(res => {
            this.$message.success('更新成功')
            this.dialogVisible = false
            this.fetchList()
          })
        } else {
          createWxUser(this.form).then(res => {
            this.$message.success('新增成功')
            this.dialogVisible = false
            this.fetchList()
          })
        }
      })
    },
    handleStatusChange(row) {
      changeWxUserStatus(row.id).then(res => {
        this.$message.success('用户状态变更成功')
        this.fetchList()
      })
    },
    handleTypeChange() {
      // 切换类型时清空企业专属字段
      if (this.form.type === 'person') {
        this.form.score = ''
        this.form.taxNumber = ''
        this.form.bankName = ''
        this.form.bankAccount = ''
        this.form.credit_code = ''
        this.form.address = ''
        this.form.contact_phone = ''
        this.form.payAccount1 = ''
        this.form.payAccount2 = ''
        this.form.payAccount3 = ''
      }
    },
    // 切换用户类型时
    handleAccountTypeChange() {
      generateAccountUsername(this.form.id,this.form.accountTypeId).then(res => {
        this.form.username = res.data
      })
    },
    // 列表用户类型
    getType(type) {
      if (type === 'company') {
        return '企业'
      } else if (type === 'person') {
        return '个人'
      } else {
        return '未设置'
      }
    },
    getAccountType(id) {
      return this.accountTypes.find(item => item.id === id)?.typeName
    },
    getUseType(id) {
      return this.useTypeList.find(item => item.key === id)?.value
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
</style>