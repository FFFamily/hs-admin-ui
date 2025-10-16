# 字典管理模块实现说明

## 概述

字典管理模块已完整实现，用于统一管理系统中的各类字典数据，提供了完善的字典类型和字典项管理功能。

## 实现内容

### 1. 页面组件

#### `/src/views/system/dict/index.vue`
完整的字典管理主页面，包含：
- ✅ 左右分栏布局（字典类型 + 字典项）
- ✅ 字典类型的增删改查
- ✅ 字典项的增删改查
- ✅ 搜索和分页功能
- ✅ 表单验证和友好的交互体验

#### `/src/views/system/dict/example.vue`
字典使用示例页面，展示了：
- ✅ 使用 Mixin 方式
- ✅ 使用全局方法
- ✅ 在表格中使用
- ✅ 使用过滤器
- ✅ 动态加载字典

### 2. API 接口

#### `/src/api/dict.js`
提供了完整的字典相关 API：

**字典类型接口：**
- `getDictTypeList()` - 获取字典类型列表
- `createDictType()` - 创建字典类型
- `updateDictType()` - 更新字典类型
- `deleteDictType()` - 删除字典类型
- `getDictTypeById()` - 获取字典类型详情

**字典项接口：**
- `getDictItemPage()` - 分页获取字典项列表
- `getDictItemsByTypeCode()` - 根据类型编码获取字典项列表
- `createDictItem()` - 创建字典项
- `updateDictItem()` - 更新字典项
- `deleteDictItem()` - 删除字典项
- `getDictItemById()` - 获取字典项详情
- `batchDeleteDictItems()` - 批量删除字典项
- `updateDictItemSort()` - 更新字典项排序

### 3. 工具类

#### `/src/utils/dict.js`
字典工具类，提供：

**核心功能：**
- ✅ 字典数据缓存机制
- ✅ 便捷的获取方法
- ✅ Vue 插件支持
- ✅ 全局方法注入
- ✅ 全局过滤器
- ✅ Mixin 支持

**提供的方法：**
```javascript
// 基础方法
getDictData(typeCode, forceRefresh)    // 获取字典数据（带缓存）
getDictLabel(typeCode, value)          // 获取标签文本
getDictValue(typeCode, label)          // 获取字典值
getDictMap(typeCode)                   // 转换为 Map
getDictObject(typeCode)                // 转换为 Object
clearDictCache(typeCode)               // 清除缓存
preloadDicts(typeCodes)                // 预加载字典

// Vue 实例方法（已注入）
this.$getDictData()
this.$getDictLabel()
this.$getDictValue()
this.$getDictMap()
this.$getDictObject()
this.$clearDictCache()

// 全局过滤器
{{ value | dictLabel('type_code') }}
```

**Mixin 使用：**
```javascript
import { dictMixin } from '@/utils/dict'

export default {
  mixins: [dictMixin],
  dicts: ['gender', 'order_status'],
  
  methods: {
    example() {
      // 直接使用 this.dict
      console.log(this.dict.gender)
      
      // 使用 mixin 方法
      const label = this.getDictLabel('gender', '1')
    }
  }
}
```

### 4. 路由配置

#### `/src/router/index.js`
已添加系统管理模块路由：

```javascript
{
  path: '/system',
  component: Layout,
  redirect: '/system/dict',
  name: 'System',
  meta: { title: '系统管理', icon: 'el-icon-setting' },
  children: [
    {
      path: 'dict',
      name: 'SystemDict',
      component: () => import('@/views/system/dict/index.vue'),
      meta: { title: '字典管理', icon: 'el-icon-s-grid' }
    }
  ]
}
```

### 5. 插件注册

#### `/src/main.js`
已注册字典插件，全局可用：

```javascript
import DictPlugin from '@/utils/dict'
Vue.use(DictPlugin)
```

## 使用指南

### 方式一：使用 Mixin（推荐）

```vue
<template>
  <div>
    <el-select v-model="form.gender">
      <el-option
        v-for="item in dict.gender"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    
    <div>选择的值：{{ getDictLabel('gender', form.gender) }}</div>
  </div>
</template>

<script>
import { dictMixin } from '@/utils/dict'

export default {
  mixins: [dictMixin],
  dicts: ['gender', 'order_status'], // 自动加载
  
  data() {
    return {
      form: { gender: '' }
    }
  }
}
</script>
```

### 方式二：使用全局方法

```vue
<script>
export default {
  data() {
    return {
      genderOptions: []
    }
  },
  
  async created() {
    // 获取字典数据
    this.genderOptions = await this.$getDictData('gender')
    
    // 获取标签文本
    const label = await this.$getDictLabel('gender', '1')
    console.log(label) // 输出：男
  }
}
</script>
```

### 方式三：使用过滤器

