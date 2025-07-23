<template>
  <div class="system-dict-main">
    <el-row gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="filter-container">
            <el-input v-model="typeSearch" placeholder="搜索类型名称" size="small" @input="fetchTypeList" />
            <el-button type="success" icon="el-icon-plus" size="small" style="margin-top: 10px; width: 100%;" @click="handleAddType">新增类型</el-button>
          </div>
          <el-table
            :data="typeList"
            style="width: 100%; margin-top: 10px;"
            height="500"
            highlight-current-row
            @current-change="handleTypeSelect"
            :row-class-name="typeRowClassName"
            :loading="typeLoading"
            :show-header="false"
          >
            <el-table-column prop="name" label="类型名称" />
            <el-table-column width="60">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click.stop="handleEditType(scope.row)">编辑</el-button>
                <el-button type="text" size="mini" @click.stop="handleDeleteType(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <div class="filter-container">
            <el-input v-model="itemSearch" placeholder="搜索字典项名称" size="small" style="width: 200px; margin-right: 10px;" />
            <el-button type="primary" icon="el-icon-search" size="small" @click="fetchItemList">搜索</el-button>
            <el-button type="success" icon="el-icon-plus" size="small" style="margin-left: 10px;" @click="handleAddItem" :disabled="!currentType">新增字典项</el-button>
          </div>
          <el-table :data="itemList" style="width: 100%; margin-top: 10px;" border :loading="itemLoading">
            <el-table-column prop="label" label="字典项名称" width="180" />
            <el-table-column prop="value" label="字典项值" width="120" />
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="remark" label="备注" />
            <el-table-column label="操作" width="160">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleEditItem(scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" @click="handleDeleteItem(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px; text-align: right;">
            <el-pagination
              background
              layout="total, prev, pager, next, jumper"
              :total="itemTotal"
              :page-size="itemPageSize"
              :current-page.sync="itemPage"
              @current-change="fetchItemList"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 类型新增/编辑弹窗 -->
    <el-dialog :title="typeDialogTitle" :visible.sync="typeDialogVisible">
      <el-form :model="typeForm" label-width="80px">
        <el-form-item label="类型名称">
          <el-input v-model="typeForm.name" />
        </el-form-item>
        <el-form-item label="类型编码">
          <el-input v-model="typeForm.code" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="typeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveType">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 字典项新增/编辑弹窗 -->
    <el-dialog :title="itemDialogTitle" :visible.sync="itemDialogVisible">
      <el-form :model="itemForm" label-width="80px">
        <el-form-item label="字典项名称">
          <el-input v-model="itemForm.label" />
        </el-form-item>
        <el-form-item label="字典项值">
          <el-input v-model="itemForm.value" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="itemForm.sort" type="number" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="itemForm.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="itemDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SystemDictMain',
  data() {
    return {
      // 类型相关
      typeList: [],
      typeSearch: '',
      typeLoading: false,
      typeDialogVisible: false,
      typeDialogTitle: '',
      typeForm: { id: null, name: '', code: '', remark: '' },
      currentType: null,
      // 字典项相关
      itemList: [],
      itemSearch: '',
      itemLoading: false,
      itemDialogVisible: false,
      itemDialogTitle: '',
      itemForm: { id: null, label: '', value: '', sort: 0, remark: '' },
      itemTotal: 0,
      itemPage: 1,
      itemPageSize: 10
    }
  },
  created() {
    this.fetchTypeList()
  },
  methods: {
    // 类型相关
    async fetchTypeList() {
      this.typeLoading = true
      setTimeout(() => {
        this.typeList = [
          { id: 1, name: '性别', code: 'gender', remark: '性别字典' },
          { id: 2, name: '状态', code: 'status', remark: '通用状态' }
        ].filter(t => !this.typeSearch || t.name.includes(this.typeSearch))
        this.typeLoading = false
        if (!this.currentType && this.typeList.length > 0) {
          this.currentType = this.typeList[0]
          this.$nextTick(this.fetchItemList)
        } else if (this.currentType) {
          // 保持选中类型高亮
          const found = this.typeList.find(t => t.id === this.currentType.id)
          if (!found && this.typeList.length > 0) {
            this.currentType = this.typeList[0]
            this.$nextTick(this.fetchItemList)
          }
        }
      }, 300)
    },
    handleTypeSelect(row) {
      this.currentType = row
      this.fetchItemList()
    },
    typeRowClassName({ row }) {
      return this.currentType && row.id === this.currentType.id ? 'current-row' : ''
    },
    handleAddType() {
      this.typeDialogTitle = '新增类型'
      this.typeForm = { id: null, name: '', code: '', remark: '' }
      this.typeDialogVisible = true
    },
    handleEditType(row) {
      this.typeDialogTitle = '编辑类型'
      this.typeForm = { ...row }
      this.typeDialogVisible = true
    },
    handleDeleteType(row) {
      this.$confirm('确定要删除该类型吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('删除成功（模拟）')
        this.fetchTypeList()
      })
    },
    handleSaveType() {
      this.$message.success('保存成功（模拟）')
      this.typeDialogVisible = false
      this.fetchTypeList()
    },
    // 字典项相关
    async fetchItemList() {
      if (!this.currentType) {
        this.itemList = []
        this.itemTotal = 0
        return
      }
      this.itemLoading = true
      setTimeout(() => {
        const all = [
          { id: 1, typeId: 1, label: '男', value: '1', sort: 1, remark: '', typeCode: 'gender' },
          { id: 2, typeId: 1, label: '女', value: '2', sort: 2, remark: '', typeCode: 'gender' },
          { id: 3, typeId: 2, label: '启用', value: '1', sort: 1, remark: '', typeCode: 'status' },
          { id: 4, typeId: 2, label: '禁用', value: '0', sort: 2, remark: '', typeCode: 'status' }
        ]
        let filtered = all.filter(i => i.typeCode === this.currentType.code)
        if (this.itemSearch) {
          filtered = filtered.filter(i => i.label.includes(this.itemSearch))
        }
        this.itemList = filtered
        this.itemTotal = filtered.length
        this.itemLoading = false
      }, 300)
    },
    handleAddItem() {
      this.itemDialogTitle = '新增字典项'
      this.itemForm = { id: null, label: '', value: '', sort: 0, remark: '' }
      this.itemDialogVisible = true
    },
    handleEditItem(row) {
      this.itemDialogTitle = '编辑字典项'
      this.itemForm = { ...row }
      this.itemDialogVisible = true
    },
    handleDeleteItem(row) {
      this.$confirm('确定要删除该字典项吗？', '提示', { type: 'warning' }).then(() => {
        this.$message.success('删除成功（模拟）')
        this.fetchItemList()
      })
    },
    handleSaveItem() {
      this.$message.success('保存成功（模拟）')
      this.itemDialogVisible = false
      this.fetchItemList()
    }
  }
}
</script>

<style scoped>
.system-dict-main {
  padding: 20px;
}
.current-row {
  background: #f5f7fa !important;
}
.filter-container {
  margin-bottom: 10px;
}
</style> 