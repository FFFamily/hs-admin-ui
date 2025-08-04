<template>
  <div class="system-config">
    <el-card>
      <el-form :model="form" label-width="160px" style="max-width: 600px;">
        <el-form-item label="小程序首页轮播图图片">
          <div v-if="!isEdit">
            <el-image
              v-for="(url, idx) in form.homeImg"
              :key="url"
              :src="url"
              style="width: 120px; height: 60px; margin-right: 10px;"
              fit="cover"
            />
            <div v-if="!form.homeImg || form.homeImg.length === 0" style="color: #999;">暂无图片</div>
          </div>
          <el-upload
            v-else
            class="upload-demo"
            action="/api/system/file/upload"
            list-type="picture-card"
            :file-list="fileList"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :headers="{'Token-Key': getToken()}"
            multiple
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <div class="el-upload__tip" slot="tip" v-if="isEdit">支持多图上传，建议尺寸 750x360px</div>
        </el-form-item>
        <el-form-item label="商城分类类型">
          <div v-if="!isEdit">
            <span>{{ getCategoryName(form.mallType) }}</span>
          </div>
          <el-select v-else v-model="form.mallType" placeholder="请选择商城类型" multiple>
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id"></el-option>
          </el-select>
          <div class="el-upload__tip" slot="tip" v-if="isEdit">选择商城顶部分类栏的展示类型，可多选</div>
        </el-form-item>
        <el-form-item>
          <el-button v-if="!isEdit" type="primary" @click="handleEdit">编辑</el-button>
          <template v-else>
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </template>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getWxHomeConfig, updateHomeConfig } from '@/api/homeConfig'
import { getToken } from '@/utils/auth'
import { getCategoryList } from '@/api/categories'
export default {
  name: 'SystemConfig',
  data() {
    return {
      form: {
        homeImg: [], // 图片url数组
        mallType: [] // 商城分类类型，存储分类ID数组
      },
      fileList: [],
      isEdit: false,
      backup: null,
      getToken: getToken,
      categories: [] // 商品分类列表
    }
  },
  created() {
    this.getWxHomeConfig()
    this.getCategoryList()
    this.fileList = this.form.homeImg.map((url, idx) => ({ name: `图片${idx+1}`, url:process.env.VUE_APP_BASE_URL+url }))
  },
  methods: {
    getWxHomeConfig() {
      getWxHomeConfig().then(res => {
        this.form = res.data
        // 将字符串转换为数组（如果是字符串格式）
        if (typeof this.form.mallType === 'string') {
          this.form.mallType = this.form.mallType.split(',').filter(id => id)
        }
      })
    },
    getCategoryList() {
      getCategoryList().then(res => {
        this.categories = res.data
      })
    },
    getCategoryName(ids) {
      if (!Array.isArray(ids)) return ''
      return ids.map(id => {
        const category = this.categories.find(cat => cat.id === id)
        return category ? category.name : '未知分类'
      }).join('、')
    },
    handleUploadSuccess(res, file, fileList) {
        console.log(fileList)
        
      this.form.homeImg = fileList.map(f => {
            if(f.response){
                return process.env.VUE_APP_BASE_URL+ f.response.data.fileUrl
            }
            return f.url
        })
      console.log(this.form.homeImg)
    },
    handleRemove(file, fileList) {
      this.form.homeImg = fileList.map(f => f.url)
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件！')
      }
      return isImage
    },
    handleEdit() {
      this.isEdit = true
      this.backup = JSON.parse(JSON.stringify(this.form))
      this.fileList = this.form.homeImg.map((url, idx) => ({ name: `图片${idx+1}`, url }))
    },
    handleSave() {
      this.isEdit = false
      let config = {
        ...this.form,
        // 拼接成字符串
        homeImg: this.form.homeImg.join('、'),
        mallType: this.form.mallType.join(',') // 将数组转换为逗号分隔的字符串
      }
      updateHomeConfig(config.id, config).then(res => {
        this.$message.success('保存成功')
      })
    },
    handleCancel() {
      // 还原数据
      this.form = JSON.parse(JSON.stringify(this.backup))
      this.fileList = this.form.homeImg.map((url, idx) => ({ name: `图片${idx+1}`, url }))
      this.isEdit = false
    }
  }
}
</script>

<style scoped>
.system-config {
  padding: 20px;
}
</style>