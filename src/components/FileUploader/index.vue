<template>
  <div class="file-uploader">
    <el-upload
      class="upload-demo"
      drag
      :action="action"
      :headers="computedHeaders"
      :file-list="internalFileList"
      :limit="limit"
      :multiple="multiple"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :on-exceed="onExceed"
      :show-file-list="showFileList"
      :accept="accept"
      :disabled="disabled"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        <span v-if="templateUrl" class="template-link">
          <a :href="templateUrl" target="_blank" @click.stop="downloadTemplate">
            {{ templateText || '下载模板' }}
          </a>
          后，
        </span>
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div v-if="tips" class="el-upload__tip" slot="tip">{{ tips }}</div>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'FileUploader',
  props: {
    value: {
      // 单文件：String，多文件：Array<String>
      type: [String, Array],
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 1
    },
    action: {
      type: String,
      default: '/api/system/file/upload'
    },
    headers: {
      type: Object,
      default: () => ({})
    },
    maxSizeMB: {
      type: Number,
      default: 10
    },
    tips: {
      type: String,
      default: ''
    },
    showFileList: {
      type: Boolean,
      default: true
    },
    accept: {
      type: String,
      default: '.xlsx,.xls,.csv,.txt,.doc,.docx,.pdf'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    templateUrl: {
      type: String,
      default: ''
    },
    templateText: {
      type: String,
      default: '下载模板'
    },
    baseUrl: {
      type: String,
      default: () => process.env.VUE_APP_BASE_URL || ''
    },
    emitRaw: {
      // 是否向外部输出后端返回的原始 fileUrl（相对/接口地址）。
      // 若为 false，则向外部输出拼接后的完整可访问 URL。
      type: Boolean,
      default: true
    }
  },
  computed: {
    internalFileList() {
      if (this.multiple) {
        const urls = Array.isArray(this.value) ? this.value : (this.value ? [this.value] : [])
        return urls.map((raw, idx) => ({ name: `文件${idx + 1}`, url: this.resolveDisplayUrl(raw), rawUrl: raw }))
      }
      if (typeof this.value === 'string' && this.value) {
        return [{ name: '文件', url: this.resolveDisplayUrl(this.value), rawUrl: this.value }]
      }
      return []
    },
    computedHeaders() {
      // 默认加上 Token-Key，允许外部 headers 覆盖
      return { 'Token-Key': getToken(), ...this.headers }
    }
  },
  methods: {
    isAbsoluteUrl(url) {
      return /^(?:[a-z]+:)?\/\//i.test(url) || /^data:/i.test(url)
    },
    resolveDisplayUrl(rawUrl) {
      if (!rawUrl) return ''
      if (this.isAbsoluteUrl(rawUrl)) return rawUrl
      const base = (this.baseUrl || '').replace(/\/$/, '')
      const path = String(rawUrl).startsWith('/') ? rawUrl : `/${rawUrl}`
      return `${base}${path}`
    },
    toRawUrlFromDisplay(displayUrl) {
      if (!displayUrl) return ''
      if (!this.baseUrl) return displayUrl
      const base = (this.baseUrl || '').replace(/\/$/, '')
      if (displayUrl.startsWith(base)) {
        const maybe = displayUrl.slice(base.length)
        return maybe.startsWith('/') ? maybe : `/${maybe}`
      }
      return displayUrl
    },
    beforeUpload(file) {
      const isLt = file.size / 1024 / 1024 < this.maxSizeMB

      if (!isLt) {
        this.$message.error(`上传文件大小不能超过 ${this.maxSizeMB}MB!`)
        return false
      }
      
      // 触发 before-upload 事件，允许父组件进行额外验证
      this.$emit('before-upload', file)
      return true
    },
    onSuccess(response, file, fileList) {
      if (!response || (response.code !== 200 && response.code !== '200')) {
        this.$message.error('上传失败')
        this.$emit('error', response)
        return
      }
      const rawUrl = (response.data && (response.data.fileUrl || response.data.url)) || ''
      if (!rawUrl) {
        this.$message.error('上传返回数据缺少文件地址')
        return
      }
      const emitValue = this.emitRaw ? rawUrl : this.resolveDisplayUrl(rawUrl)
      if (this.multiple) {
        const current = Array.isArray(this.value) ? this.value.slice() : []
        current.push(emitValue)
        // 受限于 limit
        const limited = current.slice(0, this.limit)
        this.$emit('input', limited)
      } else {
        this.$emit('input', emitValue)
      }
      this.$emit('success', emitValue, file, fileList)
      this.$message.success('上传成功')
    },
    onError(err) {
      // 透传错误
      // eslint-disable-next-line no-console
      console.error('上传失败:', err)
      this.$message.error('上传失败')
      this.$emit('error', err)
    },
    onRemove(file, fileList) {
      if (this.multiple) {
        const urls = (fileList || []).map(item => {
          // 优先使用我们放进去的 rawUrl，其次用 response，再次从显示 URL 反推原始路径
          return item.rawUrl || (item.response && item.response.data && (item.response.data.fileUrl || item.response.data.url)) || this.toRawUrlFromDisplay(item.url)
        })
        const mapped = (this.emitRaw ? urls : urls.map(u => this.resolveDisplayUrl(u))).filter(Boolean)
        this.$emit('input', mapped)
      } else {
        this.$emit('input', this.emitRaw ? '' : '')
      }
      this.$emit('remove', file, fileList)
    },
    onExceed(files, fileList) {
      this.$message.warning(`最多只能上传 ${this.limit} 个文件`)
      this.$emit('exceed', files, fileList)
    },
    downloadTemplate() {
      this.$emit('download-template', this.templateUrl)
    }
  }
}
</script>

<style scoped>
.file-uploader {
  width: 100%;
}

.template-link {
  color: #409eff;
}

.template-link a {
  color: #409eff;
  text-decoration: none;
}

.template-link a:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style> 