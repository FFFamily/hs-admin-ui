# Vue Admin Template

## 项目简介

这是一个基于 Vue.js 和 Element UI 的后台管理系统模板，提供了完整的用户管理、权限控制、合同管理等功能。

## 新增功能

### UserSelector 用户选择器组件

最近新增了一个功能强大的用户选择器组件，位于 `src/components/UserSelector/` 目录下。

#### 主要特性

- 🎯 **单选/多选模式** - 支持单选和多选两种选择模式
- 🔍 **智能搜索** - 支持按昵称、OpenID、城市等字段搜索
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🎨 **美观界面** - 基于 Element UI 的现代化设计
- ✅ **选中效果** - 清晰的选中状态显示
- 📄 **分页支持** - 大数据量时的分页显示
- 🔒 **权限控制** - 支持禁用特定用户选择

#### 使用方法

1. **引入组件**
```javascript
import UserSelector from '@/components/UserSelector'
```

2. **基础用法**
```vue
<UserSelector
  :visible.sync="selectorVisible"
  title="选择用户"
  :multiple="false"
  @confirm="handleConfirm"
/>
```

3. **查看完整示例**
访问路由 `/demo/user-select` 查看详细的使用示例和演示。

#### 组件文档

详细的组件使用说明请查看：`src/components/UserSelector/README.md`

## 项目结构

```
vue-admin-template/
├── src/
│   ├── components/          # 公共组件
│   │   ├── UserSelector/   # 用户选择器组件 ✨
│   │   ├── Breadcrumb/     # 面包屑导航
│   │   ├── Hamburger/      # 汉堡菜单
│   │   ├── SvgIcon/        # SVG图标
│   │   └── ImageUploader/  # 图片上传
│   ├── views/              # 页面组件
│   │   ├── demo/           # 演示页面
│   │   │   └── UserSelectDemo.vue  # 用户选择器演示 ✨
│   │   ├── admin/          # 管理员页面
│   │   ├── user/           # 用户管理
│   │   ├── rental/         # 租赁管理
│   │   └── system/         # 系统管理
│   ├── api/                # API接口
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   └── utils/              # 工具函数
├── mock/                   # 模拟数据
└── public/                 # 静态资源
```

## 快速开始

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **构建生产版本**
```bash
npm run build
```

## 技术栈

- **前端框架**: Vue.js 2.x
- **UI组件库**: Element UI
- **路由管理**: Vue Router
- **状态管理**: Vuex
- **构建工具**: Vue CLI
- **样式预处理**: SCSS
- **HTTP客户端**: Axios

## 主要功能模块

- 🔐 **用户认证** - 登录、登出、权限验证
- 👥 **用户管理** - 用户增删改查、角色分配
- 📋 **合同管理** - 合同创建、编辑、状态管理
- 🏪 **租赁管理** - 商品管理、订单管理、分类管理
- ♻️ **回收管理** - 回收订单、经营范围管理
- ⚙️ **系统配置** - 字典管理、系统参数配置
- 📊 **数据统计** - 仪表盘、数据可视化

## 开发指南

### 添加新页面

1. 在 `src/views/` 目录下创建新的页面组件
2. 在 `src/router/index.js` 中添加路由配置
3. 在 `src/api/` 目录下添加相应的API接口

### 添加新组件

1. 在 `src/components/` 目录下创建组件
2. 创建组件的导出文件 `index.js`
3. 在需要使用的页面中引入组件

### 样式规范

- 使用 SCSS 预处理器
- 遵循 BEM 命名规范
- 优先使用 Element UI 的样式变量

## 部署说明

### 环境配置

- 开发环境: `npm run dev`
- 测试环境: `npm run build:stage`
- 生产环境: `npm run build`

### 部署脚本

项目提供了自动部署脚本 `deploy.sh`，支持一键部署到服务器。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 项目讨论区

---

**注意**: 这是一个持续开发的项目，新功能和改进会定期更新。请关注项目的更新日志。 