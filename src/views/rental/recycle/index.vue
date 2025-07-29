<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="订单号">
        <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
      </el-form-item>
      <el-form-item label="合同ID">
        <el-input v-model="searchForm.contractId" placeholder="请输入合同ID" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="待审批" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="margin-top: 20px;"
    >
      <el-table-column label="ID" prop="id" width="200" align="center" />
      <el-table-column label="订单号" prop="orderNo" width="150" align="center" />
      <el-table-column label="合同ID" prop="contractId" width="150" align="center" />
      <el-table-column label="货物图片" width="100" align="center">
        <template slot-scope="scope">
          <img v-if="scope.row.cargoImg" :src="scope.row.cargoImg" alt="货物图片" style="width:60px;height:60px;object-fit:cover;cursor:pointer;" @click="previewImage(scope.row.cargoImg)" />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="运输方式" prop="transportType" width="120" align="center" />
      <el-table-column label="签收图片" width="100" align="center">
        <template slot-scope="scope">
          <img v-if="scope.row.signImg" :src="scope.row.signImg" alt="签收图片" style="width:60px;height:60px;object-fit:cover;cursor:pointer;" @click="previewImage(scope.row.signImg)" />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleDetail(scope.row)">查看详情</el-button>
          <el-button v-if="scope.row.status === 'pending'" size="mini" type="success" @click="handleApprove(scope.row)">审批通过</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
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
    <!-- 详情弹窗 -->
    <el-dialog title="订单详情" :visible.sync="detailVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="合同ID">{{ detailData.contractId }}</el-descriptions-item>
        <el-descriptions-item label="运输方式">{{ detailData.transportType }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailData.status)">
            {{ getStatusText(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px;">
        <div v-if="detailData.cargoImg">
          <h4>货物图片：</h4>
          <img :src="detailData.cargoImg" alt="货物图片" style="width:200px;height:200px;object-fit:cover;" />
        </div>
        <div v-if="detailData.signImg" style="margin-top: 20px;">
          <h4>签收图片：</h4>
          <img :src="detailData.signImg" alt="签收图片" style="width:200px;height:200px;object-fit:cover;" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRecyclePage, getRecycleDetail, deleteRecycle, approveRecycle } from '@/api/recycle'

export default {
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        orderNo: '',
        contractId: '',
        status: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      detailVisible: false,
      detailData: {}
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      const params = {
        orderNo: this.searchForm.orderNo || undefined,
        contractId: this.searchForm.contractId || undefined,
        status: this.searchForm.status || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      getRecyclePage(params).then(response => {
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
      this.searchForm = { orderNo: '', contractId: '', status: '' }
      this.pagination.page = 1
      this.fetchData()
    },
    handleDetail(row) {
      getRecycleDetail(row.id).then(response => {
        this.detailData = response.data
        this.detailVisible = true
      }).catch(() => {
        this.$message.error('获取详情失败')
      })
    },
    handleApprove(row) {
      this.$confirm('确定要审批通过该订单吗？', '提示', { type: 'warning' })
        .then(() => {
          approveRecycle(row.id).then(() => {
            this.$message.success('审批成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('审批失败')
          })
        })
        .catch(() => {})
    },
    handleDelete(row) {
      this.$confirm('确定要删除该订单吗？', '提示', { type: 'warning' })
        .then(() => {
          deleteRecycle(row.id).then(() => {
            this.$message.success('删除成功')
            this.fetchData()
          }).catch(() => {
            this.$message.error('删除失败')
          })
        })
        .catch(() => {})
    },
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },
    previewImage(url) {
      // 可以在这里实现图片预览功能
      window.open(url, '_blank')
    },
    getStatusType(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return statusMap[status] || 'info'
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}
</style> 