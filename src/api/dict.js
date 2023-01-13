import request from '@/utils/request'

export function fetchList(params, data) {
  return request({
    url: '/api/dicts/page',
    method: 'post',
    params,
    data: data
  })
}

export function createDict(data) {
  return request({
    url: '/api/dicts',
    method: 'post',
    data
  })
}

export function updateDict(data) {
  return request({
    url: '/api/dicts',
    method: 'put',
    data
  })
}

export function deleteDict(id) {
  return request({
    url: '/api/dicts/' + id,
    method: 'delete'
  })
}
export function dictChildrenList(id) {
  return request({
    url: '/api/dicts/children/' + id,
    method: 'get'
  })
}

