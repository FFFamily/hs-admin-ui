<template>
  <div class="app-container">
    <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
      <el-form-item label="商品名">
        <el-input v-model="searchForm.name" placeholder="请输入商品名" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="上架" value="up" />
            <el-option label="下架" value="down" />
          </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item style="float:right;">
        <el-button type="primary" @click="handleAdd">新增商品</el-button>
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
      <el-table-column label="编号" prop="code" width="120" align="center" />
      <el-table-column label="分类" width="120" align="center">
        <template slot-scope="scope">
          {{ getCategoryName(scope.row.categoryId) || '未分类' }}
        </template>
      </el-table-column>
      <el-table-column label="商品名" prop="name" />
      <el-table-column label="图片" width="100" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.image" alt="图片" style="width:60px;height:60px;object-fit:cover;" />
        </template>
      </el-table-column>
      <el-table-column label="价格(元/天)" prop="price" width="100" align="center" />
      <el-table-column label="使用年限" prop="useLimitYear" width="100" align="center" />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'up' ? 'success' : 'info'">
              {{ scope.row.status === 'up' ? '上架' : '下架' }}
            </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="mini" type="warning" @click="handleToggleStatus(scope.row)">
            {{ scope.row.status === 'up' ? '下架' : '上架' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <div class="pagination-container" style="margin-top: 20px;">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="currentPage"
        :page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 图片预览弹窗 -->
    <el-dialog :visible.sync="dialogImageVisible" title="预览图片" :close-on-click-modal="false">
      <img :src="previewImage" alt="预览图片" style="max-width: 100%;">
    </el-dialog>
    
    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form :model="form" label-width="80px">
        <el-form-item label="商品名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="编号">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            class="upload-demo"
            action="/api/system/file/upload"
            :headers="{'Token-Key': getToken()}"
            :on-preview="handlePictureCardPreview"
            :on-remove="(file, fileList) => handleRemove(file, fileList, 'image')"
            :before-upload="beforeUpload"
            :on-success="(response, file, fileList) => handleUploadSuccess(response, file, fileList, 'image')"
            :on-error="handleUploadError"
            list-type="picture-card"
            :file-list="form.imageList"
            :limit="1"
            :on-exceed="(files, fileList) => this.$message.warning('只能上传一张主图片')"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" />
        </el-form-item>
        <!-- <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item> -->
        <el-form-item label="状态">
          <el-select v-model="form.status">
              <el-option label="上架" value="up" />
              <el-option label="下架" value="down" />
            </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option v-for="category in categoryOptions" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="基本信息">
          <el-input v-model="form.baseInfo" type="textarea" placeholder="请输入基本信息" />
        </el-form-item>
        <el-form-item label="使用年限">
          <el-input-number v-model="form.useLimitYear" :min="0" placeholder="请输入使用年限" />
        </el-form-item>
        <el-form-item label="设备参数">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <el-radio v-model="fieldTypes.parameter" label="text">文字</el-radio>
            <el-radio v-model="fieldTypes.parameter" label="image" style="margin-left: 20px;">图片</el-radio>
          </div>
          <div v-if="fieldTypes.parameter === 'text'">
            <el-input v-model="form.parameter.data" type="textarea" placeholder="请输入设备参数" />
          </div>
          <div v-else>
            <el-upload
            class="upload-demo"
            action="/api/system/file/upload"
            list-type="picture-card"
            :headers="{'Token-Key': getToken()}"
            :on-preview="handlePictureCardPreview"
            :on-remove="(file, fileList) => handleRemove(file, fileList, 'parameter')"
            :before-upload="beforeUpload"
            :on-success="(response, file, fileList) => handleUploadSuccess(response, file, fileList, 'parameter')"
            :on-error="handleUploadError"
            :file-list="form.parameterImages.map(url => ({ name: '参数图片', url }))"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="服务内容">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <el-radio v-model="fieldTypes.serviceContent" label="text">文字</el-radio>
            <el-radio v-model="fieldTypes.serviceContent" label="image" style="margin-left: 20px;">图片</el-radio>
          </div>
          <div v-if="fieldTypes.serviceContent === 'text'">
            <el-input v-model="form.serviceContent.data" type="textarea" placeholder="请输入服务内容" />
          </div>
          <div v-else>
            <el-upload
              class="upload-demo"
              action="/api/system/file/upload"
              list-type="picture-card"
              :headers="{'Token-Key': getToken()}"
              :on-preview="handlePictureCardPreview"
              :on-remove="(file, fileList) => handleRemove(file, fileList, 'serviceContent')"
              :before-upload="beforeUpload"
              :on-success="(response, file, fileList) => handleUploadSuccess(response, file, fileList, 'serviceContent')"
              :on-error="handleUploadError"
              :file-list="form.serviceContentImages.map(url => ({ name: '服务内容图片', url }))"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="注意事项">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <el-radio v-model="fieldTypes.precaution" label="text">文字</el-radio>
            <el-radio v-model="fieldTypes.precaution" label="image" style="margin-left: 20px;">图片</el-radio>
          </div>
          <div v-if="fieldTypes.precaution === 'text'">
            <el-input v-model="form.precaution.data" type="textarea" placeholder="请输入注意事项" />
          </div>
          <div v-else>
            <el-upload
              class="upload-demo"
              action="/api/system/file/upload"
              list-type="picture-card"
              :headers="{'Token-Key': getToken()}"
              :on-preview="handlePictureCardPreview"
              :on-remove="(file, fileList) => handleRemove(file, fileList, 'precaution')"
              :before-upload="beforeUpload"
              :on-success="(response, file, fileList) => handleUploadSuccess(response, file, fileList, 'precaution')"
              :on-error="handleUploadError"
              :file-list="form.precautionImages.map(url => ({ name: '注意事项图片', url }))"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCategoriesList,changeGoodStatus, getLeaseGoodListPage, addLeaseGood, updateLeaseGood, deleteLeaseGood } from '@/api/leaseGood';
import { uploadFile } from '@/api/upload';
import { getToken } from '@/utils/auth'
export default {
  components: {},
  data() {
    return {
      list: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      listLoading: false,
      searchForm: {
        name: '',
        status: ''
      },
      dialogVisible: false,
      dialogTitle: '新增商品',
      form: {
          id: null,
          name: '',
          code: '',
          image: '',
          imageList: [],
          price: 0,
          status: 'up',
          categoryId: '',  // 商品分类ID
          type: '',        // 商品分类
          baseInfo: '',    // 基本信息
          useLimitYear: 0, // 使用年限
          parameter: '',   // 设备参数(文字)
          parameterImages: [], // 设备参数(图片)
          serviceContent: '', // 服务内容(文字)
          serviceContentImages: [], // 服务内容(图片)
          precaution: '',   // 注意事项(文字)
          precautionImages: [], // 注意事项(图片)
        },
      categoryOptions: [],  // 分类选项
      // 控制字段类型(文字/图片)
      fieldTypes: {
        parameter: 'text', // 'text' 或 'image'
        serviceContent: 'text',
        precaution: 'text'
      },
      // 图片预览相关
      previewImage: '',
      dialogImageVisible: false
    }
  },
  created() {
    this.fetchData()
    this.getCategoryOptions()
  },
  methods: {
    getToken() {
      return getToken()
    },  
    getCategoryOptions() {
      getCategoriesList()
        .then(response => {
          this.categoryOptions = response.data || []
        })
        .catch(error => {
          console.error('获取分类失败:', error)
          this.$message.error('获取分类失败')
        })
    },
    fetchData() {
      this.listLoading = true
      // 调用API获取商品列表
      getLeaseGoodListPage({
        pageNum: this.currentPage,
        pageSize: this.pageSize,
      })
        .then(response => {
          this.list = response.data.records || []
          console.log(this.list)
          this.total = response.data.total || 0
          this.listLoading = false
        })
        .catch(error => {
          console.error('获取商品列表失败:', error)
          this.$message.error('获取商品列表失败')
          this.listLoading = false
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleSearch() {
      this.fetchData()
    },
    handleReset() {
      this.searchForm = { name: '', status: '' }
      this.fetchData()
    },
    handleAdd() {
      this.dialogTitle = '新增商品'
      this.form = {
        id: null,
        name: '',
        code: '',
        image: '',
        imageList: [],
        price: 0,
        status: 'up',
        categoryId: '',
        type: '',
        baseInfo: '',
        useLimitYear: 0,
        parameter: '',
        parameterImages: [],
        serviceContent: '',
        serviceContentImages: [],
        precaution: '',
        precautionImages: []
      }
      // 重置字段类型
      this.fieldTypes = {
        parameter: 'text',
        serviceContent: 'text',
        precaution: 'text'
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑商品'
      row.parameter = JSON.parse(row.parameter)
      row.serviceContent = JSON.parse(row.serviceContent)
      row.precaution = JSON.parse(row.precaution)
      this.form = {
        ...row,
        categoryId: row.categoryId || '',
        type: row.type || '',
        baseInfo: row.baseInfo || '',
        useLimitYear: row.useLimitYear || 0,
        parameter: row.parameter || '',
        parameterImages: row.parameterImages || [],
        serviceContent: row.serviceContent || '',
        serviceContentImages: row.serviceContentImages || [],
        precaution: row.precaution || '',
        precautionImages: row.precautionImages || [],
        image: row.image || '',
        imageList: row.imageList || []
      }
      // 设置字段类型，如果有图片则默认为图片模式
      this.fieldTypes = {
        parameter: row.parameter.type,
        serviceContent: row.serviceContent.type,
        precaution: row.precaution.type
      }
      // 如果类型为图片则转换
      if (this.fieldTypes.parameter === 'image') {
        this.form.parameterImages = this.form.parameter.data
      }
      if (this.fieldTypes.serviceContent === 'image') {
        this.form.serviceContentImages = this.form.serviceContent.data
      }
      if (this.fieldTypes.precaution === 'image') {
        this.form.precautionImages = this.form.precaution.data
      }
      this.dialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
        .then(() => {
          // 调用API删除商品
          deleteLeaseGood({ id: row.id })
            .then(() => {
              this.$message.success('删除成功')
              this.fetchData()
            })
            .catch(error => {
              console.error('删除商品失败:', error)
              this.$message.error('删除商品失败')
            })
        })
        .catch(() => {})
    },
    handleToggleStatus(row) {
      this.$confirm(`确定要${row.status === 'up' ? '下架' : '上架'}该商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const newStatus = row.status === 'up' ? 'down' : 'up';
        changeGoodStatus(row.id, newStatus).then(response => {
          this.$message({ type: 'success', message: '操作成功!' });
          // 更新本地状态
          row.status = newStatus;
          // 刷新表格数据
          this.fetchData();
        }).catch(error => {
          this.$message({ type: 'error', message: '操作失败: ' + (error.message || '未知错误') });
        });
      }).catch(() => {
        this.$message({ type: 'info', message: '已取消操作' });
      });
    },
    // 根据分类ID获取分类名称
    getCategoryName(categoryId) {
      const category = this.categoryOptions.find(item => item.id === categoryId);
      return category ? category.name : '';
    },
    
    // 图片预览
    handlePictureCardPreview(file) {
      this.previewImage = file.url || file.response.data.url;
      this.dialogImageVisible = true;
    },

    // 删除图片
    // 通用图片上传前校验
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG、PNG 或 GIF 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!');
      }

      return isJPG && isLt2M;
    },

    // 处理图片上传成功
    handleUploadSuccess(response, file, fileList, field) {
      console.log(response);
      const imgUrl = process.env.VUE_APP_BASE_API + response.data.fileUrl;
      if (field === 'image') {
        // 对于主图片，我们只需要第一张
        this.form.image = imgUrl;
        this.form.imageList = [{ name: '商品图片', url: imgUrl }];
      } else if (field === 'parameter') {
        this.form.parameterImages.push(imgUrl);
      } else if (field === 'serviceContent') {
        this.form.serviceContentImages.push(imgUrl);
      } else if (field === 'precaution') {
        this.form.precautionImages.push(imgUrl);
      }
      this.$message.success('上传成功');
    },

    // 处理图片上传失败
    handleUploadError(err, file, fileList) {
      console.error('上传失败:', err);
      this.$message.error('上传失败');
    },

    // 删除图片
    handleRemove(file, fileList, field) {
      if (field === 'image') {
        this.form.imageList = fileList;
      } else if (field === 'parameter') {
        this.form.parameterImages = fileList;
      } else if (field === 'serviceContent') {
        this.form.serviceContentImages = fileList;
      } else if (field === 'precaution') {
        this.form.precautionImages = fileList;
      }
    },
    
    handleSave() {
      // 处理表单数据
      const formData = { ...this.form };
      
      // 处理设备参数
      formData.parameter = JSON.stringify({
        type: this.fieldTypes.parameter,
        data: this.fieldTypes.parameter === 'text' ? this.form.parameter.data : this.form.parameterImages.map(img => img)
      });
      
      // 处理服务内容
      formData.serviceContent = JSON.stringify({
        type: this.fieldTypes.serviceContent,
        data: this.fieldTypes.serviceContent === 'text' ? this.form.serviceContent.data : this.form.serviceContentImages.map(img => img)
      });
      
      // 处理注意事项
      formData.precaution = JSON.stringify({
        type: this.fieldTypes.precaution,
        data: this.fieldTypes.precaution === 'text' ? this.form.precaution.data : this.form.precautionImages.map(img => img)
      });
      
      // 确保主图片数据正确
      
      if (this.form.imageList && this.form.imageList.length > 0) {
        formData.image = this.form.imageList[0].url;
      } else {
        formData.image = '';
      }

      // 删除不需要提交的字段
      delete formData.imageList;
      delete formData.parameterImages;
      delete formData.serviceContentImages;
      delete formData.precautionImages;
      
      if (this.form.id) {
        // 编辑
        updateLeaseGood(formData)
          .then(() => {
            this.$message.success('编辑成功');
            this.dialogVisible = false;
            this.fetchData();
          })
          .catch(error => {
            console.error('编辑商品失败:', error);
            this.$message.error('编辑商品失败');
          });
      } else {
        // 新增
        addLeaseGood(formData)
          .then(() => {
            this.$message.success('新增成功');
            this.dialogVisible = false;
            this.fetchData();
          })
          .catch(error => {
            console.error('新增商品失败:', error);
            this.$message.error('新增商品失败');
          });
      }
    }
  }
}
</script>

<style scoped>
.demo-form-inline .el-form-item {
  margin-right: 20px;
}
</style>