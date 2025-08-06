import request from '@/utils/request'

// 上传文件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const upload = request({
    url: '/system/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  const res = {};
  upload().then(r => {
    r.url = process.env.VUE_APP_BASE_API + r.fileUrl
    res = r
  })
  return Promise.resolve(res)
} 