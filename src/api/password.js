import request from '@/utils/request'

export function fetchList(params, data) {
  return request({
    url: '/api/password-managements/page',
    method: 'post',
    params,
    data: data
  })
}

export function createPassword(data) {
  return request({
    url: '/api/password-managements',
    method: 'post',
    data
  })
}

export function updatePassword(data) {
  return request({
    url: '/api/password-managements',
    method: 'put',
    data
  })
}

export function deletePassword(id) {
  return request({
    url: '/api/password-managements/' + id,
    method: 'delete'
  })
}

export function selectDetail(id) {
  return request({
    url: '/api/password-managements/' + id,
    method: 'get'
  })
}

export function selectCode(data) {
  return request({
    url: '/api/password-managements/code',
    method: 'post',
    data
  })
}

export function updateCode(data) {
  return request({
    url: '/api/password-managements/code',
    method: 'put',
    data
  })
}
