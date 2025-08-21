<template>
  <div class="system-config">
    <el-card>
      <el-form :model="form" label-width="160px" style="max-width: 800px;">
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
          <div v-else class="image-manager">
            <!-- 图片列表 -->
            <div class="image-list">
              <div 
                v-for="(url, index) in form.homeImg" 
                :key="index"
                class="image-item"
              >
                <div class="image-wrapper" :class="{ 'moving': movingIndex === index }">
                  <el-image
                    :src="url"
                    style="width: 120px; height: 60px;"
                    fit="cover"
                  />
                  <div class="image-actions">
                    <el-button 
                      size="mini" 
                      type="primary" 
                      icon="el-icon-arrow-up"
                      :disabled="index === 0"
                      @click="moveUp(index)"
                      title="上移"
                    ></el-button>
                    <el-button 
                      size="mini" 
                      type="primary" 
                      icon="el-icon-arrow-down"
                      :disabled="index === form.homeImg.length - 1"
                      @click="moveDown(index)"
                      title="下移"
                    ></el-button>
                    <el-button 
                      size="mini" 
                      type="danger" 
                      icon="el-icon-delete"
                      @click="removeImage(index)"
                      title="删除"
                    ></el-button>
                  </div>
                </div>
                <div class="image-index">{{ index + 1 }}</div>
              </div>
            </div>
            
            <!-- 上传区域 -->
            <div class="upload-area">
              <el-upload
                class="upload-demo"
                action="/api/system/file/upload"
                list-type="picture-card"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
                :headers="{'Token-Key': getToken()}"
                multiple
              >
                <i class="el-icon-plus"></i>
                <div class="upload-text">添加图片</div>
              </el-upload>
            </div>
            
            <div class="el-upload__tip">支持多图上传，建议尺寸 750x360px</div>
          </div>
        </el-form-item>
        <!-- <el-form-item label="商城分类类型">
          <div v-if="!isEdit">
            <span>{{ getCategoryName(form.mallType) }}</span>
          </div>
          <el-select v-else v-model="form.mallType" placeholder="请选择商城类型" multiple>
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id"></el-option>
          </el-select>
          <div class="el-upload__tip" slot="tip" v-if="isEdit">选择商城顶部分类栏的展示类型，可多选</div>
        </el-form-item> -->
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
      categories: [], // 商品分类列表
      movingIndex: -1 // 当前移动的图片索引
    }
  },
  created() {
    this.getWxHomeConfig()
    this.getCategoryList()
  },
  methods: {
    getWxHomeConfig() {
      getWxHomeConfig().then(res => {
        this.form = res.data
        // 将字符串转换为数组（如果是字符串格式）
        if (typeof this.form.mallType === 'string') {
          this.form.mallType = this.form.mallType.split(',').filter(id => id)
        }
        // 将homeImg字符串转换为数组
        if (typeof this.form.homeImg === 'string' && this.form.homeImg) {
          this.form.homeImg = this.form.homeImg.split('、').filter(url => url)
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
    handleUploadSuccess(res, file) {
      const imageUrl = process.env.VUE_APP_BASE_URL + res.data.fileUrl
      this.form.homeImg.push(imageUrl)
      this.$message.success('图片上传成功')
    },
    removeImage(index) {
      this.$confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.form.homeImg.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {
        // 用户取消删除
      })
    },
    moveUp(index) {
      if (index > 0) {
        this.movingIndex = index
        const temp = this.form.homeImg[index]
        this.form.homeImg[index] = this.form.homeImg[index - 1]
        this.form.homeImg[index - 1] = temp
        
        // 动画结束后清除状态
        setTimeout(() => {
          this.movingIndex = -1
        }, 300)
      }
    },
    moveDown(index) {
      if (index < this.form.homeImg.length - 1) {
        this.movingIndex = index
        const temp = this.form.homeImg[index]
        this.form.homeImg[index] = this.form.homeImg[index + 1]
        this.form.homeImg[index + 1] = temp
        
        // 动画结束后清除状态
        setTimeout(() => {
          this.movingIndex = -1
        }, 300)
      }
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
      this.isEdit = false
    }
  }
}
</script>

<style scoped>
.system-config {
  padding: 20px;
}

.image-manager {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.image-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-wrapper {
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.image-wrapper.moving {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.image-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 5px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.image-index {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.upload-area {
  margin-top: 10px;
}

.upload-demo {
  display: inline-block;
}

.upload-text {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.el-upload__tip {
  margin-top: 10px;
  color: #999;
  font-size: 12px;
}
</style> 