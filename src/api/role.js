import request from '@/utils/request'

export function fetchList(params, data) {
  return request({
    url: '/api/roles/page',
    method: 'post',
    params,
    data: data
  })
}

export function create(data) {
  return request({
    url: '/api/roles',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/roles',
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: '/api/roles/' + id,
    method: 'delete'
  })
}

export function listAllRoleListData() {
  return request({
    url: '/api/roles/list',
    method: 'get'
  })
}
