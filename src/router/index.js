// router/index.js 控制页面访问
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  // =====================
  // 认证相关
  // =====================
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('@/views/Auth/LoginView.vue'), 
    meta: { title: '登录' } 
  },
  { 
    path: '/', 
    name: 'Home', 
    component: () => import('@/views/Home/HomeView.vue'), 
    meta: { title: '首页' } 
  },

  // =====================
  // 志愿者 + 管理员通用
  // =====================
  { 
    path: '/activities', 
    name: 'ActivityList', 
    component: () => import('@/views/Activity/ActivityList.vue'), 
    meta: { title: '志愿活动', roles: ['volunteer', 'admin'] } 
  },
  { 
    path: '/activity/:id', 
    name: 'ActivityDetail', 
    component: () => import('@/views/Activity/ActivityDetail.vue'), 
    meta: { title: '活动详情', roles: ['volunteer', 'admin'] }, 
    props: true 
  },
  { 
    path: '/activity/region/:region', 
    name: 'ActivityByRegion', 
    component: () => import('@/views/Activity/ActivityList.vue'), 
    meta: { title: '按区域筛选', roles: ['volunteer', 'admin'] }, 
    props: true 
  },

  // =====================
  // 报名管理（根据角色显示不同内容）
  // =====================
  { 
    path: '/register', 
    name: 'Register', 
    component: () => import('@/views/Register/RegisterView.vue'), 
    meta: { 
      title: '报名管理', 
      requiresAuth: true, 
      roles: ['volunteer', 'admin']  // 两个角色都可以访问
    } 
  },

  // =====================
  // 服务时长（根据角色显示不同内容）
  // =====================
  { 
    path: '/service-records', 
    name: 'ServiceRecords', 
    component: () => import('@/views/Register/ServiceRecords.vue'), 
    meta: { 
      title: '服务时长', 
      requiresAuth: true, 
      roles: ['volunteer', 'admin']  // 两个角色都可以访问，组件内根据角色显示不同内容
    } 
  },

  // =====================
  // 证书相关
  // =====================
  { 
    path: '/certificates', 
    name: 'Certificates', 
    component: () => import('@/views/Certificate/CertificateView.vue'), 
    meta: { 
      title: '志愿者证书', 
      requiresAuth: true, 
      roles: ['volunteer']  // 只有志愿者可以查看自己的证书
    } 
  },
  { 
    path: '/certificate/:id', 
    name: 'CertificateDetail', 
    component: () => import('@/views/Certificate/CertificateDetail.vue'), 
    meta: { title: '证书详情' }, 
    props: true 
  },

  // =====================
  // 公共页面
  // =====================
  { 
    path: '/styles', 
    name: 'Style', 
    component: () => import('@/views/Style/StyleView.vue'), 
    meta: { title: '活动风采' } 
  },
  { 
    path: '/style/:id', 
    name: 'StyleDetail', 
    component: () => import('@/views/Style/StyleDetail.vue'), 
    meta: { title: '风采详情' }, 
    props: true 
  },
  { 
    path: '/ranking', 
    name: 'Ranking', 
    component: () => import('@/views/Ranking/RankingView.vue'), 
    meta: { title: '积分排行榜' } 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局路由守卫（RBAC核心） 每次页面跳转的时候都会调用 决定用户能否访问某个页面
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 志愿服务平台`
  }

  // 从 localStorage 获取用户
  let user = {}
  let role = 'volunteer'  // 默认角色
  
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user = JSON.parse(userStr)
      role = user.role || 'volunteer'
    }
  } catch (e) {
    console.warn('解析用户信息失败:', e)
  }

  // 1️⃣ 登录校验
  if (to.meta.requiresAuth) {
    const isLoggedIn = store.state.isLoggedIn || !!user.token
    
    if (!isLoggedIn) {
      return next({ 
        path: '/login', 
        query: { redirect: to.fullPath } 
      })
    }
  }

  // 2️⃣ 角色校验（RBAC核心）
  if (to.meta.roles && to.meta.roles.length > 0) {
    // 检查用户角色是否在允许列表中
    if (!to.meta.roles.includes(role)) {
      // 权限不足，跳转到首页
      return next('/')
    }
  }

  // 3️⃣ 已登录访问登录页，跳转首页
  const isLoggedIn = store.state.isLoggedIn || !!user.token
  if (to.path === '/login' && isLoggedIn) {
    return next('/')
  }

  next()
})

export default router