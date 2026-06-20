import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000
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
  update: (id, data) => http.patch(`/registrations/${id}`, data)
}

export const serviceRecordAPI = {
  getList: (params) => http.get('/serviceRecords', { params }),
  create: (data) => http.post('/serviceRecords', data),
  update: (id, data) => http.patch(`/serviceRecords/${id}`, data)
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
