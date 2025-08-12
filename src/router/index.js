import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
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
      meta: { title: '首页', icon: 'dashboard' }
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
  // 合同管理
  {
    path: '/contract',
    component: Layout,
    redirect: '/contract/index',
    name: 'Contract',
    meta: { title: '合同管理', icon: 'form' },
    children: [
      {
        path: 'index',
        name: 'ContractIndex',
        component: () => import('@/views/rental/contract/index.vue'),
        meta: { title: '合同管理', icon: 'form' }
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
        path: 'recycle',
        name: 'RentalRecycle',
        component: () => import('@/views/recycle/order/index.vue'),
        meta: { title: '回收订单管理', icon: 'tree' }
      },
      {
        path: 'business-scope',
        name: 'BusinessScope',
        component: () => import('@/views/recycle/business-scope/index.vue'),
        meta: { title: '经营范围管理', icon: 'tree' }
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
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
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
