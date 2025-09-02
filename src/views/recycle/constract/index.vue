<template>
    <div class="app-container">
        <!-- 搜索表单 -->
        <el-form :inline="true" :model="searchForm" class="search-form" @submit.native.prevent>
            <el-form-item label="合同名称：">
                <el-input v-model="searchForm.name" placeholder="请输入合同名称" clearable />
            </el-form-item>
            <el-form-item label="合同编号：">
                <el-input v-model="searchForm.no" placeholder="请输入合同编号" clearable />
            </el-form-item>
            <el-form-item label="合同类型：">
                <el-select v-model="searchForm.type" placeholder="请选择合同类型" clearable>
                    <el-option 
                        v-for="option in contractTypeOptions" 
                        :key="option.value" 
                        :label="option.label" 
                        :value="option.value" 
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="合作方：">
                <el-input v-model="searchForm.partnerName" placeholder="请选择合作方" readonly @click="showSearchPartnerSelector">
                    <el-button slot="append" icon="el-icon-search" @click="showSearchPartnerSelector"></el-button>
                </el-input>
            </el-form-item>
            <el-form-item label="状态：">
                <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                    <el-option label="未开始" value="not_started" />
                    <el-option label="进行中" value="in_progress" />
                    <el-option label="已结束" value="ended" />
                    <el-option label="已过期" value="expired" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
                    新增合同
                </el-button>
            </el-form-item>
        </el-form>

        <!-- 数据表格 -->

        <el-table v-loading="listLoading" :data="list" border fit highlight-current-row>
            <el-table-column label="合同名称" prop="name" width="200" align="center" show-overflow-tooltip />

            <el-table-column label="合同类型" prop="type" width="120" align="center">
                <template slot-scope="scope">
                    {{ getContractTypeText(scope.row.type) }}
                </template>
            </el-table-column>
            <el-table-column label="合作方" prop="partnerName" width="150" align="center" show-overflow-tooltip />
            <el-table-column label="状态" prop="status" width="120" align="center" show-overflow-tooltip>
                <template slot-scope="scope">
                    <el-tag :type="getStatusType(scope.row.startTime, scope.row.endTime)" size="medium">
                        {{ getStatusText(scope.row.startTime, scope.row.endTime) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="起始时间" prop="startTime" width="120" align="center">
                <template slot-scope="scope">
                    {{ formatDate(scope.row.startTime) }}
                </template>
            </el-table-column>
            <el-table-column label="结束时间" prop="endTime" width="120" align="center">
                <template slot-scope="scope">
                    {{ formatDate(scope.row.endTime) }}
                </template>
            </el-table-column>
            <el-table-column label="合同总金额" prop="totalAmount" width="150" align="center">
                <template slot-scope="scope">
                    <span class="amount-text">¥{{ formatAmount(scope.row.totalAmount) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" prop="createTime" width="180" align="center" sortable="custom">
                <template slot-scope="scope">
                    {{ formatDateTime(scope.row.createTime) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" fixed="right">
                <template slot-scope="scope">
                    <el-button size="mini" type="warning" icon="el-icon-edit" @click="handleEdit(scope.row)">
                       
                    </el-button>
                    <el-button size="mini" type="info" icon="el-icon-document" @click="handleViewItems(scope.row)">
                        货物明细
                    </el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)">
                        
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination v-show="total > 0" :current-page="listQuery.pageNum" :page-sizes="[10, 20, 50, 100]"
            :page-size="listQuery.pageSize" :total="total" layout="total, sizes, prev, pager, next, jumper"
            class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" />


        <!-- 新增/编辑对话框 -->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="900px" :close-on-click-modal="false"
            @close="handleDialogClose">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-row :gutter="20">
                    <!-- 合同信息分组 -->
                    <el-divider content-position="center">合同信息</el-divider>
                    <el-col :span="8">
                        <el-form-item label="合同名称" prop="name">
                            <el-input v-model="form.name" placeholder="请输入合同名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="合同编号" prop="no">
                            <el-input v-model="form.no" placeholder="请输入合同编号" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="合同类型" prop="type">
                            <el-select v-model="form.type" placeholder="请选择合同类型" style="width: 100%;">
                                <el-option 
                                    v-for="option in contractTypeOptions" 
                                    :key="option.value" 
                                    :label="option.label" 
                                    :value="option.value" 
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="起始时间" prop="startTime">
                            <el-date-picker v-model="form.startTime" type="date" placeholder="选择起始时间"
                                format="yyyy年MM月dd日" value-format="yyyy-MM-dd" style="width: 100%;"
                                :picker-options="pickerOptions" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="结束时间" prop="endTime">
                            <el-date-picker v-model="form.endTime" type="date" placeholder="选择结束时间" format="yyyy年MM月dd日"
                                value-format="yyyy-MM-dd" style="width: 100%;" :picker-options="pickerOptions" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">

                    <el-col :span="12">
                        <el-form-item label="合同总金额" prop="totalAmount">
                            <el-input-number disabled v-model="form.totalAmount" :precision="2" :step="100" :min="0"
                                placeholder="请输入金额" style="width: 100%;" controls-position="right" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="合同文件" prop="file">
                            <FileUploader
                                v-model="form.filePath"
                                :multiple="false"
                                :limit="1"
                                accept=".pdf"
                                :max-size-mb="20"
                                :button-mode="true"
                                tips="仅支持PDF格式，文件大小不超过20MB"
                                @preview="handleFilePreview"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-divider content-position="center">合作方信息</el-divider>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="甲方" prop="partyA">
                            <el-input v-model="form.partyAName" placeholder="请选择甲方" readonly
                                @click="showPartyASelector">
                                <el-button slot="append" icon="el-icon-search" @click="showPartyASelector"></el-button>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="乙方" prop="partyB">
                            <el-input v-model="form.partyBName" placeholder="请选择乙方" readonly
                                @click="showPartyBSelector">
                                <el-button slot="append" icon="el-icon-search" @click="showPartyBSelector"></el-button>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="合作方" prop="partner">
                            <el-select 
                                v-model="form.partner" 
                                placeholder="请从甲方或乙方中选择合作方" 
                                style="width: 100%;"
                                :disabled="!form.partyA && !form.partyB"
                                @change="handlePartnerChange"
                            >
                                <el-option 
                                    v-if="form.partyA" 
                                    :label="`甲方：${form.partyAName}`" 
                                    :value="form.partyA"
                                />
                                <el-option 
                                    v-if="form.partyB" 
                                    :label="`乙方：${form.partyBName}`" 
                                    :value="form.partyB"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="主银行卡号" prop="mainBankCard">
                            <el-input :value="getMainBankCardDisplayValue()" placeholder="请选1择银行卡号" readonly
                                @click="showMainBankCardSelector">
                                <el-button slot="append" icon="el-icon-search" @click="showMainBankCardSelector"></el-button>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="主开票信息" prop="mainInvoice">
                            <el-input v-model="form.mainInvoice" type="textarea" :rows="3" placeholder="请输入开票信息" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
            </div>
        </el-dialog>

        <!-- 货物明细对话框 -->
        <el-dialog title="货物明细" :visible.sync="itemsDialogVisible" width="80%" :close-on-click-modal="false" @close="handleItemsDialogClose">
            <div class="items-header">
                <h4>合同：{{ currentContract && currentContract.name ? currentContract.name : '--' }}</h4>
                <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAddItem">
                    选择经营范围
                </el-button>
            </div>

            <el-table :data="contractItems" border fit show-summary :summary-method="getSummaries">
                <el-table-column label="经营范围编号" prop="goodNo" width="150" align="center" />
                <el-table-column label="货物分类" prop="goodType" width="120" align="center" />
                <el-table-column label="货物名称" prop="goodName" width="200" align="center" show-overflow-tooltip />
                <el-table-column label="货物型号" prop="goodModel" width="150" align="center" />
                <el-table-column label="货物数量" prop="goodCount" width="100" align="center" />
                <el-table-column label="货物单价" prop="goodPrice" width="120" align="center">
                    <template slot-scope="scope">
                        <span class="amount-text">¥{{ formatAmount(scope.row.goodPrice) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="货物总价" prop="goodTotalPrice" width="120" align="center">
                    <template slot-scope="scope">
                        <span class="amount-text">¥{{ formatAmount(scope.row.goodTotalPrice) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="货物备注" prop="goodRemark" width="200" align="center" show-overflow-tooltip />
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button size="mini" type="warning" icon="el-icon-edit" @click="handleEditItem(scope.row)">
                            
                        </el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDeleteItem(scope.row)">
                            
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 货物明细新增/编辑对话框 -->
            <el-dialog :title="itemDialogTitle" :visible.sync="itemDialogVisible" width="600px" append-to-body
                :close-on-click-modal="false">
                <el-form ref="itemForm" :model="itemForm" :rules="itemRules" label-width="100px">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="经营范围编号" prop="goodNo">
                                <el-input disabled v-model="itemForm.goodNo" placeholder="经营范围编号" readonly />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="货物分类" prop="goodType">
                                <el-input disabled v-model="itemForm.goodType" placeholder="货物分类" readonly />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="货物名称" prop="goodName">
                                <el-input disabled v-model="itemForm.goodName" placeholder="货物名称" readonly />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="货物型号" prop="goodModel">
                                <el-input disabled v-model="itemForm.goodModel" placeholder="货物型号" readonly />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="货物数量" prop="goodCount">
                                <el-input-number v-model="itemForm.goodCount" :min="1" placeholder="请输入数量"
                                    style="width: 100%;" @change="calculateTotalPrice" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="货物单价" prop="goodPrice">
                                <el-input-number v-model="itemForm.goodPrice" :precision="2" :min="0" :max="999999.99"
                                    :step="0.01" placeholder="请输入单价" style="width: 100%;" controls-position="right" @change="calculateTotalPrice" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="货物总价" prop="goodTotalPrice">
                                <el-input v-model="itemForm.goodTotalPrice" placeholder="货物总价" readonly>
                                    <template slot="prepend">
                                        <span class="amount-text">¥</span>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="货物备注" prop="goodRemark">
                        <el-input v-model="itemForm.goodRemark" type="textarea" :rows="3" placeholder="请输入货物备注" />
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="itemDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleItemSubmit" :loading="itemSubmitLoading">确定</el-button>
                </div>
            </el-dialog>
        </el-dialog>

        <!-- 甲方选择器 -->
        <UserSelector :visible.sync="partyASelectorVisible" title="选择甲方" :multiple="false"
            @confirm="handlePartyAConfirm" @close="handlePartyAClose" />

        <!-- 乙方选择器 -->
        <UserSelector :visible.sync="partyBSelectorVisible" title="选择乙方" :multiple="false"
            @confirm="handlePartyBConfirm" @close="handlePartyBClose" />

        <!-- 经营范围选择器 -->
        <BusinessScopeSelector 
            :visible.sync="businessScopeSelectorVisible" 
            title="选择经营范围" 
            :multiple="false"
            :only-show-enabled="true"
            @confirm="handleBusinessScopeConfirm" 
            @close="handleBusinessScopeClose" 
        />

        <!-- 主银行卡号选择器 -->
        <BankInfoSelector 
            :visible.sync="mainBankCardSelectorVisible" 
            title="选择主银行卡号" 
            :multiple="false"
            :filter-account-id="form.partner"
            @confirm="handleMainBankCardConfirm" 
            @close="handleMainBankCardClose" 
        />

        <!-- 搜索合作方选择器 -->
        <UserSelector 
            :visible.sync="searchPartnerSelectorVisible" 
            title="选择合作方" 
            :multiple="false"
            @confirm="handleSearchPartnerConfirm" 
            @close="handleSearchPartnerClose" 
        />
    </div>
</template>

<script>
import { parseTime } from '@/utils'
import UserSelector from '@/components/UserSelector'
import FileUploader from '@/components/FileUploader'
import BusinessScopeSelector from '@/components/BusinessScopeSelector'
import BankInfoSelector from '@/components/BankInfoSelector'
import { CONTRACT_TYPE_OPTIONS, getContractTypeText, getContractTypeTagType } from '@/constants/contractTypes'
import { getStatusText, getStatusType } from '@/constants/constract'
import {
    getRecycleContractPage,
    createRecycleContract,
    updateRecycleContract,
    deleteRecycleContract,
    getContractItems,
    createContractItem,
    updateContractItem,
    deleteContractItem,
    exportRecycleContract
} from '@/api/recycleContract'

export default {
    name: 'ContractRecycle',
    components: {
        UserSelector,
        FileUploader,
        BusinessScopeSelector,
        BankInfoSelector
    },
    data() {
        return {
            getContractTypeTagType,
            getContractTypeText,
            getStatusText,
            getStatusType,
            // 搜索表单
            searchForm: {
                name: '',
                type: '',
                partner: '', // 合作方ID
                status: '',
                dateRange: []
            },
            // 列表数据
            list: [],
            total: 0,
            listLoading: false,
            listQuery: {
                pageNum: 1,
                pageSize: 20
            },
            // 对话框控制
            dialogVisible: false,
            dialogTitle: '',
            itemsDialogVisible: false,
            itemDialogVisible: false,
            itemDialogTitle: '',
            detailDialogVisible: false,
            // 表单数据
            form: {
                name: '',
                type: '',
                partyA: '', // 甲方
                partyAName: '', // 甲方名称
                partyB: '', // 乙方
                partyBName: '', // 乙方名称
                partner: '', // 合作方（从甲方或乙方中选择）
                partnerName: '', // 合作方名称
                startTime: '',
                endTime: '',
                mainBankCard: '',
                mainBankCardName: '', // 主银行卡号名称
                mainInvoice: '',
                payNode: '',
                invoiceNode: '',
                totalAmount: 0,
                pool: '',
                file: '', // 合同文件
                status: 'draft'
            },
            // 货物明细表单
            itemForm: {
                goodNo: '',
                goodType: '',
                goodName: '',
                goodModel: '',
                goodCount: 1,
                goodPrice: 0,
                goodRemark: ''
            },
            // 当前合同
            currentContract: null,
            // 合同货物明细
            contractItems: [],
            // 详情数据
            detailData: {},
            // 加载状态
            submitLoading: false,
            itemSubmitLoading: false,
            // 人员选择器控制
            searchPartnerSelectorVisible: false,
            // 甲方选择器控制
            partyASelectorVisible: false,
            // 乙方选择器控制
            partyBSelectorVisible: false,
            // 经营范围选择器控制
            businessScopeSelectorVisible: false,
            // 主银行卡号选择器控制
            mainBankCardSelectorVisible: false,
            // 日期选择器配置
            pickerOptions: {

            },
            // 合同类型选项
            contractTypeOptions: CONTRACT_TYPE_OPTIONS,
            // 表单验证规则
            rules: {
                name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
                type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
                partyA: [{ required: true, message: '请选择甲方', trigger: 'change' }],
                partyB: [{ required: true, message: '请选择乙方', trigger: 'change' }],
                partner: [{ required: true, message: '请选择合作方', trigger: 'change' }],
                startTime: [{ required: true, message: '请选择起始时间', trigger: 'change' }],
                endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
                totalAmount: [
                    { required: true, message: '请输入合同总金额', trigger: 'blur' },
                    { type: 'number', min: 0, message: '金额不能小于0', trigger: 'blur' },
                    {
                        validator: (rule, value, callback) => {
                            if (value && value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
                                callback(new Error('金额最多只能输入2位小数'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    }
                ],
            },
            itemRules: {
                goodCount: [{ required: true, message: '请输入货物数量', trigger: 'blur' }],
                goodPrice: [
                    { required: true, message: '请输入货物单价', trigger: 'blur' },
                    { type: 'number', min: 0, message: '单价不能小于0', trigger: 'blur' },
                    {
                        validator: (rule, value, callback) => {
                            if (value && value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
                                callback(new Error('单价最多只能输入2位小数'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        // 获取数据
        async fetchData() {
            this.listLoading = true
            try {
                const response = await getRecycleContractPage(this.listQuery)
                this.list = response.data.records || []
                this.total = response.data.total || 0
            } catch (error) {
                this.list = []
                this.total = 0
            } finally {
                this.listLoading = false
            }
        },

        // 搜索
        handleSearch() {
            this.listQuery.pageNum = 1
            this.fetchData()
        },

        // 重置搜索
        handleReset() {
            this.searchForm = {
                name: '',
                type: '',
                partner: '', // 合作方ID
                status: '',
                dateRange: []
            }
            this.listQuery.pageNum = 1
            this.fetchData()
        },

                    // 新增合同
            handleAdd() {
                this.dialogTitle = '新增合同'
                this.form = {
                    name: '',
                    type: '',
                    partyA: '', // 甲方
                    partyAName: '', // 甲方名称
                    partyB: '', // 乙方
                    partyBName: '', // 乙方名称
                    partner: '', // 合作方（从甲方或乙方中选择）
                    partnerName: '', // 合作方名称
                    startTime: '',
                    endTime: '',
                    mainBankCard: '',
                    mainBankCardName: '', // 主银行卡号名称
                    mainInvoice: '',
                    payNode: '',
                    invoiceNode: '',
                    totalAmount: 0,
                    pool: '',
                    file: '', // 合同文件
                    status: 'draft'
                }
                this.dialogVisible = true
            },

        // 编辑合同
        handleEdit(row) {
            this.dialogTitle = '编辑合同'
            this.form = { ...row }
            // 确保甲方和乙方字段存在
            if (!this.form.partyA) {
                this.form.partyA = ''
                this.form.partyAName = ''
            }
            if (!this.form.partyB) {
                this.form.partyB = ''
                this.form.partyBName = ''
            }
            // 确保合作方名称字段存在并根据合作方ID设置正确的名称
            if (this.form.partner) {
                if (this.form.partner === this.form.partyA) {
                    this.form.partnerName = this.form.partyAName
                } else if (this.form.partner === this.form.partyB) {
                    this.form.partnerName = this.form.partyBName
                } else {
                    this.form.partnerName = ''
                }
            } else {
                this.form.partnerName = ''
            }
            // 确保主银行卡号名称字段存在
            if (this.form.mainBankCard && !this.form.mainBankCardName) {
                this.form.mainBankCardName = this.form.mainBankCard
            }
            this.dialogVisible = true
        },

        // 查看详情
        handleDetail(row) {
            this.detailData = { ...row }
            this.detailDialogVisible = true
        },

        // 查看货物明细
        async handleViewItems(row) {
            this.currentContract = row
            try {
                const response = await getContractItems(row.id)
                this.contractItems = response.data || []
            } catch (error) {
                this.$message.error('获取货物明细失败')
                // 使用模拟数据作为备选
                this.contractItems = []
            }
            this.itemsDialogVisible = true
        },

        // 添加货物
        handleAddItem() {
            this.businessScopeSelectorVisible = true
        },

        // 编辑货物
        handleEditItem(row) {
            this.itemDialogTitle = '编辑货物'
            this.itemForm = { ...row }
            // 确保总价字段存在
            if (!this.itemForm.goodTotalPrice) {
                this.calculateTotalPrice()
            }
            this.itemDialogVisible = true
        },

        // 经营范围选择确认
        handleBusinessScopeConfirm(selectedItems) {
            if (selectedItems && selectedItems.length > 0) {
                const selectedItem = selectedItems[0] // 单选模式，取第一个
                
                // 将选中的经营范围信息填充到货物表单中
                this.itemForm = {
                    goodNo: selectedItem.no || '',
                    goodType: selectedItem.goodType || '',
                    goodName: selectedItem.goodName || '',
                    goodModel: selectedItem.goodModel || '',
                    goodCount: 1,
                    goodPrice: selectedItem.publicPrice || 0,
                    goodRemark: ''
                }
                
                // 计算初始总价
                this.calculateTotalPrice()
                
                // 打开货物编辑对话框
                this.itemDialogTitle = '添加货物'
                this.itemDialogVisible = true
            }
        },

        // 经营范围选择器关闭
        handleBusinessScopeClose() {
            this.businessScopeSelectorVisible = false
        },

        // 计算货物总价
        calculateTotalPrice() {
            const count = this.itemForm.goodCount || 0
            const price = this.itemForm.goodPrice || 0
            this.itemForm.goodTotalPrice = (count * price).toFixed(2)
        },

        // 货物明细对话框关闭
        handleItemsDialogClose() {
            // 刷新主列表数据
            this.fetchData()
        },

        // 表格合计方法
        getSummaries(param) {
            const { columns, data } = param
            const sums = []
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                    return
                }
                
                const values = data.map(item => Number(item[column.property]))
                
                if (!values.every(value => isNaN(value))) {
                    if (column.property === 'goodCount') {
                        // 货物数量合计
                        sums[index] = values.reduce((prev, curr) => {
                            const value = Number(curr)
                            if (!isNaN(value)) {
                                return prev + curr
                            } else {
                                return prev
                            }
                        }, 0)
                    } else if (column.property === 'goodTotalPrice') {
                        // 货物总价合计
                        const total = values.reduce((prev, curr) => {
                            const value = Number(curr)
                            if (!isNaN(value)) {
                                return prev + curr
                            } else {
                                return prev
                            }
                        }, 0)
                        sums[index] = `¥${this.formatAmount(total)}`
                    } else {
                        sums[index] = ''
                    }
                } else {
                    sums[index] = ''
                }
            })
            
            return sums
        },

        // 删除货物
        async handleDeleteItem(row) {
            try {
                await this.$confirm('确认删除该货物吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                await deleteContractItem(row.id)
                this.$message.success('删除成功')
                // 重新获取货物明细
                await this.handleViewItems(this.currentContract)
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除失败:', error)
                    this.$message.error('删除失败')
                }
            }
        },

        // 删除合同
        async handleDelete(row) {
            try {
                await this.$confirm('确认删除该合同吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                await deleteRecycleContract(row.id)
                this.$message.success('删除成功')
                this.fetchData()
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除失败:', error)
                    this.$message.error('删除失败')
                }
            }
        },

        // 提交表单
        async handleSubmit() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    this.submitLoading = true
                    try {
                        if (this.form.id) {
                            await updateRecycleContract(this.form)
                        } else {
                            await createRecycleContract(this.form)
                        }
                        this.$message.success(this.form.id ? '更新成功' : '创建成功')
                        this.dialogVisible = false
                        this.fetchData()
                    } catch (error) {
                        console.error('提交失败:', error)
                        this.$message.error('提交失败')
                    } finally {
                        this.submitLoading = false
                    }
                }
            })
        },

        // 提交货物表单
        async handleItemSubmit() {
            this.$refs.itemForm.validate(async (valid) => {
                if (valid) {
                    this.itemSubmitLoading = true
                    try {
                        // 确保总价是最新的
                        this.calculateTotalPrice()

                        // 添加合同ID
                        this.itemForm.recycleContractId = this.currentContract.id

                        if (this.itemForm.id) {
                            // 更新货物
                            await updateContractItem(this.itemForm)
                        } else {
                            // 新增货物
                            await createContractItem(this.itemForm)
                        }

                        this.$message.success(this.itemForm.id ? '更新成功' : '添加成功')
                        this.itemDialogVisible = false
                        // 重新获取货物明细
                        await this.handleViewItems(this.currentContract)
                    } catch (error) {
                        console.error('提交失败:', error)
                        this.$message.error('提交失败')
                    } finally {
                        this.itemSubmitLoading = false
                    }
                }
            })
        },

        // 导出数据
        async handleExport() {
            try {
                const response = await exportRecycleContract(this.searchForm)
                const blob = new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `合同回收数据_${new Date().toISOString().split('T')[0]}.xlsx`
                link.click()
                window.URL.revokeObjectURL(url)
                this.$message.success('导出成功')
            } catch (error) {
                console.error('导出失败:', error)
                this.$message.error('导出失败')
            }
        },

        // 分页相关
        handleSizeChange(val) {
            this.listQuery.pageSize = val
            this.fetchData()
        },
        handleCurrentChange(val) {
            this.listQuery.pageNum = val
            this.fetchData()
        },
        // 对话框关闭
        handleDialogClose() {
            this.$refs.form && this.$refs.form.resetFields()
        },

        // 合作方选择变化
        handlePartnerChange(value) {
            // 当合作方变化时，清空主银行卡号相关信息
            this.form.mainBankCard = ''
            this.form.mainBankCardName = ''
            
            // 根据选择的合作方ID设置合作方名称
            if (value === this.form.partyA) {
                this.form.partnerName = this.form.partyAName
            } else if (value === this.form.partyB) {
                this.form.partnerName = this.form.partyBName
            } else {
                this.form.partnerName = ''
            }
            console.log(value)
        },

        // 显示搜索合作方选择器
        showSearchPartnerSelector() {
            this.searchPartnerSelectorVisible = true
        },

        // 搜索合作方选择确认
        handleSearchPartnerConfirm(users) {
            if (users && users.length > 0) {
                const user = users[0] 
                this.searchForm.partner = user.id
                this.searchForm.partnerName = user.nickname
            }
            this.searchPartnerSelectorVisible = false
        },

        // 搜索合作方选择器关闭
        handleSearchPartnerClose() {
            this.searchPartnerSelectorVisible = false
        },

        // 显示甲方选择器
        showPartyASelector() {
            this.partyASelectorVisible = true
        },

        // 甲方选择确认
        handlePartyAConfirm(users) {
            if (users && users.length > 0) {
                const user = users[0] // 单选模式，取第一个用户
                this.form.partyA = user.id 
                this.form.partyAName = user.nickname
                // 如果当前选择的合作方是甲方，则清空合作方选择并更新合作方名称
                if (this.form.partner === this.form.partyA) {
                    this.form.partner = ''
                    this.form.partnerName = ''
                }
            } else {
                // 如果没有选择用户，清空甲方信息
                this.form.partyA = ''
                this.form.partyAName = ''
                // 如果当前选择的合作方是甲方，则清空合作方选择
                if (this.form.partner === this.form.partyA) {
                    this.form.partner = ''
                }
            }
            this.partyASelectorVisible = false
        },

        // 甲方选择器关闭
        handlePartyAClose() {
            this.partyASelectorVisible = false
        },

        // 显示乙方选择器
        showPartyBSelector() {
            this.partyBSelectorVisible = true
        },

        // 乙方选择确认
        handlePartyBConfirm(users) {
            if (users && users.length > 0) {
                const user = users[0] // 单选模式，取第一个用户
                this.form.partyB = user.id
                this.form.partyBName = user.nickname
                // 如果当前选择的合作方是乙方，则清空合作方选择并更新合作方名称
                if (this.form.partner === this.form.partyB) {
                    this.form.partner = ''
                    this.form.partnerName = ''
                }
            } else {
                // 如果没有选择用户，清空乙方信息
                this.form.partyB = ''
                this.form.partyBName = ''
                // 如果当前选择的合作方是乙方，则清空合作方选择
                if (this.form.partner === this.form.partyB) {
                    this.form.partner = ''
                }
            }
            this.partyBSelectorVisible = false
        },

        // 乙方选择器关闭
        handlePartyBClose() {
            this.partyBSelectorVisible = false
        },

        // 显示主银行卡号选择器
        showMainBankCardSelector() {
            this.mainBankCardSelectorVisible = true
        },

        // 主银行卡号选择确认
        handleMainBankCardConfirm(selectedBankCard) {
            if (selectedBankCard && selectedBankCard.length > 0) {
                const bankInfo = selectedBankCard[0]
                this.form.mainBankCard = bankInfo.cardNumber
                this.form.mainBankCardName = `${bankInfo.cardNumber}`
            } else {
                this.form.mainBankCard = ''
                this.form.mainBankCardName = ''
            }
            this.mainBankCardSelectorVisible = false
        },

        // 主银行卡号选择器关闭
        handleMainBankCardClose() {
            this.mainBankCardSelectorVisible = false
        },

        // 下载文件
        handleDownloadFile(fileUrl) {
            if (!fileUrl) {
                this.$message.warning('文件地址为空')
                return
            }
            
            // 创建下载链接
            const link = document.createElement('a')
            link.href = fileUrl.startsWith('http') ? fileUrl : process.env.VUE_APP_BASE_API + fileUrl
            link.download = fileUrl.split('/').pop() || '合同文件'
            link.target = '_blank'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        },

        // 预览文件
        handleFilePreview(fileInfo) {
            console.log('预览文件:', fileInfo.url)
            // 文件预览已经在 FileUploader 组件中处理，这里可以添加额外的逻辑
        },

        // 工具方法
        formatDateTime(time) {
            return parseTime(time)
        },
        formatDate(time) {
            return parseTime(time, '{y}-{m}-{d}')
        },
        formatAmount(amount) {
            return amount ? amount.toLocaleString() : '0'
        },
        getMainBankCardDisplayValue() {
            if (this.form.mainBankCardName) {
                return this.form.mainBankCardName;
            }
            return this.form.mainBankCard;
        }
    }
}
</script>

<style lang="scss" scoped>
.app-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 20px;
}

.search-form {
    .el-form-item {
        margin-bottom: 15px;
    }
}

.operation-card {
    margin-bottom: 20px;
}

.amount-text {
    font-weight: 600;
    color: #e6a23c;
}

// 合计行样式
::v-deep .el-table__footer-wrapper {
    .el-table__footer {
        background-color: #f5f7fa;
        
        td {
            background-color: #f5f7fa;
            font-weight: 600;
            color: #303133;
        }
        
        .cell {
            font-weight: 600;
        }
    }
}

.pagination {
    margin-top: 20px;
    text-align: right;
}

.no-file {
    color: #909399;
    font-size: 12px;
}


.items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h4 {
        margin: 0;
        color: #303133;
    }
}

.dialog-footer {
    text-align: right;
}



// 响应式设计
@media (max-width: 768px) {
    .search-form {
        .el-form-item {
            display: block;
            margin-bottom: 15px;

            .el-form-item__label {
                display: block;
                text-align: left;
                margin-bottom: 5px;
            }
        }
    }

    .operation-card {
        .el-row {
            flex-direction: column;

            .el-col {
                margin-bottom: 10px;
            }
        }
    }
}
</style>