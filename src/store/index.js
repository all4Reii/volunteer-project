import { createStore } from 'vuex'
import { activityAPI, registrationAPI, serviceRecordAPI, certificateAPI, rankingAPI, styleAPI, authAPI } from '@/api'

export default createStore({
  state: {
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
  mutations: {
    SET_CURRENT_USER(state, user) { state.currentUser = user; state.isLoggedIn = !!user },
    LOGOUT(state) { state.currentUser = null; state.isLoggedIn = false },
    SET_LOADING(state, val) { state.loading = val },
    SET_ACTIVITIES(state, list) { state.activities = list },
    SET_CURRENT_ACTIVITY(state, obj) { state.currentActivity = obj },
    SET_REGISTRATIONS(state, list) { state.registrations = list },
    ADD_REGISTRATION(state, item) { state.registrations.unshift(item) },
    UPDATE_REGISTRATION(state, { id, data }) {
      const idx = state.registrations.findIndex(r => r.id === id)
      if (idx !== -1) Object.assign(state.registrations[idx], data)
    },
    SET_SERVICE_RECORDS(state, list) { state.serviceRecords = list },
    ADD_SERVICE_RECORD(state, item) { state.serviceRecords.unshift(item) },
    SET_CERTIFICATES(state, list) { state.certificates = list },
    ADD_CERTIFICATE(state, item) { state.certificates.unshift(item) },
    SET_RANKINGS(state, list) { state.rankings = list },
    SET_STYLES(state, list) { state.styles = list }
  },
  actions: {
    async login({ commit }, { phone, password }) {
      try {
        const res = await authAPI.login()
        const users = res.data
        const user = users.find(u => u.phone === phone)
        if (!user || user.password !== password) {
          throw new Error('手机号或密码错误')
        }
        commit('SET_CURRENT_USER', user)
        return user
      } catch (e) {
        if (e.message === '手机号或密码错误') throw e
        throw new Error('网络请求失败，请检查服务是否启动')
      }
    },
    async register({ commit }, data) {
      const res = await authAPI.register(data)
      commit('SET_CURRENT_USER', res.data)
      return res.data
    },
    logout({ commit }) {
      commit('LOGOUT')
    },
    async fetchActivities({ commit }, params) {
      commit('SET_LOADING', true)
      const res = await activityAPI.getList(params)
      commit('SET_ACTIVITIES', res.data)
      commit('SET_LOADING', false)
    },
    async fetchActivityById({ commit }, id) {
      commit('SET_LOADING', true)
      const res = await activityAPI.getById(id)
      commit('SET_CURRENT_ACTIVITY', res.data)
      commit('SET_LOADING', false)
    },
    async fetchRegistrations({ commit }, params) {
      const res = await registrationAPI.getList(params)
      commit('SET_REGISTRATIONS', res.data)
    },
    async submitRegistration({ commit }, data) {
      const res = await registrationAPI.create(data)
      commit('ADD_REGISTRATION', res.data)
      return res.data
    },
    async approveRegistration({ commit }, { id, data }) {
      const res = await registrationAPI.update(id, data)
      commit('UPDATE_REGISTRATION', { id, data: res.data })
    },
    async fetchServiceRecords({ commit }, params) {
      const res = await serviceRecordAPI.getList(params)
      commit('SET_SERVICE_RECORDS', res.data)
    },
    async addServiceRecord({ commit }, data) {
      const res = await serviceRecordAPI.create(data)
      commit('ADD_SERVICE_RECORD', res.data)
    },
    async fetchCertificates({ commit }, params) {
      const res = await certificateAPI.getList(params)
      commit('SET_CERTIFICATES', res.data)
    },
    async generateCertificate({ commit }, data) {
      const res = await certificateAPI.create(data)
      commit('ADD_CERTIFICATE', res.data)
    },
    async fetchRankings({ commit }) {
      const res = await rankingAPI.getList()
      commit('SET_RANKINGS', res.data)
    },
    async fetchStyles({ commit }) {
      const res = await styleAPI.getList()
      commit('SET_STYLES', res.data)
    }
  }
})
