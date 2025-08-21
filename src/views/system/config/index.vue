<template>
  <el-card>
    <el-row :gutter="15">
          <el-col :span="6" v-for="(url, index) in form.homeImg" :key="url" :offset="0">
            <el-card :body-style="{ padding: '0px' }">
              <img src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                class="image">
              <div style="padding: 14px;">
                <div class="bottom clearfix">
                  <el-button size="mini" type="primary" :disabled="index === 0" @click="moveUp(index)">上移</el-button>
                  <el-button size="mini" type="primary" :disabled="index === form.homeImg.length - 1"
                    @click="moveDown(index)">下移</el-button>
                  <el-button size="mini" type="danger" @click="removeImage(index)">删除</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div class="upload-area">
          <el-upload class="upload-demo" action="/api/system/file/upload" list-type="picture-card"
            :show-file-list="false" :on-success="handleUploadSuccess" :before-upload="beforeUpload"
            :headers="{ 'Token-Key': getToken() }" multiple>
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
        <el-button type="primary" @click="handleSave">保存</el-button>
  </el-card>




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
    handleSave() {
      let config = {
        ...this.form,
        // 拼接成字符串
        homeImg: this.form.homeImg.join('、'),
        mallType: this.form.mallType.join(',') // 将数组转换为逗号分隔的字符串
      }
      updateHomeConfig(config.id, config).then(res => {
        this.$message.success('保存成功')
      })
    }
  }
}
</script>

<style scoped>

.image-manager {
  width: 100%;
}

.image-col {
  margin-bottom: 15px;
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






.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}
</style>