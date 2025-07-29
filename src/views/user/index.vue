<template>
  <div class="admin-user-list">
    <el-card>
      <div class="filter-container">
        <el-input v-model="search.username" placeholder="用户名" style="width: 180px; margin-right: 10px;" />
        <el-select v-model="search.type" placeholder="用户类型" style="width: 150px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="个人" value="person" />
          <el-option label="企业" value="company" />
        </el-select>
        <el-input v-model="search.phone" placeholder="手机号" style="width: 180px; margin-right: 10px;" />
        <el-button type="primary" icon="el-icon-search" @click="fetchList">搜索</el-button>
        <el-button type="success" icon="el-icon-plus" style="margin-left: 10px;" @click="handleAdd">新增用户</el-button>
      </div>
      <el-table :data="list" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.type === 'company' ? '企业' : '个人' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="账号" width="200" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="用户类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择用户类型" @change="handleTypeChange">
            <el-option label="个人" value="person" />
            <el-option label="企业" value="company" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item v-if="form.type === 'person' || form.type === 'company'" label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item v-if="form.type === 'person' || form.type === 'company'" label="身份证号" prop="id_card">
          <el-input v-model="form.id_card" />
        </el-form-item>
        <template v-if="form.type === 'company'">
          <el-form-item label="用户评分系数" prop="score">
            <el-input v-model="form.score" />
          </el-form-item>
          <el-form-item label="纳税人识别号" prop="tax_number">
            <el-input v-model="form.tax_number" />
          </el-form-item>
          <el-form-item label="开户行" prop="bank_name">
            <el-input v-model="form.bank_name" />
          </el-form-item>
          <el-form-item label="银行账号" prop="bank_account">
            <el-input v-model="form.bank_account" />
          </el-form-item>
          <el-form-item label="信用代码" prop="credit_code">
            <el-input v-model="form.credit_code" />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="form.address" />
          </el-form-item>
          <el-form-item label="联系电话" prop="contact_phone">
            <el-input v-model="form.contact_phone" />
          </el-form-item>
          <el-form-item label="走款账户1" prop="bank_account1">
            <el-input v-model="form.bank_account1" />
          </el-form-item>
          <el-form-item label="走款账户2" prop="bank_account2">
            <el-input v-model="form.bank_account2" />
          </el-form-item>
          <el-form-item label="走款账户3" prop="bank_account3">
            <el-input v-model="form.bank_account3" />
          </el-form-item>
        </template>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { getUserPage, createWxUser } from '@/api/user'
export default {
  name: 'AdminUserList',
  data() {
    return {
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
        id: null,
        type: '',
        username: '',
        password: '',
        phone: '',
        id_card: '',
        score: '',
        tax_number: '',
        bank_name: '',
        bank_account: '',
        credit_code: '',
        address: '',
        contact_phone: '',
        bank_account1: '',
        bank_account2: '',
        bank_account3: '',
        nickname: '',
        status: 1
      },
      rules: {
        type: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' }
        ],
        id_card: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { pattern: /^(\d{15}|\d{17}[\dXx])$/, message: '请输入正确的身份证号', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    fetchList() {
      getUserPage({
        pageNum: this.page,
        pageSize: this.pageSize,
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
        id_card: '',
        score: '',
        tax_number: '',
        bank_name: '',
        bank_account: '',
        credit_code: '',
        address: '',
        contact_phone: '',
        bank_account1: '',
        bank_account2: '',
        bank_account3: '',
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
    handleDelete(row) {
      // TODO: 接口联动
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        createWxUser(this.form).then(res => {
          this.$message.success('新增成功')
          this.dialogVisible = false
          this.fetchList()
        })
        this.dialogVisible = false
      })
    },
    handleStatusChange(row) {
      // TODO: 启用/停用接口联动
    },
    handleTypeChange() {
      // 切换类型时清空企业专属字段
      if (this.form.type === 'person') {
        this.form.score = ''
        this.form.tax_number = ''
        this.form.bank_name = ''
        this.form.bank_account = ''
        this.form.credit_code = ''
        this.form.address = ''
        this.form.contact_phone = ''
        this.form.bank_account1 = ''
        this.form.bank_account2 = ''
        this.form.bank_account3 = ''
      }
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
</style> 