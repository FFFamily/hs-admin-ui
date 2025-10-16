<template>
  <div class="system-dict-container">
    <el-card class="page-card">
      <div slot="header" class="card-header">
        <span class="card-title">
          <i class="el-icon-s-grid"></i>
          字典管理
        </span>
        <span class="card-subtitle">统一管理系统字典数据</span>
      </div>

      <el-row :gutter="20" class="dict-content">
        <!-- 左侧：字典类型列表 -->
        <el-col :span="6">
          <el-card shadow="never" class="type-card">
            <div slot="header" class="type-header">
              <span>字典类型</span>
              <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAddType">
                新增
              </el-button>
            </div>

            <div class="filter-container">
              <el-input
                v-model="typeSearch"
                placeholder="搜索类型名称或编码"
                size="small"
                prefix-icon="el-icon-search"
                clearable
                @input="handleTypeSearch"
              />
            </div>

            <el-table
              v-loading="typeLoading"
              :data="displayTypeList"
              style="width: 100%; margin-top: 10px;"
              height="calc(100vh - 320px)"
              highlight-current-row
              @current-change="handleTypeSelect"
              :row-class-name="typeRowClassName"
            >
              <el-table-column prop="dictName" label="类型名称" show-overflow-tooltip>
                <template slot-scope="scope">
                  <div class="type-item">
                    <span class="type-name">{{ scope.row.dictName }}</span>
                    <span class="type-code">{{ scope.row.dictType }}</span>
                    <el-tag v-if="scope.row.status === 0" type="info" size="mini" style="margin-left: 8px;">禁用</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="80" align="center">
                <template slot-scope="scope">
                  <el-dropdown trigger="click" @command="(command) => handleTypeCommand(command, scope.row)">
                    <span class="el-dropdown-link">
                      <i class="el-icon-more"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="edit" icon="el-icon-edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="delete" icon="el-icon-delete" style="color: #F56C6C;">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- 右侧：字典项列表 -->
        <el-col :span="18">
          <el-card shadow="never" class="item-card">
            <div slot="header" class="item-header">
              <span v-if="currentType">
                字典项列表
                <el-tag size="mini" type="primary" style="margin-left: 10px;">
                  {{ currentType.dictName }}
                </el-tag>
              </span>
              <span v-else>请先选择字典类型</span>
            </div>

            <div class="filter-container">
              <el-input
                v-model="itemSearch"
                placeholder="搜索字典标签或键值"
                size="small"
                style="width: 250px; margin-right: 10px;"
                prefix-icon="el-icon-search"
                clearable
              />
              <el-button type="primary" icon="el-icon-search" size="small" @click="fetchItemList">
                搜索
              </el-button>
              <el-button
                type="success"
                icon="el-icon-plus"
                size="small"
                style="margin-left: 10px;"
                @click="handleAddItem"
                :disabled="!currentType"
              >
                新增字典项
              </el-button>
            </div>

            <el-table
              v-loading="itemLoading"
              :data="itemList"
              style="width: 100%; margin-top: 15px;"
              border
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="dictLabel" label="字典标签" width="150" show-overflow-tooltip />
              <el-table-column prop="dictValue" label="字典键值" width="150" show-overflow-tooltip />
              <el-table-column prop="dictSort" label="排序" width="80" align="center">
                <template slot-scope="scope">
                  <el-tag size="small">{{ scope.row.dictSort }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
                    {{ scope.row.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="isDefault" label="默认" width="80" align="center">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.isDefault === '1'" type="warning" size="small">是</el-tag>
                  <span v-else style="color: #909399;">否</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span style="color: #909399;">{{ scope.row.remark || '--' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="160" show-overflow-tooltip>
                <template slot-scope="scope">
                  {{ formatDateTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center" fixed="right">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEditItem(scope.row)">
                    编辑
                  </el-button>
                  <el-button size="mini" type="text" icon="el-icon-delete" style="color: #F56C6C;" @click="handleDeleteItem(scope.row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="itemTotal"
                :page-size="itemPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :current-page.sync="itemPage"
                @size-change="handleItemSizeChange"
                @current-change="fetchItemList"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 类型新增/编辑弹窗 -->
    <el-dialog
      :title="typeDialogTitle"
      :visible.sync="typeDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="typeForm" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="请输入字典名称，如：性别、状态" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input
            v-model="typeForm.dictType"
            placeholder="请输入字典类型，如：gender、status"
            :disabled="!!typeForm.id"
          >
            <template slot="append">
              <el-tooltip content="字典类型创建后不可修改" placement="top">
                <i class="el-icon-info"></i>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="typeForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="typeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="typeDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="typeSaving" @click="handleSaveType">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 字典项新增/编辑弹窗 -->
    <el-dialog
      :title="itemDialogTitle"
      :visible.sync="itemDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="itemForm" :model="itemForm" :rules="itemRules" label-width="100px">
        <el-form-item label="所属类型">
          <el-tag type="primary">{{ currentType ? currentType.dictName : '' }}</el-tag>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="itemForm.dictLabel" placeholder="请输入字典标签，如：男、女" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="itemForm.dictValue" placeholder="请输入字典键值，如：1、0" />
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number
            v-model="itemForm.dictSort"
            :min="0"
            :max="9999"
            controls-position="right"
            style="width: 100%;"
          />
          <div class="form-tip">数值越小越靠前</div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="itemForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-radio-group v-model="itemForm.isDefault">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="itemForm.cssClass" placeholder="CSS样式类名" />
          <div class="form-tip">用于前端样式扩展</div>
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="itemForm.listClass" placeholder="请选择" style="width: 100%;" clearable>
            <el-option label="默认" value="default" />
            <el-option label="主要" value="primary" />
            <el-option label="成功" value="success" />
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="危险" value="danger" />
          </el-select>
          <div class="form-tip">表格回显的样式类型</div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="itemForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="itemDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="itemSaving" @click="handleSaveItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getDictTypeList,
  createDictType,
  updateDictType,
  deleteDictType,
  getDictItemPage,
  createDictItem,
  updateDictItem,
  deleteDictItem
} from '@/api/dict'
import { parseTime } from '@/utils'

export default {
  name: 'SystemDictMain',
  data() {
    return {
      // 类型相关
      typeList: [],
      displayTypeList: [],
      typeSearch: '',
      typeLoading: false,
      typeDialogVisible: false,
      typeDialogTitle: '',
      typeSaving: false,
      typeForm: {
        id: null,
        dictName: '',
        dictType: '',
        status: 1,
        remark: ''
      },
      typeRules: {
        dictName: [
          { required: true, message: '请输入字典名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        dictType: [
          { required: true, message: '请输入字典类型', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '只能包含字母、数字和下划线，且必须以字母开头', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      currentType: null,

      // 字典项相关
      itemList: [],
      itemSearch: '',
      itemLoading: false,
      itemDialogVisible: false,
      itemDialogTitle: '',
      itemSaving: false,
      itemForm: {
        id: null,
        dictSort: 0,
        dictLabel: '',
        dictValue: '',
        dictType: '',
        cssClass: '',
        listClass: '',
        isDefault: '0',
        status: 1,
        remark: ''
      },
      itemRules: {
        dictLabel: [
          { required: true, message: '请输入字典标签', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '请输入字典键值', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '请输入排序值', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        isDefault: [
          { required: true, message: '请选择是否默认', trigger: 'change' }
        ]
      },
      itemTotal: 0,
      itemPage: 1,
      itemPageSize: 10
    }
  },
  created() {
    this.fetchTypeList()
  },
  methods: {
    // ==================== 字典类型相关 ====================
    async fetchTypeList() {
      this.typeLoading = true
      try {
        const res = await getDictTypeList()
        if (res.code === 200 || res.code === 0) {
          this.typeList = res.data || []
          this.handleTypeSearch()
          
          // 自动选中第一个类型
          if (!this.currentType && this.displayTypeList.length > 0) {
            this.currentType = this.displayTypeList[0]
            this.$nextTick(() => {
              this.fetchItemList()
            })
          } else if (this.currentType) {
            // 保持当前选中
            const found = this.typeList.find(t => t.id === this.currentType.id)
            if (found) {
              this.currentType = found
            } else if (this.displayTypeList.length > 0) {
              this.currentType = this.displayTypeList[0]
              this.$nextTick(() => {
                this.fetchItemList()
              })
            }
          }
        }
      } catch (error) {
        console.error('获取字典类型列表失败:', error)
        this.$message.error('获取字典类型列表失败')
      } finally {
        this.typeLoading = false
      }
    },

    handleTypeSearch() {
      if (!this.typeSearch) {
        this.displayTypeList = [...this.typeList]
      } else {
        const keyword = this.typeSearch.toLowerCase()
        this.displayTypeList = this.typeList.filter(t =>
          t.dictName.toLowerCase().includes(keyword) ||
          t.dictType.toLowerCase().includes(keyword)
        )
      }
    },

    handleTypeSelect(row) {
      if (row) {
        this.currentType = row
        this.itemPage = 1
        this.fetchItemList()
      }
    },

    typeRowClassName({ row }) {
      return this.currentType && row.id === this.currentType.id ? 'current-row' : ''
    },

    handleAddType() {
      this.typeDialogTitle = '新增字典类型'
      this.typeForm = {
        id: null,
        dictName: '',
        dictType: '',
        status: 1,
        remark: ''
      }
      this.typeDialogVisible = true
      this.$nextTick(() => {
        this.$refs.typeForm && this.$refs.typeForm.clearValidate()
      })
    },

    handleTypeCommand(command, row) {
      if (command === 'edit') {
        this.handleEditType(row)
      } else if (command === 'delete') {
        this.handleDeleteType(row)
      }
    },

    handleEditType(row) {
      this.typeDialogTitle = '编辑字典类型'
      this.typeForm = { ...row }
      this.typeDialogVisible = true
      this.$nextTick(() => {
        this.$refs.typeForm && this.$refs.typeForm.clearValidate()
      })
    },

    handleDeleteType(row) {
      this.$confirm(`确定要删除字典类型"${row.dictName}"吗？删除后其下的所有字典项也将被删除！`, '警告', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }).then(async() => {
        try {
          const res = await deleteDictType(row.id)
          if (res.code === 200 || res.code === 0) {
            this.$message.success('删除成功')
            if (this.currentType && this.currentType.id === row.id) {
              this.currentType = null
              this.itemList = []
            }
            this.fetchTypeList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除字典类型失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    handleSaveType() {
      this.$refs.typeForm.validate(async(valid) => {
        if (!valid) return

        this.typeSaving = true
        try {
          const isEdit = !!this.typeForm.id
          const api = isEdit ? updateDictType : createDictType
          const res = await api(this.typeForm)

          if (res.code === 200 || res.code === 0) {
            this.$message.success(isEdit ? '更新成功' : '创建成功')
            this.typeDialogVisible = false
            this.fetchTypeList()
          } else {
            this.$message.error(res.message || (isEdit ? '更新失败' : '创建失败'))
          }
        } catch (error) {
          console.error('保存字典类型失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.typeSaving = false
        }
      })
    },

    // ==================== 字典项相关 ====================
    async fetchItemList() {
      if (!this.currentType) {
        this.itemList = []
        this.itemTotal = 0
        return
      }

      this.itemLoading = true
      try {
        const params = {
          dictType: this.currentType.dictType,
          dictLabel: this.itemSearch || undefined,
          page: this.itemPage,
          pageSize: this.itemPageSize
        }

        const res = await getDictItemPage(params)
        if (res.code === 200 || res.code === 0) {
          this.itemList = res.data.records || res.data.list || []
          this.itemTotal = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取字典项列表失败')
        }
      } catch (error) {
        console.error('获取字典项列表失败:', error)
        this.$message.error('获取字典项列表失败')
      } finally {
        this.itemLoading = false
      }
    },

    handleItemSizeChange(size) {
      this.itemPageSize = size
      this.itemPage = 1
      this.fetchItemList()
    },

    handleAddItem() {
      if (!this.currentType) {
        this.$message.warning('请先选择字典类型')
        return
      }

      this.itemDialogTitle = '新增字典项'
      this.itemForm = {
        id: null,
        dictSort: 0,
        dictLabel: '',
        dictValue: '',
        dictType: this.currentType.dictType,
        cssClass: '',
        listClass: '',
        isDefault: '0',
        status: 1,
        remark: ''
      }
      this.itemDialogVisible = true
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate()
      })
    },

    handleEditItem(row) {
      this.itemDialogTitle = '编辑字典项'
      this.itemForm = { ...row }
      this.itemDialogVisible = true
      this.$nextTick(() => {
        this.$refs.itemForm && this.$refs.itemForm.clearValidate()
      })
    },

    handleDeleteItem(row) {
      this.$confirm(`确定要删除字典项"${row.dictLabel}"吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async() => {
        try {
          const res = await deleteDictItem(row.id)
          if (res.code === 200 || res.code === 0) {
            this.$message.success('删除成功')
            this.fetchItemList()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除字典项失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },

    handleSaveItem() {
      this.$refs.itemForm.validate(async(valid) => {
        if (!valid) return

        this.itemSaving = true
        try {
          const isEdit = !!this.itemForm.id
          const api = isEdit ? updateDictItem : createDictItem
          const data = {
            ...this.itemForm,
            dictType: this.currentType.dictType
          }
          const res = await api(data)

          if (res.code === 200 || res.code === 0) {
            this.$message.success(isEdit ? '更新成功' : '创建成功')
            this.itemDialogVisible = false
            this.fetchItemList()
          } else {
            this.$message.error(res.message || (isEdit ? '更新失败' : '创建失败'))
          }
        } catch (error) {
          console.error('保存字典项失败:', error)
          this.$message.error('保存失败')
        } finally {
          this.itemSaving = false
        }
      })
    },

    // ==================== 工具方法 ====================
    formatDateTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '--'
    }
  }
}
</script>

<style lang="scss" scoped>
.system-dict-container {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);

  .page-card {
    border-radius: 8px;

    .card-header {
      display: flex;
      flex-direction: column;

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;

        i {
          margin-right: 8px;
          color: #409EFF;
        }
      }

      .card-subtitle {
        font-size: 13px;
        color: #909399;
        margin-top: 5px;
      }
    }
  }

  .dict-content {
    min-height: calc(100vh - 200px);
  }

  .type-card,
  .item-card {
    border-radius: 6px;

    ::v-deep .el-card__header {
      padding: 15px 20px;
      background: #fafafa;
      border-bottom: 1px solid #e4e7ed;
    }

    .type-header,
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #303133;
    }
  }

  .filter-container {
    margin-bottom: 0;
  }

  .type-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .type-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    .type-code {
      font-size: 12px;
      color: #909399;
      font-family: 'Courier New', monospace;
    }
  }

  .el-dropdown-link {
    cursor: pointer;
    font-size: 18px;
    color: #606266;

    &:hover {
      color: #409EFF;
    }
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.5;
  }

  ::v-deep .current-row {
    background: #ecf5ff !important;

    &:hover > td {
      background: #ecf5ff !important;
    }
  }

  ::v-deep .el-table {
    font-size: 13px;
  }

  ::v-deep .el-dialog__header {
    background: #f5f7fa;
    padding: 15px 20px;
    border-bottom: 1px solid #e4e7ed;
  }

  ::v-deep .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
  }

  ::v-deep .el-form-item__label {
    font-weight: 500;
  }
}
</style>


