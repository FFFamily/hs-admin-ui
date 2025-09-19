<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <div class="operation-bar">
      <el-button type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
      <el-table-column label="商品编号" prop="goodNo" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="商品名称" prop="goodName" width="150" align="center" show-overflow-tooltip />
      <el-table-column label="商品类型" prop="goodType" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="商品型号" prop="goodModel" width="120" align="center" show-overflow-tooltip />
      <el-table-column label="总数量" prop="totalQuantity" width="100" align="center">
        <template slot-scope="scope">
          <span class="quantity-text">{{ scope.row.totalQuantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" prop="totalAmount" width="120" align="center">
        <template slot-scope="scope">
          <span class="amount-text">¥{{ formatAmount(scope.row.totalAmount) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination 
      :current-page="pagination.current" 
      :page-sizes="[10, 20, 50, 100]" 
      :page-size="pagination.size"
      :total="pagination.total" 
      layout="total, sizes, prev, pager, next, jumper" 
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" 
      class="pagination" 
    />
  </div>
</template>

<script>
import { getInventoryReportList, exportInventoryReport } from '@/api/inventory'
import { parseTime } from '@/utils'

export default {
  name: 'InventoryReport',
  data() {
    return {
      list: [],
      listLoading: false,
      pagination: {
        current: 1,
        size: 10,
        total: 0
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 获取数据
    fetchData() {
      this.listLoading = true
      const params = {
        current: this.pagination.current,
        size: this.pagination.size
      }

      getInventoryReportList(params).then(response => {
        if (response.code === 200) {
          this.list = response.data.records || []
          this.pagination.total = response.data.total || 0
          this.pagination.current = response.data.current || 1
          this.pagination.size = response.data.size || 10
        } else {
          this.$message.error(response.msg || '获取数据失败')
        }
        this.listLoading = false
      }).catch(error => {
        console.error('获取库存数据失败:', error)
        this.$message.error('获取数据失败')
        this.listLoading = false
      })
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.current = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.current = val
      this.fetchData()
    },

    // 导出数据
    handleExport() {
      this.$confirm('确定要导出库存报表吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.exportData()
      }).catch(() => {
        // 用户取消导出
      })
    },

    // 执行导出
    exportData() {
      exportInventoryReport().then(response => {
        // 创建下载链接
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `库存报表_${new Date().getTime()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出成功')
      }).catch(error => {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请重试')
      })
    },

    // 格式化金额
    formatAmount(amount) {
      const num = Number(amount) || 0
      return num.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .operation-bar {
    margin-bottom: 20px;
    text-align: right;
  }

  .pagination {
    margin-top: 20px;
    text-align: right;
  }

  .quantity-text {
    font-weight: 600;
    color: #409eff;
  }

  .amount-text {
    font-weight: 600;
    color: #67c23a;
  }
}

// 表格样式优化
.el-table {
  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #303133;
      font-weight: 600;
    }
  }
  
  .el-table__body {
    tr:hover {
      background-color: #f5f7fa;
    }
  }
}

// 分页样式
.pagination {
  .el-pagination__total {
    font-weight: 600;
  }
}
</style>
