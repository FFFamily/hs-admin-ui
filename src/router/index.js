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
    meta: { title: '后台管理', icon: 'user' },
    children: [
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import('@/views/admin/user/index.vue'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'role',
        name: 'AdminRole',
        component: () => import('@/views/admin/role/index.vue'),
        meta: { title: '角色管理', icon: 'tree' }
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
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
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