```vue
<template>
  <div>
    <!-- 将字典值转换为标签显示 -->
    <span>{{ row.gender | dictLabel('gender') }}</span>
    <span>{{ row.status | dictLabel('order_status') }}</span>
  </div>
</template>
```

### 方式四：手动导入

```javascript
import { getDictData, getDictLabel } from '@/utils/dict'

export default {
  async created() {
    const data = await getDictData('gender')
    const label = await getDictLabel('gender', '1')
  }
}
```

## 数据结构

### 字典类型（DictType）

```javascript
{
  id: 1,                              // 主键ID
  name: "性别",                       // 类型名称
  code: "gender",                     // 类型编码（唯一，不可修改）
  remark: "用户性别分类",             // 备注
  createTime: "2024-01-01 10:00:00", // 创建时间
  updateTime: "2024-01-01 10:00:00"  // 更新时间
}
```

### 字典项（DictItem）

```javascript
{
  id: 1,                              // 主键ID
  typeId: 1,                          // 所属类型ID
  typeCode: "gender",                 // 所属类型编码
  label: "男",                        // 字典项名称（显示文本）
  value: "1",                         // 字典项值（实际存储值）
  sort: 1,                            // 排序（越小越靠前）
  remark: "男性",                     // 备注
  createTime: "2024-01-01 10:00:00", // 创建时间
  updateTime: "2024-01-01 10:00:00"  // 更新时间
}
```

## 后端接口规范

### 接口地址

所有接口基于 `/api/dict` 前缀：

#### 字典类型接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dict/type/list` | 获取字典类型列表 |
| POST | `/api/dict/type/create` | 创建字典类型 |
| PUT | `/api/dict/type/update` | 更新字典类型 |
| DELETE | `/api/dict/type/delete/:id` | 删除字典类型 |
| GET | `/api/dict/type/:id` | 获取字典类型详情 |

#### 字典项接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dict/item/page` | 分页获取字典项列表 |
| GET | `/api/dict/item/list/:typeCode` | 根据类型编码获取字典项列表 |
| POST | `/api/dict/item/create` | 创建字典项 |
| PUT | `/api/dict/item/update` | 更新字典项 |
| DELETE | `/api/dict/item/delete/:id` | 删除字典项 |
| GET | `/api/dict/item/:id` | 获取字典项详情 |
| DELETE | `/api/dict/item/batch/delete` | 批量删除字典项 |
| PUT | `/api/dict/item/sort/update` | 更新字典项排序 |

### 响应格式

```javascript
{
  code: 200,        // 状态码（200 或 0 表示成功）
  message: "成功",  // 消息
  data: {}          // 数据
}
```

## 功能特性

### ✅ 已实现的功能

1. **字典类型管理**
   - 新增、编辑、删除字典类型
   - 搜索字典类型（支持名称和编码）
   - 类型编码创建后不可修改
   - 删除类型时级联删除字典项

2. **字典项管理**
   - 新增、编辑、删除字典项
   - 搜索字典项（支持名称和值）
   - 分页展示
   - 排序支持

3. **数据缓存**
   - 智能缓存机制
   - 手动刷新缓存
   - 性能优化

4. **多种使用方式**
   - Mixin 方式
   - 全局方法
   - 过滤器
   - 手动导入

5. **友好的交互**
   - 左右分栏布局
   - 表单验证
   - 操作确认
   - 加载状态
   - 错误提示

### 🚀 未来可扩展的功能

1. 字典数据导入/导出
2. 字典使用统计
3. 字典数据版本控制
4. 多语言支持
5. 字典数据审计日志
6. 字典数据权限控制

## 注意事项

⚠️ **重要提示：**

1. **类型编码不可修改**：字典类型编码创建后不能修改，请在创建时仔细确认
2. **级联删除**：删除字典类型会同时删除该类型下的所有字典项，请谨慎操作
3. **依赖检查**：删除前请确认该字典是否被业务系统使用
4. **缓存机制**：字典数据有缓存，修改后如需立即生效请手动刷新缓存

## 测试建议

### 1. 基础功能测试

- [ ] 创建字典类型
- [ ] 编辑字典类型
- [ ] 删除字典类型
- [ ] 搜索字典类型
- [ ] 创建字典项
- [ ] 编辑字典项
- [ ] 删除字典项
- [ ] 搜索字典项
- [ ] 分页功能

### 2. 使用场景测试

- [ ] 在下拉框中使用
- [ ] 在表格中显示
- [ ] 使用过滤器
- [ ] 使用 Mixin
- [ ] 使用全局方法
- [ ] 缓存功能测试

### 3. 边界情况测试

- [ ] 编码重复校验
- [ ] 必填项校验
- [ ] 删除确认
- [ ] 空数据处理
- [ ] 网络错误处理

## 文档

- [字典管理详细说明](/src/views/system/dict/README.md)
- [使用示例页面](/src/views/system/dict/example.vue)

## 联系方式

如有问题或建议，请联系开发团队。

