import React from 'react'
import { call, takeEvery, put, all } from 'redux-saga/effects'
import Axios from 'axios'
// import { incrementByAmount } from '../features/counter/counterSlice'
import { selectAllPosts, fetchPosts } from '../features/posts/postsSlice'
import { sagaActions } from './sagaActions'

// function uses axios to fetch data from our api
let callAPI = async ({ url, method, data }) => {
  return await Axios({
    url,
    method,
    data,
  })
}

export function* fetchPostsSaga() {
  console.log('this is never called')
  try {
    let result = yield call(() =>
      callAPI({
        url: '/fakeApi/post',
      })
    )
    console.log('result')
    yield put(fetchPosts(result))
  } catch (e) {
    yield put({ type: 'FETCH_POSTS_SAGA' })
  }
}
export default function* rootSaga() {
  yield takeEvery(sagaActions.FETCH_POSTS_SAGA, fetchPostsSaga)
}
