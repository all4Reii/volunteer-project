import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/Auth/LoginView.vue'), meta: { title: '登录' } },
  { path: '/', name: 'Home', component: () => import('@/views/Home/HomeView.vue'), meta: { title: '首页' } },

  // =====================
  // 👤 志愿者 + 管理员通用
  // =====================
  { path: '/activities', name: 'ActivityList', component: () => import('@/views/Activity/ActivityList.vue'), meta: { title: '志愿活动', roles: ['volunteer', 'admin'] } },
  { path: '/activity/:id', name: 'ActivityDetail', component: () => import('@/views/Activity/ActivityDetail.vue'), meta: { title: '活动详情', roles: ['volunteer', 'admin'] }, props: true },
  { path: '/activity/region/:region', name: 'ActivityByRegion', component: () => import('@/views/Activity/ActivityList.vue'), meta: { title: '按区域筛选', roles: ['volunteer', 'admin'] }, props: true },

  // =====================
  // 👤 志愿者专属
  // =====================
  { path: '/register/:activityId', name: 'ActivityRegister', component: () => import('@/views/Register/ActivityRegister.vue'), meta: { title: '活动报名', requiresAuth: true, roles: ['volunteer'] }, props: true },
  { path: '/service-records', name: 'ServiceRecords', component: () => import('@/views/Register/ServiceRecords.vue'), meta: { title: '服务时长', requiresAuth: true, roles: ['volunteer'] } },
  { path: '/certificates', name: 'Certificates', component: () => import('@/views/Certificate/CertificateView.vue'), meta: { title: '志愿者证书', requiresAuth: true, roles: ['volunteer'] } },

  // =====================
  // 👑 管理员专属
  // =====================
  { path: '/register', name: 'AdminRegistrations', component: () => import('@/views/Register/RegisterView.vue'), meta: { title: '报名审核', requiresAuth: true, roles: ['admin'] } },
  { path: '/service-records', name: 'ServiceRecords', component: () => import('@/views/Register/ServiceRecords.vue'), meta: { title: '服务时长', requiresAuth: true, roles: ['admin'] } },
  { path: '/service-records/manage', name: 'AdminServiceRecords', component: () => import('@/views/Register/ServiceRecords.vue'), meta: { title: '服务时长管理', requiresAuth: true, roles: ['admin'] } },

  // =====================
  // 公共页面
  // =====================
  { path: '/certificate/:id', name: 'CertificateDetail', component: () => import('@/views/Certificate/CertificateDetail.vue'), meta: { title: '证书详情' }, props: true },
  { path: '/styles', name: 'Style', component: () => import('@/views/Style/StyleView.vue'), meta: { title: '活动风采' } },
  { path: '/style/:id', name: 'StyleDetail', component: () => import('@/views/Style/StyleDetail.vue'), meta: { title: '风采详情' }, props: true },
  { path: '/ranking', name: 'Ranking', component: () => import('@/views/Ranking/RankingView.vue'), meta: { title: '积分排行榜' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 🔐 全局路由守卫（RBAC核心）
 */
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const role = user.role

  // 1. 登录校验
  if (to.meta.requiresAuth && !store.state.isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 2. 角色校验（核心）
  if (to.meta.roles && !to.meta.roles.includes(role)) {
    return next('/') // 无权限回首页
  }

  next()
})

export default router