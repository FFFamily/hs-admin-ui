import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  // 商品分类管理
  {
    path: '/categories',
    component: Layout,
    redirect: '/categories/index',
    name: 'Categories',
    meta: { title: '商品分类管理', icon: 'tree' },
    children: [
      
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  },

  {
    path: '/wx/user/list',
    component: Layout,
    redirect: '/wx/user/list',
    children: [{
      path: 'list',
      name: 'List',
      component: () => import('@/views/wx/user/list'),
      meta: { title: 'List', icon: 'dashboard' }
    }]
  },
  {
    path: '/admin',
    component: Layout, // Layout 需根据你的实际布局组件名调整
    redirect: '/admin/user',
    name: 'Admin',
    meta: { title: '用户管理', icon: 'user' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '小程序用户管理', icon: 'user' }
      },
      {
        path: 'adminUser',
        name: 'AdminUser',
        component: () => import('@/views/admin/user/index.vue'),
        meta: { title: '后台用户管理', icon: 'user' }
      }
    ]
  },
  {
    path: '/invoice',
    component: Layout, // Layout 需根据你的实际布局组件名调整
    redirect: '/invoice/title',
    name: 'Invoice',
    meta: { title: '发票管理', icon: 'form' },
    children: [
      {
        path: 'title',
        name: 'InvoiceTitle',
        component: () => import('@/views/invoice/title/index.vue'),
        meta: { title: '发票抬头管理', icon: 'form' }
      },
      {
        path: 'list',
        name: 'InvoiceList',
        component: () => import('@/views/invoice/list/index.vue'),
        meta: { title: '发票管理', icon: 'table' }
      }
    ]
  },
  {
    path: '/system-dict',
    component: Layout, // Layout 需根据你的实际布局组件名调整
    name: 'SystemDict',
    meta: { title: '系统字典', icon: 'tree' },
    children: [
      {
        path: '',
        name: 'SystemDictMain',
        component: () => import('@/views/system/dict/index.vue'),
        meta: { title: '系统字典', icon: 'tree' }
      }
    ]
  },
  {
    path: '/system-config',
    component: Layout, // Layout 需根据你的实际布局组件名调整
    name: 'SystemConfig',
    meta: { title: '系统配置', icon: 'setting' },
    children: [
      {
        path: '',
        name: 'SystemConfigMain',
        component: () => import('@/views/system/config/index.vue'),
        meta: { title: '系统配置', icon: 'setting' }
      }
    ]
  },
  // 回收管理
  {
    path: '/recycle',
    component: Layout,
    redirect: '/recycle/goods',
    name: 'Recycle',
    meta: { title: '回收管理', icon: 'table' },
    children: [
      {
        path: 'contract',
        name: 'RentalContract',
        component: () => import('@/views/rental/contract/index.vue'),
        meta: { title: '合同管理', icon: 'form' }
      },
      {
        path: 'recycle',
        name: 'RentalRecycle',
        component: () => import('@/views/rental/recycle/index.vue'),
        meta: { title: '回收订单管理', icon: 'tree' }
      }
    ]
  },
  {
    path: '/rental',
    component: Layout,
    redirect: '/rental/goods',
    name: 'Rental',
    meta: { title: '租赁管理', icon: 'table' },
    children: [
      {
        path: 'goods',
        name: 'RentalGoods',
        component: () => import('@/views/rental/goods/index.vue'),
        meta: { title: '商品管理', icon: 'table' }
      },
      {
        path: 'index',
        name: 'CategoriesIndex',
        component: () => import('@/views/categories/index.vue'),
        meta: { title: '分类管理', icon: 'tree' }
      },
      {
        path: 'order',
        name: 'RentalOrder',
        component: () => import('@/views/rental/order/index.vue'),
        meta: { title: '租赁台账', icon: 'table' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true },
  {
    path: '/demo',
    component: Layout,
    redirect: '/demo/user-select',
    name: 'Demo',
    meta: { title: '组件演示', icon: 'example' },
    children: [
      {
        path: 'user-select',
        name: 'UserSelectDemo',
        component: () => import('@/views/demo/UserSelectDemo.vue'),
        meta: { title: '用户选择组件', icon: 'search' }
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
