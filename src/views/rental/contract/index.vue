<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="合同名">
        <el-input v-model="searchForm.name" placeholder="请输入合同名" />
      </el-form-item>
      <el-form-item label="合同编号">
        <el-input v-model="searchForm.code" placeholder="请输入合同编号" />
      </el-form-item>
      <el-form-item label="合同识别号">
        <el-input v-model="searchForm.recognitionCode" placeholder="请输入合同识别号" />
      </el-form-item>
      <el-form-item label="合同类型">
        <el-select v-model="searchForm.type" placeholder="请选择合同类型" clearable>
          <el-option label="回收合同" value="RECYCLE" />
          <el-option label="租赁合同" value="LEASE" />
          <el-option label="混合合同" value="MIXED" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleAdd">新增合同</el-button>
      </el-form-item>
    </el-form>

    <!-- 合同表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="合同名" prop="name" />
      <el-table-column label="合同识别号" prop="recognitionCode" />
      <el-table-column label="合同编号" prop="code" />
      <el-table-column label="合同类型" prop="type">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 'RECYCLE'" type="success">回收合同</el-tag>
          <el-tag v-else-if="scope.row.type === 'LEASE'" type="warning">租赁合同</el-tag>
          <el-tag v-else-if="scope.row.type === 'MIXED'" type="info">混合合同</el-tag>
          <span v-else>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="起始日期" prop="startDate" />
      <el-table-column label="结束日期" prop="endDate" />
      <el-table-column label="付款方式" prop="paymentMethod" />
      <el-table-column label="开票方式" prop="invoiceMethod" />
      <el-table-column label="签署用户" prop="userId" />
      <el-table-column label="创建时间" prop="createTime" />
      <el-table-column label="操作" width="280" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="success" @click="handleViewItems(scope.row)">明细</el-button>
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
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; text-align: right;"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="合同名" prop="name">
          <el-input v-model="form.name" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="合同识别号" prop="recognitionCode">
          <el-input v-model="form.recognitionCode" placeholder="请输入合同识别号" />
        </el-form-item>
        <el-form-item label="合同编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入合同编号" />
        </el-form-item>
        <el-form-item label="合同类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择合同类型" style="width: 100%;">
            <el-option label="回收合同" value="RECYCLE" />
            <el-option label="租赁合同" value="LEASE" />
            <el-option label="混合合同" value="MIXED" />
          </el-select>
        </el-form-item>
        <el-form-item label="起始日期" prop="startDate">
          <el-date-picker v-model="form.startDate" type="datetime" placeholder="选择起始日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="form.endDate" type="datetime" placeholder="选择结束日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择付款方式" style="width: 100%;">
            <el-option label="现金" value="CASH" />
            <el-option label="银行转账" value="BANK_TRANSFER" />
            <el-option label="支票" value="CHECK" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="开票方式" prop="invoiceMethod">
          <el-select v-model="form.invoiceMethod" placeholder="请选择开票方式" style="width: 100%;">
            <el-option label="增值税普通发票" value="VAT_NORMAL" />
            <el-option label="增值税专用发票" value="VAT_SPECIAL" />
            <el-option label="电子发票" value="ELECTRONIC" />
            <el-option label="不开票" value="NO_INVOICE" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 合同明细弹窗 -->
    <el-dialog title="合同明细" :visible.sync="itemsDialogVisible" width="900px">
      <div style="margin-bottom: 20px;">
        <el-button type="primary" size="small" @click="handleAddItem">新增明细</el-button>
      </div>
      
      <!-- 回收货物明细 -->
      <el-table :data="contractItems.filter(item => item.recycleGoodId)" border style="margin-bottom: 20px;">
        <el-table-column label="回收货物明细" align="center" header-align="center">
          <el-table-column label="货物名称" prop="recycleGoodName" />
          <el-table-column label="规格型号" prop="recycleGoodSpecificationModel" />
          <el-table-column label="运输模式" prop="recycleGoodTransportMode" />
          <el-table-column label="金额" prop="recycleGoodSubtotal">
            <template slot-scope="scope">
              ¥{{ scope.row.recycleGoodSubtotal || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEditItem(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDeleteItem(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <!-- 租赁设备明细 -->
      <el-table :data="contractItems.filter(item => item.leaseGoodId)" border>
        <el-table-column label="租赁设备明细" align="center" header-align="center">
          <el-table-column label="设备名称" prop="leaseGoodName" />
          <el-table-column label="押金" prop="leaseGoodDeposit">
            <template slot-scope="scope">
              ¥{{ scope.row.leaseGoodDeposit || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="金额" prop="leaseGoodSubtotal">
            <template slot-scope="scope">
              ¥{{ scope.row.leaseGoodSubtotal || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="安装日期" prop="leaseGoodInstallDate" />
          <el-table-column label="操作" width="150" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEditItem(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDeleteItem(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>

      <!-- 新增/编辑明细弹窗 -->
      <el-dialog :title="itemDialogTitle" :visible.sync="itemDialogVisible" width="500px" append-to-body>
        <el-form :model="itemForm" :rules="itemRules" ref="itemForm" label-width="120px">
          <el-form-item label="明细类型" prop="itemType">
            <el-radio-group v-model="itemForm.itemType">
              <el-radio label="RECYCLE">回收货物</el-radio>
              <el-radio label="LEASE">租赁设备</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <!-- 回收货物字段 -->
          <template v-if="itemForm.itemType === 'RECYCLE'">
            <el-form-item label="货物名称" prop="recycleGoodName">
              <el-input v-model="itemForm.recycleGoodName" placeholder="请输入货物名称" />
            </el-form-item>
            <el-form-item label="规格型号" prop="recycleGoodSpecificationModel">
              <el-input v-model="itemForm.recycleGoodSpecificationModel" placeholder="请输入规格型号" />
            </el-form-item>
            <el-form-item label="运输模式" prop="recycleGoodTransportMode">
              <el-select v-model="itemForm.recycleGoodTransportMode" placeholder="请选择运输模式" style="width: 100%;">
                <el-option label="公路运输" value="ROAD" />
                <el-option label="铁路运输" value="RAIL" />
                <el-option label="水路运输" value="WATER" />
                <el-option label="航空运输" value="AIR" />
              </el-select>
            </el-form-item>
            <el-form-item label="金额" prop="recycleGoodSubtotal">
              <el-input-number v-model="itemForm.recycleGoodSubtotal" :precision="2" :step="0.01" style="width: 100%;" />
            </el-form-item>
          </template>

          <!-- 租赁设备字段 -->
          <template v-if="itemForm.itemType === 'LEASE'">
            <el-form-item label="设备名称" prop="leaseGoodName">
              <el-input v-model="itemForm.leaseGoodName" placeholder="请输入设备名称" />
            </el-form-item>
            <el-form-item label="押金" prop="leaseGoodDeposit">
              <el-input-number v-model="itemForm.leaseGoodDeposit" :precision="2" :step="0.01" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="金额" prop="leaseGoodSubtotal">
              <el-input-number v-model="itemForm.leaseGoodSubtotal" :precision="2" :step="0.01" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="安装日期" prop="leaseGoodInstallDate">
              <el-date-picker v-model="itemForm.leaseGoodInstallDate" type="datetime" placeholder="选择安装日期" style="width: 100%;" />
            </el-form-item>
          </template>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="itemDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSaveItem">确 定</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import { getContractPage, addContract, updateContract, deleteContract } from '@/api/contract'

export default {
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        name: '',
        code: '',
        recognitionCode: '',
        type: ''
      },
      dialogVisible: false,
      dialogTitle: '新增合同',
      form: {
        id: null,
        name: '',
        recognitionCode: '',
        code: '',
        type: '',
        startDate: '',
        endDate: '',
        paymentMethod: '',
        invoiceMethod: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      rules: {
        name: [{ required: true, message: '请输入合同名', trigger: 'blur' }],
        recognitionCode: [{ required: true, message: '请输入合同识别号', trigger: 'blur' }],
        code: [
          { required: true, message: '请输入合同编号', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '合同编号只能包含数字和字母', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
        startDate: [{ required: true, message: '请选择起始日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
        paymentMethod: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
        invoiceMethod: [{ required: true, message: '请选择开票方式', trigger: 'change' }]
      },
      // 合同明细相关
      itemsDialogVisible: false,
      contractItems: [],
      currentContractId: null,
      itemDialogVisible: false,
      itemDialogTitle: '新增明细',
      itemForm: {
        id: null,
        contractId: null,
        itemType: 'RECYCLE',
        // 回收货物字段
        recycleGoodId: null,
        recycleGoodName: '',
        recycleGoodSpecificationModel: '',
        recycleGoodTransportMode: '',
        recycleGoodSubtotal: 0,
        // 租赁设备字段
        leaseGoodId: null,
        leaseGoodName: '',
        leaseGoodDeposit: 0,
        leaseGoodSubtotal: 0,
        leaseGoodInstallDate: ''
      },
      itemRules: {
        itemType: [{ required: true, message: '请选择明细类型', trigger: 'change' }],
        recycleGoodName: [{ required: true, message: '请输入货物名称', trigger: 'blur' }],
        leaseGoodName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      const params = {
        name: this.searchForm.name || undefined,
        code: this.searchForm.code || undefined,
        recognitionCode: this.searchForm.recognitionCode || undefined,
        type: this.searchForm.type || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      getContractPage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { name: '', code: '', recognitionCode: '', type: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增合同'
      this.form = {
        id: null,
        name: '',
        recognitionCode: '',
        code: '',
        type: '',
        startDate: '',
        endDate: '',
        paymentMethod: '',
        invoiceMethod: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑合同'
      this.form = { ...row }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该合同吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteContract(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('删除失败')
          })
        })
        .catch(() => {})
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            // 编辑
            updateContract(this.form.id, this.form).then(() => {
              this.$message.success('编辑成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('编辑失败')
            })
          } else {
            // 新增
            addContract(this.form).then(() => {
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.fetchData()
            }).catch(() => {
              this.$message.error('新增失败')
            })
          }
        }
      })
    },
    // 查看合同明细
    handleViewItems(row) {
      this.currentContractId = row.id
      this.itemsDialogVisible = true
      this.fetchContractItems(row.id)
    },
    // 获取合同明细
    fetchContractItems(contractId) {
      // 这里需要调用获取合同明细的API
      // getContractItems(contractId).then(response => {
      //   this.contractItems = response.data || []
      // })
      // 模拟数据
      this.contractItems = [
        {
          id: '1',
          contractId: contractId,
          recycleGoodId: 'rg1',
          recycleGoodName: '废旧钢材',
          recycleGoodSpecificationModel: 'Q235',
          recycleGoodTransportMode: 'ROAD',
          recycleGoodSubtotal: 5000.00
        },
        {
          id: '2',
          contractId: contractId,
          leaseGoodId: 'lg1',
          leaseGoodName: '叉车',
          leaseGoodDeposit: 2000.00,
          leaseGoodSubtotal: 3000.00,
          leaseGoodInstallDate: '2024-01-15 10:00:00'
        }
      ]
    },
    // 新增明细
    handleAddItem() {
      this.itemDialogTitle = '新增明细'
      this.itemForm = {
        id: null,
        contractId: this.currentContractId,
        itemType: 'RECYCLE',
        recycleGoodId: null,
        recycleGoodName: '',
        recycleGoodSpecificationModel: '',
        recycleGoodTransportMode: '',
        recycleGoodSubtotal: 0,
        leaseGoodId: null,
        leaseGoodName: '',
        leaseGoodDeposit: 0,
        leaseGoodSubtotal: 0,
        leaseGoodInstallDate: ''
      }
      this.itemDialogVisible = true
    },
    // 编辑明细
    handleEditItem(row) {
      this.itemDialogTitle = '编辑明细'
      this.itemForm = { ...row }
      this.itemForm.itemType = row.recycleGoodId ? 'RECYCLE' : 'LEASE'
      this.itemDialogVisible = true
    },
    // 删除明细
    handleDeleteItem(row) {
      this.$confirm('确定要删除该明细吗？', '提示', { type: 'warning' })
        .then(() => {
          // 这里需要调用删除明细的API
          // deleteContractItem(row.id).then(() => {
          //   this.$message.success('删除成功')
          //   this.fetchContractItems(this.currentContractId)
          // })
          this.$message.success('删除成功')
          this.contractItems = this.contractItems.filter(item => item.id !== row.id)
        }).catch(() => {})
    },
    // 保存明细
    handleSaveItem() {
      this.$refs.itemForm.validate((valid) => {
        if (valid) {
          if (this.itemForm.id) {
            // 编辑明细
            // updateContractItem(this.itemForm.id, this.itemForm).then(() => {
            //   this.$message.success('编辑成功')
            //   this.itemDialogVisible = false
            //   this.fetchContractItems(this.currentContractId)
            // })
            this.$message.success('编辑成功')
            this.itemDialogVisible = false
            this.fetchContractItems(this.currentContractId)
          } else {
            // 新增明细
            // addContractItem(this.itemForm).then(() => {
            //   this.$message.success('新增成功')
            //   this.itemDialogVisible = false
            //   this.fetchContractItems(this.currentContractId)
            // })
            this.$message.success('新增成功')
            this.itemDialogVisible = false
            this.fetchContractItems(this.currentContractId)
          }
        }
      })
    },
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}
</style>