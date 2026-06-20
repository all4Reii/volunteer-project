import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000
})

// attach auth + role
http.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    if (user?.role) {
      config.headers['x-user-role'] = user.role
    }
  } catch (e) {}
  return config
})

function requireAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.role === 'admin'
  } catch (e) {
    return false
  }
}

export default http

export const activityAPI = {
  getList: (params) => http.get('/activities', { params }),
  getById: (id) => http.get(`/activities/${id}`),
  create: (data) => http.post('/activities', data)
}

export const registrationAPI = {
  getList: (params) => http.get('/registrations', { params }),
  create: (data) => http.post('/registrations', data),
  update: (id, data) => {
    if (!requireAdmin()) throw new Error('无权限：只有管理员可以审核报名')
    return http.patch(`/registrations/${id}`, data)
  }
}

export const serviceRecordAPI = {
  getList: (params) => http.get('/serviceRecords', { params }),
  create: (data) => {
    if (!requireAdmin()) throw new Error('无权限：只有管理员可以添加服务时长记录')
    return http.post('/serviceRecords', data)
  },
  update: (id, data) => {
    if (!requireAdmin()) throw new Error('无权限：只有管理员可以修改服务时长记录')
    return http.patch(`/serviceRecords/${id}`, data)
  }
}

export const certificateAPI = {
  getList: (params) => http.get('/certificates', { params }),
  getById: (id) => http.get(`/certificates/${id}`),
  create: (data) => http.post('/certificates', data)
}

export const rankingAPI = {
  getList: () => http.get('/rankings')
}

export const styleAPI = {
  getList: () => http.get('/styles'),
  getById: (id) => http.get(`/styles/${id}`)
}

export const authAPI = {
  login: () => http.get('/users'),
  register: (data) => http.post('/users', data),
  getUser: (id) => http.get(`/users/${id}`)
}