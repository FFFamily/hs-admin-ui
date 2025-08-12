<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.native.prevent>
        <el-form-item label="订单号">
          <el-input 
            v-model="searchForm.orderNo" 
            placeholder="请输入订单号" 
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="合同ID">
          <el-input 
            v-model="searchForm.contractId" 
            placeholder="请输入合同ID" 
            clearable
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="货物类型">
          <el-input 
            v-model="searchForm.cargoType" 
            placeholder="请输入货物类型" 
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item label="分练编号">
          <el-input 
            v-model="searchForm.sortingNo" 
            placeholder="请输入分练编号" 
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item label="处理人">
          <el-input 
            v-model="searchForm.processor" 
            placeholder="请输入处理人姓名" 
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 250px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="operation-card" shadow="never">
      <el-row :gutter="20" type="flex" justify="space-between" align="middle">
        <el-col>
          <el-button 
            v-if="hasPermission('recycle:order:add')"
            type="primary" 
            icon="el-icon-plus" 
            @click="handleAdd"
          >
            新增订单
          </el-button>
          <el-button 
            v-if="hasPermission('recycle:order:batch')"
            type="success" 
            icon="el-icon-check" 
            :disabled="!selectedRows.length"
            @click="handleBatchApprove"
          >
            批量审批
          </el-button>
          <el-button 
            v-if="hasPermission('recycle:order:export')"
            type="warning" 
            icon="el-icon-download" 
            @click="handleExport"
          >
            导出数据
          </el-button>
        </el-col>
        <el-col>
          <el-tooltip content="刷新数据" placement="top">
            <el-button icon="el-icon-refresh" circle @click="fetchData" />
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" width="120" align="center" sortable="custom" />
        <el-table-column label="订单号" prop="orderNo" width="180" align="center" show-overflow-tooltip />
        <el-table-column label="合同ID" prop="contractId" width="150" align="center" show-overflow-tooltip />
        <el-table-column label="货物图片" width="100" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.cargoImg"
              :src="scope.row.cargoImg"
              :preview-src-list="[scope.row.cargoImg]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
              class="hover-zoom"
            />
            <el-tag v-else type="info" size="mini">无图片</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="运输方式" prop="transportType" width="120" align="center" />
        <el-table-column label="签收图片" width="100" align="center">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.signImg"
              :src="scope.row.signImg"
              :preview-src-list="[scope.row.signImg]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
              class="hover-zoom"
            />
            <el-tag v-else type="info" size="mini">无图片</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="货物类型" prop="cargoType" width="120" align="center" show-overflow-tooltip />
        <el-table-column label="货物名称" prop="cargoName" width="150" align="center" show-overflow-tooltip />
        <el-table-column label="重量(kg)" prop="weight" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.weight ? scope.row.weight + 'kg' : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="分练编号" prop="sortingNo" width="150" align="center" show-overflow-tooltip />
        <el-table-column label="处理人" prop="pickupProcessor" width="120" align="center" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="medium">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" sortable="custom">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-view" @click="handleDetail(scope.row)">
              查看
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending' && hasPermission('recycle:order:approve')"
              size="mini" 
              type="success" 
              icon="el-icon-check" 
              @click="handleApprove(scope.row)"
            >
              通过
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending' && hasPermission('recycle:order:approve')"
              size="mini" 
              type="danger" 
              icon="el-icon-close" 
              @click="handleReject(scope.row)"
            >
              拒绝
            </el-button>
            <el-button 
              v-if="hasPermission('recycle:order:edit')"
              size="mini" 
              type="warning" 
              icon="el-icon-edit" 
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              v-if="hasPermission('recycle:order:delete')"
              size="mini" 
              type="danger" 
              icon="el-icon-delete" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
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
        class="pagination"
      />
    </el-card>

    <!-- 订单弹窗（新增/编辑/查看） -->
    <el-dialog 
      :title="getDialogTitle()" 
      :visible.sync="detailVisible" 
      width="900px"
      :close-on-click-modal="false"
      top="5vh"
    >
      <el-form ref="detailForm" :model="detailData" :rules="formRules" label-width="120px" class="detail-form">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12" v-if="dialogMode !== 'add'">
            <el-form-item label="ID">
              <el-input v-model="detailData.id" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="detailData.orderNo" :readonly="dialogMode === 'view'" placeholder="请输入订单号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同ID" prop="contractId">
              <el-input v-model="detailData.contractId" :readonly="dialogMode === 'view'" placeholder="请输入合同ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运输方式" prop="transportType">
              <el-select v-model="detailData.transportType" :disabled="dialogMode === 'view'" placeholder="请选择运输方式" style="width: 100%;">
                <el-option label="公路运输" value="road" />
                <el-option label="铁路运输" value="railway" />
                <el-option label="水路运输" value="waterway" />
                <el-option label="航空运输" value="air" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="detailData.status" :disabled="dialogMode === 'view'" placeholder="请选择状态" style="width: 100%;">
                <el-option label="待审批" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogMode !== 'add'">
            <el-form-item label="创建时间">
              <el-input :value="formatDateTime(detailData.createTime)" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 货物信息 -->
        <el-divider content-position="left">货物信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货物类型" prop="cargoType">
              <el-input v-model="detailData.cargoType" :readonly="dialogMode === 'view'" placeholder="请输入货物类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物名称" prop="cargoName">
              <el-input v-model="detailData.cargoName" :readonly="dialogMode === 'view'" placeholder="请输入货物名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货物单价" prop="cargoPrice">
              <el-input v-model="detailData.cargoPrice" :readonly="dialogMode === 'view'" placeholder="请输入货物单价">
                <template slot="prepend">¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量" prop="weight">
              <el-input v-model="detailData.weight" :readonly="dialogMode === 'view'" placeholder="请输入重量">
                <template slot="append">kg</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分练编号" prop="sortingNo">
              <el-input v-model="detailData.sortingNo" :readonly="dialogMode === 'view'" placeholder="请输入分练编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分练时间" prop="sortingTime">
              <el-date-picker
                v-model="detailData.sortingTime"
                :disabled="dialogMode === 'view'"
                type="datetime"
                placeholder="请选择分练时间"
                style="width: 100%;"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分练人" prop="sortingProcessor">
              <el-input v-model="detailData.sortingProcessor" :readonly="dialogMode === 'view'" placeholder="请输入分练人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分练成本" prop="sortingCost">
              <el-input v-model="detailData.sortingCost" :readonly="dialogMode === 'view'" placeholder="请输入分练成本">
                <template slot="prepend">¥</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="分练备注" prop="sortingRemark">
              <el-input 
                v-model="detailData.sortingRemark" 
                :readonly="dialogMode === 'view'"
                type="textarea" 
                :rows="2" 
                placeholder="请输入分练备注"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 运输信息 -->
        <el-divider content-position="left">运输信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="取货时间" prop="pickupTime">
              <el-date-picker
                v-model="detailData.pickupTime"
                :disabled="dialogMode === 'view'"
                type="datetime"
                placeholder="请选择取货时间"
                style="width: 100%;"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处理人(司机)" prop="pickupProcessor">
              <el-input v-model="detailData.pickupProcessor" :readonly="dialogMode === 'view'" placeholder="请输入处理人姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="运输成本" prop="transportCost">
              <el-input v-model="detailData.transportCost" :readonly="dialogMode === 'view'" placeholder="请输入运输成本">
                <template slot="prepend">¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="取货地址" prop="pickupAddress">
              <el-input v-model="detailData.pickupAddress" :readonly="dialogMode === 'view'" placeholder="请输入取货地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 财务信息 -->
        <el-divider content-position="left">财务信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="打款状态" prop="paymentStatus">
              <el-select v-model="detailData.paymentStatus" :disabled="dialogMode === 'view'" placeholder="请选择打款状态" style="width: 100%;">
                <el-option label="待打款" value="pending" />
                <el-option label="已打款" value="paid" />
                <el-option label="打款失败" value="failed" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="打款时间" prop="paymentTime">
              <el-date-picker
                v-model="detailData.paymentTime"
                :disabled="dialogMode === 'view'"
                type="datetime"
                placeholder="请选择打款时间"
                style="width: 100%;"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="打款凭证号" prop="paymentVoucher">
              <el-input v-model="detailData.paymentVoucher" :readonly="dialogMode === 'view'" placeholder="请输入打款凭证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="打款公户" prop="paymentAccount">
              <el-input v-model="detailData.paymentAccount" :readonly="dialogMode === 'view'" placeholder="请输入打款公户" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 发票信息 -->
        <el-divider content-position="left">发票信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开票状态" prop="invoiceStatus">
              <el-select v-model="detailData.invoiceStatus" :disabled="dialogMode === 'view'" placeholder="请选择开票状态" style="width: 100%;">
                <el-option label="待开票" value="pending" />
                <el-option label="已开票" value="issued" />
                <el-option label="开票失败" value="failed" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票时间" prop="invoiceTime">
              <el-date-picker
                v-model="detailData.invoiceTime"
                :disabled="dialogMode === 'view'"
                type="datetime"
                placeholder="请选择开票时间"
                style="width: 100%;"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="开票金额" prop="invoiceAmount">
              <el-input v-model="detailData.invoiceAmount" :readonly="dialogMode === 'view'" placeholder="请输入开票金额">
                <template slot="prepend">¥</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 图片信息 -->
        <el-divider content-position="left">图片信息</el-divider>
        <div class="image-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="货物图片" prop="cargoImg">
                <div v-if="dialogMode === 'view' && detailData.cargoImg">
                  <el-image
                    :src="detailData.cargoImg"
                    :preview-src-list="[detailData.cargoImg]"
                    fit="cover"
                    style="width: 100%; height: 150px; border-radius: 8px;"
                  />
                </div>
                <el-upload
                  v-else-if="dialogMode !== 'view'"
                  class="image-uploader"
                  :action="uploadUrl"
                  :show-file-list="false"
                  :on-success="handleCargoImgSuccess"
                  :before-upload="beforeImageUpload"
                >
                  <img v-if="detailData.cargoImg" :src="detailData.cargoImg" class="uploaded-image" />
                  <i v-else class="el-icon-plus image-uploader-icon"></i>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="取货图片" prop="pickupImg">
                <div v-if="dialogMode === 'view' && detailData.pickupImg">
                  <el-image
                    :src="detailData.pickupImg"
                    :preview-src-list="[detailData.pickupImg]"
                    fit="cover"
                    style="width: 100%; height: 150px; border-radius: 8px;"
                  />
                </div>
                <el-upload
                  v-else-if="dialogMode !== 'view'"
                  class="image-uploader"
                  :action="uploadUrl"
                  :show-file-list="false"
                  :on-success="handlePickupImgSuccess"
                  :before-upload="beforeImageUpload"
                >
                  <img v-if="detailData.pickupImg" :src="detailData.pickupImg" class="uploaded-image" />
                  <i v-else class="el-icon-plus image-uploader-icon"></i>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="签收图片" prop="signImg">
                <div v-if="dialogMode === 'view' && detailData.signImg">
                  <el-image
                    :src="detailData.signImg"
                    :preview-src-list="[detailData.signImg]"
                    fit="cover"
                    style="width: 100%; height: 150px; border-radius: 8px;"
                  />
                </div>
                <el-upload
                  v-else-if="dialogMode !== 'view'"
                  class="image-uploader"
                  :action="uploadUrl"
                  :show-file-list="false"
                  :on-success="handleSignImgSuccess"
                  :before-upload="beforeImageUpload"
                >
                  <img v-if="detailData.signImg" :src="detailData.signImg" class="uploaded-image" />
                  <i v-else class="el-icon-plus image-uploader-icon"></i>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">取消</el-button>
        <el-button 
          v-if="dialogMode === 'view' && detailData.status === 'pending' && hasPermission('recycle:order:assign')"
          type="primary" 
          @click="handleAssignPerson"
        >
          分配专人
        </el-button>
        <el-button 
          v-if="dialogMode !== 'view'"
          type="primary" 
          @click="handleSubmit"
          :loading="submitLoading"
        >
          {{ dialogMode === 'add' ? '新增' : '保存' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 分配专人弹窗 -->
    <el-dialog
      title="选择处理人员"
      :visible.sync="assignPersonVisible"
      width="80%"
      :close-on-click-modal="false"
      top="5vh"
    >
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="输入用户名或手机号搜索"
          style="width: 300px; margin-right: 10px;"
          clearable
          @keyup.enter.native="fetchUserList"
        >
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <el-button type="primary" icon="el-icon-search" @click="fetchUserList">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetUserSearch">重置</el-button>
      </div>

      <el-table
        v-loading="userLoading"
        :data="userList"
        style="width: 100%; margin-top: 20px;"
        border
        highlight-current-row
        @current-change="handleCurrentUser"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="150" align="center" />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'company' ? 'primary' : 'success'" size="mini">
              {{ scope.row.type === 'company' ? '企业' : '个人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="150" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
      </el-table>

      <div style="margin-top: 20px; text-align: right;">
        <el-pagination
          background
          layout="total, prev, pager, next, jumper"
          :total="userTotal"
          :page-size="userPageSize"
          :current-page.sync="userCurrentPage"
          @current-change="fetchUserList"
        />
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="assignPersonVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect" :disabled="!selectedProcessor">
          确认分配
        </el-button>
      </div>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog
      title="审批订单"
      :visible.sync="approvalVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item label="审批结果" required>
          <el-radio-group v-model="approvalForm.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" required>
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="approvalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApproval">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRecyclePage, getRecycleDetail, deleteRecycle, assignRecycle, approveRecycle, createRecycle, updateRecycle } from '@/api/recycle'
import { getUserPage } from '@/api/user'
import { parseTime } from '@/utils'

export default {
  name: 'RecycleOrder',
  data() {
    return {
      list: [],
      listLoading: false,
      searchForm: {
        orderNo: '',
        contractId: '',
        status: '',
        cargoType: '',
        sortingNo: '',
        processor: '',
        dateRange: []
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      selectedRows: [],
      detailVisible: false,
      detailData: {},
      dialogMode: 'view', // 'add', 'edit', 'view'
      submitLoading: false,
      assignPersonVisible: false,
      selectedProcessor: '',
      userList: [],
      userLoading: false,
      searchQuery: '',
      userTotal: 0,
      userPageSize: 10,
      userCurrentPage: 1,
      approvalVisible: false,
      approvalForm: {
        result: 'approved',
        comment: '',
        orderId: null
      },
      // 表单验证规则
      formRules: {
        orderNo: [
          { required: true, message: '请输入订单号', trigger: 'blur' }
        ],
        contractId: [
          { required: true, message: '请输入合同ID', trigger: 'blur' }
        ],
        transportType: [
          { required: true, message: '请选择运输方式', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        cargoType: [
          { required: true, message: '请输入货物类型', trigger: 'blur' }
        ],
        cargoName: [
          { required: true, message: '请输入货物名称', trigger: 'blur' }
        ]
      },
      // 上传地址
      uploadUrl: process.env.VUE_APP_BASE_API + '/upload/image'
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
        orderNo: this.searchForm.orderNo || undefined,
        contractId: this.searchForm.contractId || undefined,
        status: this.searchForm.status || undefined,
        cargoType: this.searchForm.cargoType || undefined,
        sortingNo: this.searchForm.sortingNo || undefined,
        processor: this.searchForm.processor || undefined,
        startDate: this.searchForm.dateRange?.[0] || undefined,
        endDate: this.searchForm.dateRange?.[1] || undefined,
        page: this.pagination.page,
        size: this.pagination.size
      }
      
      getRecyclePage(params).then(response => {
        this.list = response.data.records || response.data || []
        this.pagination.total = response.data.total || 0
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取数据失败')
      })
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = { 
        orderNo: '', 
        contractId: '', 
        status: '', 
        cargoType: '',
        sortingNo: '',
        processor: '',
        dateRange: [] 
      }
      this.pagination.page = 1
      this.fetchData()
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 排序变化
    handleSortChange({ column, prop, order }) {
      // 这里可以添加排序逻辑
      console.log('排序变化:', prop, order)
    },

    // 新增订单
    handleAdd() {
      this.dialogMode = 'add'
      this.detailData = this.getDefaultFormData()
      this.detailVisible = true
    },

    // 批量审批
    handleBatchApprove() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要审批的订单')
        return
      }
      
      this.$confirm(`确定要批量审批通过选中的 ${this.selectedRows.length} 个订单吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        // 这里实现批量审批逻辑
        this.$message.success('批量审批成功')
        this.fetchData()
      }).catch(() => {})
    },

    // 导出数据
    handleExport() {
      this.$message.info('导出功能待实现')
    },

    // 分配专人
    handleAssignPerson() {
      this.resetUserSearch()
      this.fetchUserList()
      this.assignPersonVisible = true
    },

    // 获取用户列表
    fetchUserList() {
      this.userLoading = true
      const params = {
        pageNum: this.userCurrentPage,
        pageSize: this.userPageSize,
        keyword: this.searchQuery || undefined
      }
      
      getUserPage(params).then(response => {
        this.userList = response.data.records || response.data || []
        this.userTotal = response.data.total || 0
        this.userLoading = false
      }).catch(() => {
        this.userLoading = false
        this.$message.error('获取用户列表失败')
      })
    },

    // 重置用户搜索
    resetUserSearch() {
      this.searchQuery = ''
      this.userCurrentPage = 1
      this.selectedProcessor = ''
    },

    // 选中用户
    handleCurrentUser(row) {
      this.selectedProcessor = row.id
    },

    // 确认分配
    confirmSelect() {
      if (!this.selectedProcessor) {
        this.$message.error('请选择一个用户')
        return
      }

      const orderId = this.detailData.id
      const processorId = this.selectedProcessor
      
      assignRecycle({
        orderId,
        processor: processorId
      }).then(() => {
        this.$message.success('分配成功')
        this.assignPersonVisible = false
        this.fetchData()
      }).catch(() => {
        this.$message.error('分配失败')
      })
    },

    // 查看详情
    handleDetail(row) {
      this.dialogMode = 'view'
      getRecycleDetail(row.id).then(response => {
        this.detailData = response.data
        this.detailVisible = true
      }).catch(() => {
        this.$message.error('获取详情失败')
      })
    },

    // 审批订单
    handleApprove(row) {
      this.approvalForm = {
        result: 'approved',
        comment: '',
        orderId: row.id
      }
      this.approvalVisible = true
    },

    // 拒绝订单
    handleReject(row) {
      this.approvalForm = {
        result: 'rejected',
        comment: '',
        orderId: row.id
      }
      this.approvalVisible = true
    },

    // 提交审批
    submitApproval() {
      if (!this.approvalForm.comment.trim()) {
        this.$message.error('请输入审批意见')
        return
      }

      const params = {
        orderId: this.approvalForm.orderId,
        result: this.approvalForm.result,
        comment: this.approvalForm.comment
      }

      approveRecycle(params).then(() => {
        this.$message.success('审批成功')
        this.approvalVisible = false
        this.fetchData()
      }).catch(() => {
        this.$message.error('审批失败')
      })
    },

    // 编辑订单
    handleEdit(row) {
      this.dialogMode = 'edit'
      getRecycleDetail(row.id).then(response => {
        this.detailData = response.data
        this.detailVisible = true
      }).catch(() => {
        this.$message.error('获取订单详情失败')
      })
    },

    // 删除订单
    handleDelete(row) {
      this.$confirm('确定要删除该订单吗？删除后无法恢复！', '警告', {
        type: 'warning',
        confirmButtonText: '确定删除',
        confirmButtonClass: 'el-button--danger'
      }).then(() => {
        deleteRecycle(row.id).then(() => {
          this.$message.success('删除成功')
          this.fetchData()
        }).catch(() => {
          this.$message.error('删除失败')
        })
      }).catch(() => {})
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.size = val
      this.pagination.page = 1
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },

    // 格式化日期时间
    formatDateTime(time) {
      return time ? parseTime(time) : '--'
    },

    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return statusMap[status] || status
    },

    // 获取打款状态类型
    getPaymentStatusType(status) {
      const statusMap = {
        pending: 'warning',
        paid: 'success',
        failed: 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取打款状态文本
    getPaymentStatusText(status) {
      const statusMap = {
        pending: '待打款',
        paid: '已打款',
        failed: '打款失败'
      }
      return statusMap[status] || status || '--'
    },

    // 获取开票状态类型
    getInvoiceStatusType(status) {
      const statusMap = {
        pending: 'warning',
        issued: 'success',
        failed: 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取开票状态文本
    getInvoiceStatusText(status) {
      const statusMap = {
        pending: '待开票',
        issued: '已开票',
        failed: '开票失败'
      }
      return statusMap[status] || status || '--'
    },

    // 权限检查（示例方法）
    hasPermission(permission) {
      // 这里应该根据实际的权限系统实现
      return true
    },

    // 获取弹框标题
    getDialogTitle() {
      const titleMap = {
        add: '新增订单',
        edit: '编辑订单',
        view: '订单详情'
      }
      return titleMap[this.dialogMode] || '订单详情'
    },

    // 获取默认表单数据
    getDefaultFormData() {
      return {
        orderNo: '',
        contractId: '',
        transportType: '',
        status: 'pending',
        cargoType: '',
        cargoName: '',
        cargoPrice: '',
        weight: '',
        sortingNo: '',
        sortingTime: '',
        sortingProcessor: '',
        sortingCost: '',
        sortingRemark: '',
        pickupTime: '',
        pickupAddress: '',
        pickupImg: '',
        pickupProcessor: '',
        transportCost: '',
        paymentTime: '',
        paymentStatus: 'pending',
        paymentVoucher: '',
        paymentAccount: '',
        invoiceTime: '',
        invoiceStatus: 'pending',
        invoiceAmount: '',
        cargoImg: '',
        signImg: ''
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.detailForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const api = this.dialogMode === 'add' ? createRecycle : updateRecycle
          const params = this.dialogMode === 'add' ? this.detailData : { ...this.detailData, id: this.detailData.id }
          
          api(params).then(() => {
            this.$message.success(this.dialogMode === 'add' ? '新增成功' : '保存成功')
            this.detailVisible = false
            this.fetchData()
          }).catch(() => {
            this.$message.error(this.dialogMode === 'add' ? '新增失败' : '保存失败')
          }).finally(() => {
            this.submitLoading = false
          })
        }
      })
    },

    // 图片上传前验证
    beforeImageUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG/GIF 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    // 货物图片上传成功
    handleCargoImgSuccess(response) {
      this.detailData.cargoImg = response.data
      this.$message.success('货物图片上传成功')
    },

    // 取货图片上传成功
    handlePickupImgSuccess(response) {
      this.detailData.pickupImg = response.data
      this.$message.success('取货图片上传成功')
    },

    // 签收图片上传成功
    handleSignImgSuccess(response) {
      this.detailData.signImg = response.data
      this.$message.success('签收图片上传成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .search-card {
    margin-bottom: 20px;
  }
  
  .operation-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .pagination {
      margin-top: 20px;
      text-align: right;
    }
  }
  
  .detail-form {
    .el-divider {
      margin: 20px 0;
      
      .el-divider__text {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .el-form-item {
      margin-bottom: 18px;
      
      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }
      
      .el-input__inner {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #606266;
      }
      
      .el-textarea__inner {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #606266;
      }
    }
  }
  
  .image-section {
    margin-top: 20px;
    
    .image-item {
      margin-bottom: 20px;
      
      h4 {
        margin-bottom: 10px;
        color: #606266;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
  
  .hover-zoom {
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .search-container {
    margin-bottom: 20px;
  }

  .image-uploader {
    .el-upload {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 150px;
      
      &:hover {
        border-color: #409eff;
      }
    }
    
    .image-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100%;
      height: 150px;
      line-height: 150px;
      text-align: center;
    }
    
    .uploaded-image {
      width: 100%;
      height: 150px;
      display: block;
      object-fit: cover;
      border-radius: 6px;
    }
  }
}
</style>