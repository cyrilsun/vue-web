import request from '@/utils/request'

export function fetchList(params, data) {
  return request({
    url: '/api/users/page',
    method: 'post',
    params,
    data: data
  })
}

export function createUser(data) {
  return request({
    url: '/api/users',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/api/users',
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/api/users/' + id,
    method: 'delete'
  })
}

export function resetPassword(id) {
  return request({
    url: '/api/users/password/' + id,
    method: 'put',
    id
  })
}

