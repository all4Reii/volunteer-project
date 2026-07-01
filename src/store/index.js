// store/index.js
import { createStore } from 'vuex'
import { 
  activityAPI, registrationAPI, serviceRecordAPI, 
  certificateAPI, rankingAPI, styleAPI, authAPI 
} from '@/api'

//数据仓库
export default createStore({
  state: {
    users: [],
    activities: [],
    currentActivity: null,
    registrations: [],
    serviceRecords: [],
    certificates: [],
    rankings: [],
    styles: [],
    currentUser: null,
    isLoggedIn: false,
    loading: false
  },
  
  // mutations（唯一修改数据的方式）
  mutations: {
    SET_USERS(state, list) {
      state.users = list
    },
    SET_CURRENT_USER(state, user) { 
      state.currentUser = user
      state.isLoggedIn = !!user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    LOGOUT(state) { 
      state.currentUser = null
      state.isLoggedIn = false
      localStorage.removeItem('user')
    },
    SET_LOADING(state, val) { state.loading = val },
    SET_ACTIVITIES(state, list) { state.activities = list },
    SET_CURRENT_ACTIVITY(state, obj) { state.currentActivity = obj },
    SET_REGISTRATIONS(state, list) { state.registrations = list },
    ADD_REGISTRATION(state, item) { state.registrations.unshift(item) },
    UPDATE_REGISTRATION(state, { id, data }) {
      const idx = state.registrations.findIndex(r => r.id === id)
      if (idx !== -1) Object.assign(state.registrations[idx], data)
    },
    //从 Vuex 的报名列表里删除一条记录
    CANCEL_REGISTRATION(state, item) {
      const index = state.registrations.findIndex(r => r.id === item.id)
      if (index !== -1) {
        state.registrations.splice(index, 1)
      }
    },
    SET_SERVICE_RECORDS(state, list) { state.serviceRecords = list },
    ADD_SERVICE_RECORD(state, item) { state.serviceRecords.unshift(item) },
    SET_CERTIFICATES(state, list) { state.certificates = list },
    ADD_CERTIFICATE(state, item) { state.certificates.unshift(item) },
    SET_RANKINGS(state, list) { state.rankings = list },
    SET_STYLES(state, list) { state.styles = list }
  },
  
  // 处理业务逻辑 + 异步请求
  actions: {
    // 志愿者登录
    async login({ commit }, { phone, password }) {
      try {
        const res = await authAPI.login()
        const users = res.data || []
        const user = users.find(u => u.phone === phone)
        
        if (!user || user.password !== password) {
          throw new Error('手机号或密码错误')
        }
        
        // 添加角色标识
        const userWithRole = {
          ...user,
          role: 'volunteer'
        }
        
        commit('SET_CURRENT_USER', userWithRole)
        return userWithRole
      } catch (e) {
        if (e.message === '手机号或密码错误') throw e
        throw new Error('网络请求失败，请检查服务是否启动')
      }
    },

    // 管理员登录
    async adminLogin({ commit }, { phone, password }) {
      try {
        const res = await authAPI.getAdmins() // 需要新增这个 API 方法
        const admins = res.data || []
        
        // 从 admins 数组中查找
        const admin = admins.find(a => a.phone === phone)
        
        if (!admin || admin.password !== password) {
          throw new Error('管理员账号或密码错误')
        }
        
        // 构建管理员用户对象
        const adminUser = {
          id: admin.id,
          name: admin.name,
          phone: admin.phone,
          role: 'admin',
          email: admin.email || '',
          avatar: admin.avatar || '',
          token: 'admin_token_' + Date.now()
        }
        
        commit('SET_CURRENT_USER', adminUser)
        return adminUser
      } catch (e) {
        if (e.message === '管理员账号或密码错误') throw e
        throw new Error('网络请求失败，请检查服务是否启动')
      }
    },

    // 注册
    async register({ commit }, data) {
      const res = await authAPI.register(data)
      const newUser = {
        ...res.data,
        role: 'volunteer'
      }
      commit('SET_CURRENT_USER', newUser)
      return newUser
    },

    // 登出
    logout({ commit }) {
      commit('LOGOUT')
    },

    // 从 localStorage 恢复登录状态
    restoreSession({ commit }) {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          commit('SET_CURRENT_USER', user)
          return true
        } catch (e) {
          return false
        }
      }
      return false
    },

    async fetchUsers({ commit }) {
      const res = await authAPI.getUsers()
      commit('SET_USERS', res.data || [])
    },

    async fetchActivities({ commit }, params) {
      commit('SET_LOADING', true)
      try {
        const res = await activityAPI.getList(params)
        commit('SET_ACTIVITIES', res.data || [])
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchActivityById({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        const res = await activityAPI.getById(id)
        commit('SET_CURRENT_ACTIVITY', res.data)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchRegistrations({ commit }, params) {
      const res = await registrationAPI.getList(params)
      commit('SET_REGISTRATIONS', res.data || [])
    },
    async submitRegistration({ commit }, data) {
      const res = await registrationAPI.create(data)
      commit('ADD_REGISTRATION', res.data)
      return res.data
    },
    async cancelRegistration({ commit }, { id, data }) {
      const res = await registrationAPI.update(id, data)
      commit('CANCEL_REGISTRATION', res.data)
      return res.data
    },
    async approveRegistration({ commit }, { id, data }) {
      const res = await registrationAPI.update(id, data)
      commit('UPDATE_REGISTRATION', { id, data: res.data })
    },
    async fetchServiceRecords({ commit }, params) {
      const res = await serviceRecordAPI.getList(params)
      commit('SET_SERVICE_RECORDS', res.data || [])
    },
    async addServiceRecord({ commit, state, dispatch }, data) {
      dispatch('fetchRankings')
      // ① 添加服务记录
      const res = await serviceRecordAPI.create(data)

      commit('ADD_SERVICE_RECORD', res.data)

      // ② 查找排行榜用户
      let ranking = state.rankings.find(
        item => item.userId == data.userId
      )

      // ③ 已存在
      if (ranking) {

        await rankingAPI.update(ranking.id, {
          totalHours: Number(ranking.totalHours) + Number(data.hours),
          activities: Number(ranking.activities) + 1
        })

      } else {

        // ④ 不存在则创建
        await rankingAPI.create({
          userId: data.userId,
          userName: data.userName,
          totalHours: Number(data.hours),
          activities: 1,
          rank: 999,
          avatar: ''
        })
      }

      // ⑤ 重新读取排行榜
      const rankingRes = await rankingAPI.getList()

      let rankings = rankingRes.data || []

      // ⑥ 排序
      rankings.sort(
        (a, b) => b.totalHours - a.totalHours
      )

      // ⑦ 重算排名
      for (let i = 0; i < rankings.length; i++) {

        rankings[i].rank = i + 1

        await rankingAPI.update(rankings[i].id, {
          rank: i + 1
        })
      }

      // ⑧ 刷新Vuex
      dispatch('fetchRankings')
    },
    async fetchCertificates({ commit }, params) {
      const res = await certificateAPI.getList(params)
      commit('SET_CERTIFICATES', res.data || [])
    },
    async generateCertificate({ commit }, data) {
      const res = await certificateAPI.create(data)
      commit('ADD_CERTIFICATE', res.data)
    },
    async fetchRankings({ commit }) {
      const res = await rankingAPI.getList()
      commit('SET_RANKINGS', res.data || [])
    },
    async fetchStyles({ commit }) {
      const res = await styleAPI.getList()
      commit('SET_STYLES', res.data || [])
    }
  },
  
  //计算属性
  getters: {
    isLoggedIn: state => state.isLoggedIn,
    currentUser: state => state.currentUser,
    isAdmin: state => state.currentUser?.role === 'admin',
    userName: state => state.currentUser?.name || '游客',
    userRole: state => state.currentUser?.role || 'volunteer',
    userId: state => state.currentUser?.id,
    users: state => state.users
  }
})