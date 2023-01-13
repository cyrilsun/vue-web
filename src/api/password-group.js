import request from '@/utils/request'

export function fetchList(params, data) {
  return request({
    url: '/api/password-groups/page',
    method: 'post',
    params,
    data: data
  })
}

export function createPasswordGroup(data) {
  return request({
    url: '/api/password-groups',
    method: 'post',
    data
  })
}

export function updatePasswordGroup(data) {
  return request({
    url: '/api/password-groups',
    method: 'put',
    data
  })
}

export function deletePasswordGroup(id) {
  return request({
    url: '/api/password-groups/' + id,
    method: 'delete'
  })
}

export function listAllGroupListData() {
  return request({
    url: '/api/password-groups/list',
    method: 'get'
  })
}

