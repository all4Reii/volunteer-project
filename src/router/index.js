import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/Auth/LoginView.vue'), meta: { title: '登录' } },
  { path: '/', name: 'Home', component: () => import('@/views/Home/HomeView.vue'), meta: { title: '首页' } },
  { path: '/activities', name: 'ActivityList', component: () => import('@/views/Activity/ActivityList.vue'), meta: { title: '志愿活动' } },
  { path: '/activity/:id', name: 'ActivityDetail', component: () => import('@/views/Activity/ActivityDetail.vue'), meta: { title: '活动详情' }, props: true },
  { path: '/activity/region/:region', name: 'ActivityByRegion', component: () => import('@/views/Activity/ActivityList.vue'), meta: { title: '按区域筛选' }, props: true },
  { path: '/register', name: 'Register', component: () => import('@/views/Register/RegisterView.vue'), meta: { title: '报名管理', requiresAuth: true } },
  { path: '/register/:activityId', name: 'ActivityRegister', component: () => import('@/views/Register/ActivityRegister.vue'), meta: { title: '活动报名', requiresAuth: true }, props: true },
  { path: '/service-records', name: 'ServiceRecords', component: () => import('@/views/Register/ServiceRecords.vue'), meta: { title: '服务时长', requiresAuth: true } },
  { path: '/certificates', name: 'Certificates', component: () => import('@/views/Certificate/CertificateView.vue'), meta: { title: '志愿者证书', requiresAuth: true } },
  { path: '/certificate/:id', name: 'CertificateDetail', component: () => import('@/views/Certificate/CertificateDetail.vue'), meta: { title: '证书详情' }, props: true },
  { path: '/styles', name: 'Style', component: () => import('@/views/Style/StyleView.vue'), meta: { title: '活动风采' } },
  { path: '/style/:id', name: 'StyleDetail', component: () => import('@/views/Style/StyleDetail.vue'), meta: { title: '风采详情' }, props: true },
  { path: '/ranking', name: 'Ranking', component: () => import('@/views/Ranking/RankingView.vue'), meta: { title: '积分排行榜' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.state.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
