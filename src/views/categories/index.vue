<template>
    <div class="categories-management">
        <el-card>
            <div slot="header" class="card-header">
                <span>商品分类管理</span>
                <el-button type="primary" size="mini" @click="handleAdd" style="float: right">
                    <i class="el-icon-plus"></i> 新增分类
                </el-button>
            </div>

            <el-form :inline="true" :model="searchForm" class="demo-form-inline">
                <el-form-item label="分类名称">
                    <el-input v-model="searchForm.name" placeholder="请输入分类名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table v-loading="listLoading" :data="categoryList" style="width: 100%" border>
                <el-table-column prop="name" label="分类名称" width="180"></el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
                <el-table-column label="操作" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" @click="handleEdit(scope.row)"
                            v-hasPermi="['categories:edit']">
                            编辑
                        </el-button>
                        <el-button type="danger" size="mini" @click="handleDelete(scope.row)"
                            v-hasPermi="['categories:delete']">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="total"
                    :page-size.sync="pageSize" :current-page.sync="currentPage" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"></el-pagination>
            </div>
        </el-card>

        <!-- 新增/编辑分类对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
            <el-form :model="categoryForm" :rules="categoryRules" ref="categoryForm">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getCategoriesListPage, saveCategory, deleteCategory, updateCategory } from '@/api/leaseGood'

export default {
    name: 'CategoriesManagement',
    data() {
        return {
            searchForm: {
                name: ''
            },
            categoryList: [],
            total: 0,
            pageSize: 10,
            currentPage: 1,
            listLoading: false,
            dialogVisible: false,
            dialogTitle: '新增分类',
            categoryForm: {
                id: '',
                name: ''
            },
            categoryRules: {
                name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
                ]
            },

        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.listLoading = true
            const params = {
                pageNum: this.currentPage,
                pageSize: this.pageSize,
                name: this.searchForm.name
            }
            getCategoriesListPage(params)
                .then(response => {
                    this.categoryList = response.data.records
                    this.total = response.data.total
                    this.listLoading = false
                })
                .catch(error => {
                    console.error('获取分类列表失败:', error)
                    this.listLoading = false
                })
        },

        handleSearch() {
            this.currentPage = 1
            this.getList()
        },
        resetForm() {
            this.searchForm = {
                name: ''
            }
            this.getList()
        },
        handleAdd() {
            this.dialogTitle = '新增分类'
            this.categoryForm = {
                id: '',
                name: ''
            }
            this.dialogVisible = true
        },
        handleEdit(row) {
            this.dialogTitle = '编辑分类'
            this.categoryForm = {
                id: row.id,
                name: row.name
            }
            this.dialogVisible = true
        },
        submitForm() {
            this.$refs.categoryForm.validate(valid => {
                if (valid) {
                    const formData = {
                        ...this.categoryForm,
                        parentId: 0, // 固定为顶级分类
                        sort: 0, // 默认排序值
                        status: 1 // 默认启用状态
                    }
                    if (this.categoryForm.id) {
                        updateCategory(formData)
                            .then(response => {
                                this.$message.success('操作成功')
                                this.dialogVisible = false
                                this.getList()
                            })
                            .catch(error => {
                                console.error('更新分类失败:', error)
                                this.$message.error('操作失败')
                            })
                    } else {
                        saveCategory(formData)
                            .then(response => {
                                this.$message.success('操作成功')
                                this.dialogVisible = false
                                this.getList()
                            })
                            .catch(error => {
                                console.error('保存分类失败:', error)
                                this.$message.error('操作失败')
                            })
                    }
                }
            })
        },
        handleDelete(row) {
            this.$confirm('确定要删除该分类吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteCategory(row.id)
                    .then(response => {
                        this.$message.success('删除成功')
                        this.getList()
                    })
                    .catch(error => {
                        console.error('删除分类失败:', error)
                        this.$message.error('删除失败')
                    })
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },

        handleSizeChange(size) {
            this.pageSize = size
            this.getList()
        },
        handleCurrentChange(current) {
            this.currentPage = current
            this.getList()
        }
    }
}
</script>

<style scoped>
.categories-management {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>