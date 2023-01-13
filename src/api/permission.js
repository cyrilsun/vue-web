import request from '@/utils/request'

export function fetchList(params, data) {
  return request({
    url: '/api/permissions/page',
    method: 'post',
    params,
    data: data
  })
}

export function create(data) {
  return request({
    url: '/api/permissions',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/permissions',
    method: 'put',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: '/api/permissions/' + id,
    method: 'delete'
  })
}

export function getPermissions() {
  return request({
    url: '/api/permissions/list',
    method: 'get'
  })
}
