<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="仓库名称">
        <el-input v-model="searchForm.warehouseName" placeholder="请输入仓库名称" clearable style="width: 200px;" />
      </el-form-item>
      <!-- <el-form-item label="仓库编号">
        <el-input v-model="searchForm.warehouseNo" placeholder="请输入仓库编号" clearable style="width: 200px;" />
      </el-form-item> -->
      <!-- <el-form-item label="仓库类型">
        <el-select v-model="searchForm.warehouseType" placeholder="请选择仓库类型" clearable style="width: 150px;">
          <el-option
            v-for="item in warehouseTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
          <el-option label="启用" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增仓库</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="warehouseNo" label="仓库编号" width="150" />
      <el-table-column prop="warehouseName" label="仓库名称" min-width="150" show-overflow-tooltip />
      <!-- <el-table-column prop="warehouseType" label="仓库类型" width="120" align="center"> -->
        <!-- <template slot-scope="scope">
          <el-tag :type="getWarehouseTypeTag(scope.row.warehouseType)" size="small">
            {{ getWarehouseTypeText(scope.row.warehouseType) }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column prop="warehouseAddress" label="仓库地址" min-width="200" show-overflow-tooltip />
      <!-- <el-table-column prop="managerName" label="负责人" width="100" />
      <el-table-column prop="contactPhone" label="联系电话" width="130" />
      <el-table-column prop="status" label="状态" width="100" align="center"> -->
        <!-- <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="active"
            inactive-value="inactive"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column> -->
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="仓库编号" prop="warehouseNo">
          <el-input v-model="form.warehouseNo" placeholder="请输入仓库编号" />
        </el-form-item>
        <el-form-item label="仓库名称" prop="warehouseName">
          <el-input v-model="form.warehouseName" placeholder="请输入仓库名称" />
        </el-form-item>
        <!-- <el-form-item label="仓库类型" prop="warehouseType">
          <el-select v-model="form.warehouseType" placeholder="请选择仓库类型" style="width: 100%;">
            <el-option
              v-for="item in warehouseTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label="仓库地址" prop="warehouseAddress">
          <el-input v-model="form.warehouseAddress" type="textarea" :rows="2" placeholder="请输入仓库地址" />
        </el-form-item>
        <!-- <el-form-item label="负责人ID" prop="managerId">
          <el-input v-model="form.managerId" placeholder="请输入负责人ID" />
        </el-form-item>
        <el-form-item label="负责人姓名" prop="managerName">
          <el-input v-model="form.managerName" placeholder="请输入负责人姓名" />
        </el-form-item> -->
        <!-- <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getWarehousePage,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  updateWarehouseStatus
} from '@/api/inventory'
import { WAREHOUSE_TYPE_OPTIONS, WAREHOUSE_TYPE_MAP } from '@/constants/inventory'

export default {
  name: 'WarehouseManagement',
  data() {
    return {
      loading: false,
      submitLoading: false,
      dialogVisible: false,
      isEdit: false,
      warehouseTypeOptions: WAREHOUSE_TYPE_OPTIONS,

      // 搜索表单
      searchForm: {
        warehouseName: '',
        warehouseNo: '',
        warehouseType: '',
        status: ''
      },

      // 表格数据
      tableData: [],

      // 分页
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },

      // 表单数据
      form: {
        id: '',
        warehouseNo: '',
        warehouseName: '',
        warehouseAddress: '',
        warehouseType: '',
        managerId: '',
        managerName: '',
        contactPhone: '',
        status: 'active',
        remark: ''
      },

      // 表单验证规则
      rules: {
        warehouseNo: [
          { required: true, message: '请输入仓库编号', trigger: 'blur' }
        ],
        warehouseName: [
          { required: true, message: '请输入仓库名称', trigger: 'blur' }
        ],
        warehouseType: [
          { required: true, message: '请选择仓库类型', trigger: 'change' }
        ],
        warehouseAddress: [
          { required: true, message: '请输入仓库地址', trigger: 'blur' }
        ],
        contactPhone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑仓库' : '新增仓库'
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
        const response = await getWarehousePage(params)
        if (response && response.data) {
          this.tableData = response.data.records || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取仓库列表失败:', error)
        this.$message.error('获取仓库列表失败')
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
        warehouseName: '',
        warehouseNo: '',
        warehouseType: '',
        status: ''
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

    // 新增
    handleAdd() {
      this.isEdit = false
      this.resetForm()
      this.dialogVisible = true
    },

    // 编辑
    handleEdit(row) {
      this.isEdit = true
      this.form = { ...row }
      this.dialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该仓库吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteWarehouse(row.id)
          this.$message.success('删除成功')
          this.fetchList()
        } catch (error) {
          console.error('删除仓库失败:', error)
          this.$message.error('删除仓库失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 状态改变
    async handleStatusChange(row) {
      try {
        await updateWarehouseStatus({
          id: row.id,
          status: row.status
        })
        this.$message.success('状态更新成功')
        this.fetchList()
      } catch (error) {
        console.error('更新状态失败:', error)
        this.$message.error('更新状态失败')
        // 恢复原状态
        row.status = row.status === 'active' ? 'inactive' : 'active'
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
            await updateWarehouse(this.form)
            this.$message.success('更新成功')
          } else {
            await createWarehouse(this.form)
            this.$message.success('创建成功')
          }
          this.dialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('提交失败:', error)
          this.$message.error(this.isEdit ? '更新失败' : '创建失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.dialogVisible = false
      this.resetForm()
    },

    // 重置表单
    resetForm() {
      this.form = {
        id: '',
        warehouseNo: '',
        warehouseName: '',
        warehouseAddress: '',
        warehouseType: '',
        managerId: '',
        managerName: '',
        contactPhone: '',
        status: 'active',
        remark: ''
      }
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },

    // 获取仓库类型文本
    getWarehouseTypeText(type) {
      return WAREHOUSE_TYPE_MAP[type] || type
    },

    // 获取仓库类型标签类型
    getWarehouseTypeTag(type) {
      const tagMap = {
        raw_material: 'warning',
        finished_product: 'success',
        transfer: 'info'
      }
      return tagMap[type] || ''
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

