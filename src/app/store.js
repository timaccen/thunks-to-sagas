import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import postsReducer from '../features/posts/postsSlice'
import usersReducer from '../features/users/usersSlice'
import saga from '../sagas/saga'

let sagaMiddleware = createSagaMiddleware()
const middleware = [sagaMiddleware]

export default configureStore({
  reducer: {
    posts: postsReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
})
