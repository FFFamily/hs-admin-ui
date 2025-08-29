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
    path: '/base',
    component: Layout,
    redirect: '/base/business-scope',
    name: 'Base',
    meta: { title: '基础数据管理', icon: 'table' },
    children: [
      {
        path: '',
        name: 'SystemConfigMain',
        component: () => import('@/views/system/config/index.vue'),
        meta: { title: '首页新闻管理', icon: 'el-icon-setting' }
      },
      {
        path: 'userType',
        name: 'UserType',
        component: () => import('@/views/system/accountType/index.vue'),
        meta: { title: '账号类型管理', icon: 'user' }
      },
      {
        path: 'business-scope',
        name: 'BusinessScope',
        component: () => import('@/views/recycle/business-scope/index.vue'),
        meta: { title: '经营范围管理', icon: 'tree' }
      },
      {
        path: 'address',
        name: 'Address',
        component: () => import('@/views/system/address/index.vue'),
        meta: { title: '地址管理', icon: 'el-icon-location' }
      }
    ]
  },
  {
    path: '/admin',
    component: Layout, // Layout 需根据你的实际布局组件名调整
    redirect: '/admin/user',
    name: 'Admin',
    meta: { title: '用户管理', icon: 'user' },
    children: [
      {
        path: 'adminUser',
        name: 'AdminUser',
        component: () => import('@/views/admin/user/index.vue'),
        meta: { title: '后台账号管理', icon: 'user' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/account/index.vue'),
        meta: { title: '用户账号管理', icon: 'user' }
      },
      {
        path: 'processor',
        name: 'Processor',
        component: () => import('@/views/admin/processor/index.vue'),
        meta: { title: '用户经办人管理', icon: 'user' }
      },
      {
        path: 'bank',
        name: 'Bank',
        component: () => import('@/views/system/bankInfo/index.vue'),
        meta: { title: '银行账号管理', icon: 'user' }
      },
      {
        path: 'title',
        name: 'InvoiceTitle',
        component: () => import('@/views/invoice/title/index.vue'),
        meta: { title: '发票抬头管理', icon: 'form' }
      }
    ]
  },
  {
    path: '/recycle',
    component: Layout,
    redirect: '/recycle/goods',
    name: 'Recycle',
    meta: { title: '合同管理', icon: 'table' },
    children: [
      {
        path: 'contract',
        name: 'ContractRecycle',
        component: () => import('@/views/recycle/constract/index.vue'),
        meta: { title: '合同管理', icon: 'form' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/transportOrder',
    name: 'Order',
    meta: { title: '订单管理', icon: 'el-icon-s-order' },
    children: [
      // 采购订单
      {
        path: 'purchaseOrder',
        name: 'PurchaseOrder',
        component: () => import('@/views/recycle/order/index.vue'),
        meta: { title: '订单管理', icon: 'table' }
      },
      {
        path: 'fundflow',
        name: 'FundFlow',
        component: () => import('@/views/recycle/order/fundflow/index.vue'),
        meta: { title: '走款管理', icon: 'table' }
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
    path: '/finance',
    component: Layout,
    redirect: '/finance/fundflow',
    name: 'Finance',
    meta: { title: '资金池管理', icon: 'table' },
    children: [
      
      {
        path: 'capitalpool',
        name: 'CapitalPool',
        component: () => import('@/views/finance/capitalpool/index.vue'),
        meta: { title: '资金池管理', icon: 'el-icon-coin' }
      }
    ]
  },
  // 报表管理
  {
    path: '/report',
    component: Layout,
    redirect: '/report/fundflow',
    name: 'Report',
    meta: { title: '报表管理', icon: 'table' },
  },
  // 模板管理
  {
    path: '/template',
    component: Layout,
    redirect: '/template/fundflow',
    name: 'Template',
    meta: { title: '模板管理', icon: 'table' },
  },
  {
    path: '/rental',
    component: Layout,
    redirect: '/rental/goods',
    name: 'Rental',
    meta: { title: '租赁管理', icon: 'el-icon-s-goods' },
    children: [
      {
        path: 'index',
        name: 'CategoriesIndex',
        component: () => import('@/views/categories/index.vue'),
        meta: { title: '租赁分类管理', icon: 'tree' }
      },
      {
        path: 'contract',
        name: 'RentalContract',
        component: () => import('@/views/rental/contract/index.vue'),
        meta: { title: '租赁合同管理', icon: 'form' }
      },
      {
        path: 'goods',
        name: 'RentalGoods',
        component: () => import('@/views/rental/goods/index.vue'),
        meta: { title: '租赁商品管理', icon: 'table' }
      },
      {
        path: 'order',
        name: 'RentalOrder',
        component: () => import('@/views/rental/order/index.vue'),
        meta: { title: '租赁执行管理', icon: 'table' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  }
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
