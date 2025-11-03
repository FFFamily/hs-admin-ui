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
      <el-table-column prop="status" label="订单状态" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contractNo" label="合同编号" width="150" />
      <el-table-column prop="contractName" label="合同名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="processorName" label="经办人" width="120" />
      <el-table-column label="操作" width="330" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            v-if="scope.row.stage === 'purchase'"
            size="mini"
            type="success"
            @click="handleRegisterPurchase(scope.row)"
          >登记采购信息</el-button>
          <el-button
            v-if="scope.row.stage === 'transport'"
            size="mini"
            type="success"
            @click="handleRegisterTransport(scope.row)"
          >登记运输信息</el-button>
          <el-button
            v-if="scope.row.stage === 'processing'"
            size="mini"
            type="success"
            @click="handleRegisterProcessing(scope.row)"
          >登记加工信息</el-button>
          <el-button
            v-if="scope.row.stage === 'warehousing'"
            size="mini"
            type="success"
            @click="handleRegisterWarehousing(scope.row)"
          >登记入库信息</el-button>
          <el-button size="mini" type="warning" @click="handleSettle(scope.row)">结算</el-button>
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

  </div>
</template>

<script>
import { getUserOrderListPage, deleteUserOrder, getRecycleOrderByParentId, settleUserOrder } from '@/api/userOrder'
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
      statusOptions: USER_ORDER_STATUS_OPTIONS
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

    // 登记采购信息
    handleRegisterPurchase(row) {
      // 直接跳转，在目标页面查询数据
      this.$router.push({
        name: 'UserOrderPurchase',
        query: { id: row.id }
      })
    },

    // 登记运输信息
    handleRegisterTransport(row) {
      this.$router.push({
        name: 'UserOrderTransport',
        query: { id: row.id }
      })
    },

    // 登记加工信息
    handleRegisterProcessing(row) {
      this.$router.push({
        name: 'UserOrderProcessing',
        query: { id: row.id }
      })
    },

    // 登记入库信息
    handleRegisterWarehousing(row) {
      this.$router.push({
        name: 'UserOrderWarehousing',
        query: { id: row.id }
      })
    },

    // 结算订单
    async handleSettle(row) {
      try {
        await this.$confirm('确定要结算该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await settleUserOrder(row.id)
        this.$message.success('结算成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('结算订单失败:', error)
          this.$message.error('结算订单失败')
        }
      }
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
