<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="入库类型">
        <el-select v-model="searchForm.inType" placeholder="请选择入库类型" clearable style="width: 150px;">
          <el-option
            v-for="item in inboundTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
          <el-option
            v-for="item in orderStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="仓库">
        <el-input
          v-model="searchForm.warehouseName"
          placeholder="请选择仓库"
          readonly
          style="width: 200px;"
          @focus="showWarehouseSelector"
        >
          <i slot="suffix" class="el-icon-search el-input__icon" style="cursor: pointer;" @click="showWarehouseSelector" />
        </el-input>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 300px;"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">创建入库单</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column prop="inNo" label="入库单号" width="180" />
      <el-table-column prop="warehouseName" label="仓库" width="150" />
      <el-table-column prop="inType" label="入库类型" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getInboundTypeTag(scope.row.inType)" size="small">
            {{ getInboundTypeText(scope.row.inType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getOrderStatusTag(scope.row.status)" size="small">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sourceOrderNo" label="来源单号" width="180" show-overflow-tooltip />
      <el-table-column prop="totalQuantity" label="总数量" width="100" align="center" />
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <!-- <el-table-column prop="confirmTime" label="确认时间" width="180" /> -->
      <el-table-column label="操作" width="300" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleView(scope.row)">查看</el-button>
          <el-button
            v-if="scope.row.status === 'pending'"
            size="mini"
            type="success"
            @click="handleConfirm(scope.row)"
          >
            确认入库
          </el-button>
          <el-button
            v-if="scope.row.status === 'pending'"
            size="mini"
            type="danger"
            @click="handleCancel(scope.row)"
          >
            取消
          </el-button>
          <el-button
            v-if="scope.row.status === 'cancelled'"
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
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

    <!-- 仓库选择器 -->
    <WarehouseSelector
      :visible.sync="warehouseSelectorVisible"
      title="选择仓库"
      :multiple="false"
      :active-only="true"
      @confirm="handleWarehouseSelected"
    />

    <!-- 经营范围选择器 -->
    <BusinessScopeSelector
      :visible.sync="businessScopeSelectorVisible"
      title="选择货物"
      :multiple="true"
      :only-show-enabled="true"
      @confirm="handleBusinessScopeSelected"
    />

    <!-- 创建入库单对话框 -->
    <el-dialog
      title="创建入库单"
      :visible.sync="createDialogVisible"
      width="900px"
      :before-close="handleDialogClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库" prop="warehouseId">
              <el-input
                v-model="form.warehouseName"
                placeholder="请选择仓库"
                readonly
                @focus="showWarehouseSelectorForForm"
              >
                <i slot="suffix" class="el-icon-search el-input__icon" style="cursor: pointer;" @click="showWarehouseSelectorForForm" />
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入库类型" prop="inType">
              <el-select v-model="form.inType" placeholder="请选择入库类型" style="width: 100%;">
                <el-option
                  v-for="item in inboundTypeOptions"
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
            <el-form-item label="来源单号" prop="sourceOrderNo">
              <el-input v-model="form.sourceOrderNo" placeholder="请输入来源单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源单ID">
              <el-input v-model="form.sourceOrderId" placeholder="请输入来源单ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>

        <el-divider content-position="left">入库明细</el-divider>
        <el-button type="primary" size="small" icon="el-icon-plus" style="margin-bottom: 10px;" @click="showBusinessScopeSelector">
          选择货物
        </el-button>
        <el-table :data="form.items" border style="width: 100%">
          <el-table-column label="货物类型" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.goodType }}</span>
            </template>
          </el-table-column>
          <el-table-column label="货物名称" width="150">
            <template slot-scope="scope">
              <span>{{ scope.row.goodName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="规格型号" width="150">
            <template slot-scope="scope">
              <span>{{ scope.row.goodModel }}</span>
            </template>
          </el-table-column>
          <el-table-column label="货物编号" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.goodNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="入库数量" width="120">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.inQuantity"
                :min="1"
                :precision="0"
                size="small"
                style="width: 100%;"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作"  align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeItem(scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
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
  getInboundPage,
  createInbound,
  confirmInbound,
  cancelInbound,
  deleteInbound
} from '@/api/inventory'
import {
  INBOUND_TYPE_OPTIONS,
  INBOUND_TYPE_MAP,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_MAP
} from '@/constants/inventory'
import WarehouseSelector from '@/components/WarehouseSelector'
import BusinessScopeSelector from '@/components/BusinessScopeSelector'

export default {
  name: 'InboundManagement',
  components: {
    WarehouseSelector,
    BusinessScopeSelector
  },
  data() {
    return {
      loading: false,
      submitLoading: false,
      warehouseSelectorVisible: false,
      businessScopeSelectorVisible: false,
      createDialogVisible: false,
      inboundTypeOptions: INBOUND_TYPE_OPTIONS,
      orderStatusOptions: ORDER_STATUS_OPTIONS,
      dateRange: [],

      // 搜索表单
      searchForm: {
        inType: '',
        status: '',
        warehouseId: '',
        warehouseName: '',
        startTime: '',
        endTime: ''
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
        warehouseId: '',
        warehouseName: '',
        inType: '',
        sourceOrderId: '',
        sourceOrderNo: '',
        remark: '',
        items: []
      },

      // 表单验证规则
      rules: {
        warehouseId: [
          { required: true, message: '请选择仓库', trigger: 'change' }
        ],
        inType: [
          { required: true, message: '请选择入库类型', trigger: 'change' }
        ],
        sourceOrderNo: [
          { required: true, message: '请输入来源单号', trigger: 'blur' }
        ]
      }
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
        if (this.dateRange && this.dateRange.length === 2) {
          params.startTime = this.dateRange[0]
          params.endTime = this.dateRange[1]
        }
        const response = await getInboundPage(params)
        if (response && response.data) {
          this.tableData = response.data.records || []
          this.pagination.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取入库单列表失败:', error)
        this.$message.error('获取入库单列表失败')
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
        inType: '',
        status: '',
        warehouseId: '',
        warehouseName: '',
        startTime: '',
        endTime: ''
      }
      this.dateRange = []
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

    // 显示仓库选择器（搜索用）
    showWarehouseSelector() {
      this.warehouseSelectorVisible = true
    },

    // 显示仓库选择器（表单用）
    showWarehouseSelectorForForm() {
      this.warehouseSelectorVisible = true
    },

    // 仓库选择
    handleWarehouseSelected(warehouses) {
      if (warehouses && warehouses.length > 0) {
        if (this.createDialogVisible) {
          // 表单用
          this.form.warehouseId = warehouses[0].id
          this.form.warehouseName = warehouses[0].warehouseName
        } else {
          // 搜索用
          this.searchForm.warehouseId = warehouses[0].id
          this.searchForm.warehouseName = warehouses[0].warehouseName
        }
      }
    },

    // 新增
    handleAdd() {
      this.resetForm()
      this.createDialogVisible = true
    },

    // 查看
    handleView(row) {
      this.$router.push({
        path: `/inventory/inbound/detail/${row.id}`
      })
    },

    // 确认入库
    handleConfirm(row) {
      this.$confirm('确定要确认入库吗？确认后将自动更新库存。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await confirmInbound(row.id)
          this.$message.success('确认入库成功')
          this.fetchList()
        } catch (error) {
          console.error('确认入库失败:', error)
          this.$message.error('确认入库失败')
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 取消
    handleCancel(row) {
      this.$confirm('确定要取消该入库单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await cancelInbound(row.id)
          this.$message.success('取消成功')
          this.fetchList()
        } catch (error) {
          console.error('取消入库单失败:', error)
          this.$message.error('取消入库单失败')
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该入库单吗？删除后无法恢复。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteInbound(row.id)
          this.$message.success('删除成功')
          this.fetchList()
        } catch (error) {
          console.error('删除入库单失败:', error)
          this.$message.error('删除入库单失败')
        }
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    // 显示经营范围选择器
    showBusinessScopeSelector() {
      this.businessScopeSelectorVisible = true
    },

    // 经营范围选择
    handleBusinessScopeSelected(businessScopes) {
      if (businessScopes && businessScopes.length > 0) {
        businessScopes.forEach(scope => {
          // 检查是否已经存在相同的货物
          const exists = this.form.items.some(item =>
            item.goodType === scope.goodType &&
            item.goodName === scope.goodName &&
            item.goodModel === scope.goodModel
          )
          
          if (!exists) {
            this.form.items.push({
              businessScopeId: scope.id,
              goodNo: scope.no || '',
              goodName: scope.goodName,
              goodType: scope.goodType,
              goodModel: scope.goodModel,
              inQuantity: 1,
              remark: scope.goodRemark || ''
            })
          }
        })
      }
    },

    // 添加明细项（保留用于兼容）
    addItem() {
      this.form.items.push({
        goodNo: '',
        goodName: '',
        goodType: '',
        goodModel: '',
        inQuantity: 1,
        remark: ''
      })
    },

    // 移除明细项
    removeItem(index) {
      this.form.items.splice(index, 1)
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return false
        }

        if (this.form.items.length === 0) {
          this.$message.warning('请至少添加一条入库明细')
          return
        }

        // 验证明细
        for (const item of this.form.items) {
          if (!item.goodNo || !item.goodName || !item.inQuantity) {
            this.$message.warning('请完整填写入库明细信息')
            return
          }
        }

        this.submitLoading = true
        try {
          await createInbound(this.form)
          this.$message.success('创建成功')
          this.createDialogVisible = false
          this.fetchList()
        } catch (error) {
          console.error('创建入库单失败:', error)
          this.$message.error('创建入库单失败')
        } finally {
          this.submitLoading = false
        }
      })
    },

    // 关闭对话框
    handleDialogClose() {
      this.createDialogVisible = false
      this.resetForm()
    },

    // 重置表单
    resetForm() {
      this.form = {
        warehouseId: '',
        warehouseName: '',
        inType: '',
        sourceOrderId: '',
        sourceOrderNo: '',
        remark: '',
        items: []
      }
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },

    // 获取入库类型文本
    getInboundTypeText(type) {
      return INBOUND_TYPE_MAP[type] || type
    },

    // 获取入库类型标签
    getInboundTypeTag(type) {
      const tagMap = {
        purchase: 'success',
        return: 'warning',
        transfer: 'info',
        other: ''
      }
      return tagMap[type] || ''
    },

    // 获取状态文本
    getOrderStatusText(status) {
      return ORDER_STATUS_MAP[status] || status
    },

    // 获取状态标签
    getOrderStatusTag(status) {
      const tagMap = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'info'
      }
      return tagMap[status] || ''
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

