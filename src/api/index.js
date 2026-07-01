import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000
})
//把 db.json 变成一个“REST API 后端服务器”,自动生成接口

// 每次请求自动携带登录 token 自动携带用户角色
http.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    if (user?.role) {
      config.headers['x-user-role'] = user.role
    }
  } catch (e) {
    // ignore errors
  }
  return config
})

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
    return http.patch(`/registrations/${id}`, data)
  }
}

export const serviceRecordAPI = {
  getList: (params) => http.get('/serviceRecords', { params }),
  create: (data) => {
    return http.post('/serviceRecords', data)
  },
  update: (id, data) => {
    return http.patch(`/serviceRecords/${id}`, data)
  }
}

export const certificateAPI = {
  getList: (params) => http.get('/certificates', { params }),
  getById: (id) => http.get(`/certificates/${id}`),
  create: (data) => http.post('/certificates', data)
}

export const rankingAPI = {
  getList: () => http.get('/rankings'),
  create: (data) => http.post('/rankings', data),
  update: (id, data) => http.patch(`/rankings/${id}`, data)
}

export const styleAPI = {
  getList: () => http.get('/styles'),
  getById: (id) => http.get(`/styles/${id}`)
}

export const authAPI = {
  login: (params) => http.get('/users', { params }),
  register: (data) => http.post('/users', data),
  getUser: (id) => http.get(`/users/${id}`),
  getUsers: () => http.get('/users'),
  getAdmins: () => http.get('/admins')
}