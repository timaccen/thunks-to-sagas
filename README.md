# Thunks to Sagas

The goal of this project is to test Redux Sagas with the Redux Toolkit.  It uses the Redux Essentials example app as a starting point.

## Saga Middleware

This middleware allows you to:

- Execute extra logic when any action is dispatched (such as logging the action and state)
- Pause, modify, delay, replace, or halt dispatched actions
- Write extra code that has access to dispatch and getState
- Teach dispatch how to accept other values besides plain action objects, such as functions and - promises, by intercepting them and dispatching real action objects instead

In part 5 of the the Redux Essentials, Thunks are introduced for a way to handle the API calls: [Using Middleware to Enable Async Logic](https://redux.js.org/tutorials/essentials/part-5-async-logic#using-middleware-to-enable-async-logic)

The Redux Essentials step 5 says this about using Thunks versus other types of middleware: *Redux Toolkit's configureStore function automatically sets up the thunk middleware by default, and we recommend using thunks as the standard approach for writing async logic with Redux.*

However, in many other places, Sagas are offered as a more powerful alternative.  In a LogRocket article [Smarter Redux with Redux Toolkit](https://blog.logrocket.com/smarter-redux-redux-toolkit/), it says this about Sagas versus Thunks *although asynchronous functions can be created by RTK’s createAsyncThunk, sagas are more powerful and easier to test,*

The LogRocket article shows adding a Saga to the counter example which comes prebuilt with the create-react-app Redux template (npx create-react-app my-redux-app --template redux).

In the next [Thunk Functions](https://redux.js.org/tutorials/essentials/part-5-async-logic#thunk-functions) section, it shows how to configure them in the store.js file.

```javascript
const store = configureStore({ reducer: counterReducer })

const exampleThunkFunction = (dispatch, getState) => {
  const stateBefore = getState()
  console.log(`Counter before: ${stateBefore.counter}`)
  dispatch(increment())
  const stateAfter = getState()
  console.log(`Counter after: ${stateAfter.counter}`)
}

store.dispatch(exampleThunkFunction)
```

The Saga version from the LogRocket article:

```javascript
let sagaMiddleware = createSagaMiddleware()
const middleware = [sagaMiddleware]

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
})
```

## The to do list

We're going to

- switch the hardcoded sample data as its initial state to start with an empty array of posts instead, and then fetch a list of posts from the server
- change the structure of the state in postsSlice so that it can keep track of the current state of the API request
- change the postsSlice state which is a single array of posts to be an object that has the posts array, plus the loading state fields
- change the UI components like <PostsList> from reading posts from state.posts in their useSelector hooks to match the new data object
- define reusable selector functions in the slice files, and have the components use those selectors to extract the data they need instead of repeating the selector logic in each component

### Define reusable selector functions

This part is no Saga-secific.

features/posts/postsSlice.js

```javascript
export const selectAllPosts = state => state.posts

export const selectPostById = (state, postId) =>
  state.posts.find(post => post.id === postId)

features/posts/PostsList.js
```

```javascript
const posts = useSelector((state) => state.posts)
```

### Loading State for Requests

Create a loading state machine in the [Loading State for Requests](https://redux.js.org/tutorials/essentials/part-5-async-logic#loading-state-for-requests) part.

features/posts/postsSlice.js

Instead of an array: const initialState = [{...}, {...}] we have an object with the state and a possible error:

```javascript
const initialState = {
  posts: [],
  status: 'idle',
  error: null
}
```

Then the reducer pushes to the posts object: state.posts.push(action.payload)

reactionAdded

const existingPost = state.posts.find(post => post.id === postId)

postUpdated

const existingPost = state.posts.find(post => post.id === id)

Export the new parts:

```javascript
export const selectAllPosts = state => state.posts.posts

export const selectPostById = (state, postId) =>
  state.posts.posts.find(post => post.id === postId)
```

Not sure if we are done yet, as the running app has this error:

PostsList.js:13 Uncaught TypeError: posts.slice is not a function
    at PostsList (PostsList.js:13:1)

That's the orderedPosts = posts.slice() function.

Since it's an array, it should be something like: orderedPosts = posts.posts.slice().  Really, we cant to call the first one something like slice.posts, but that can happen later.  Now it's time for the actual Thunk implementation.  After that we will attempt to convert it to a Saga.

### [Fetching Data with createAsyncThunk](https://redux.js.org/tutorials/essentials/part-5-async-logic#fetching-data-with-createasyncthunk)

features/posts/postsSlice.js

```javascript
import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../../api/client'
...
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get('/fakeApi/posts')
  return response.data
})
```

Using the Thunk is shown in the "[Dispatching Thunks from Components](https://redux.js.org/tutorials/essentials/part-5-async-logic#dispatching-thunks-from-components)" section.

We add useEffect, useDispatch and fetchPosts to the imports.

features/posts/PostsList.js

```javascript
const dispatch = useDispatch()

const postStatus = useSelector(state => state.posts.status)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])
```

Next handle these actions in the reducers.  This is shown in the [Reducers and Loading Actions](https://redux.js.org/tutorials/essentials/part-5-async-logic#reducers-and-loading-actions) section.

We listen for the "pending" and "fulfilled" action types dispatched the fetchPosts thunk.

We add cases for the pending, fulfilled/rejected Thunks in the extraReducers array.

```javascript
extraReducers(builder) {
  builder
    .addCase(fetchPosts.pending, (state, action) => {
      state.status = 'loading'
    })
    .addCase(fetchPosts.fulfilled, (state, action) => {
      state.status = 'succeeded'
      // Add any fetched posts to the array
      state.posts = state.posts.concat(action.payload)
    })
    .addCase(fetchPosts.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
}
```


## Introducing Sagas

The [Smarter Redux with Redux Toolkit](https://blog.logrocket.com/smarter-redux-redux-toolkit/) by Zain Sajjad introduces the Redux Toolkit along with using Sagas in the "Using Redux-Saga with Redux Toolkit" section.  It uses the counter example, which is the official Redux implementation relied on here, so should be a good fit.

### About LogRocket

The [LogRocket site](https://lp.logrocket.com/blg/react-signup-issue-free) says this about it's product: *is a React analytics solution that shields you from the hundreds of false-positive errors alerts to just a few truly important items. LogRocket tells you the most impactful bugs and UX issues actually impacting users in your React applications.*

### Install and use Sagas

First, install the thing:

```shell
npm install redux-saga axios
```

[Here is the diff](https://github.com/timaccen/thunks-to-sagas/commit/ccc5195c2fc0a72ffa599ddc82ce2091cb9f26b3) for the first Thunk setup shown above.

This will involve replacing the things in extraReducers:
- fetchPosts.pending
- fetchPosts.fulfilled
- fetchPosts.rejected

The first step is then in store.js

sagaMiddleware.run(saga)

```javascript
import saga from '../sagas/saga'

let sagaMiddleware = createSagaMiddleware()
const middleware = [sagaMiddleware]

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
})

sagaMiddleware.run(saga)
```

Except we have different reducers:

- posts: postsReducer,
- users: usersReducer,

### Redux-Saga effects

This shows using a saga.js but not where to put it.

Later we see this comment:

// sagas/sagaActions.js

So we will use a directory like that for now.

The example code shows a fetchNumberSaga to get a random number to use in the counter example.  Probably we should have started with the counter example, but that's what the LogRocket article does so I suppose there is no point.  This should be fun!

The demo Saga uses the incrementByAmount from the counterSlice.  So we want to change that to fetchPosts.  In postsList.js, import the action and use it:

```javascript
import { sagaActions } from '../../sagas/sagaActions'
```

And change this:

dispatch(fetchPosts())

To this:

dispatch({ type: sagaActions.FETCH_POSTS_SAGA })

But getting this error:

Module not found: Error: Cannot find file: 'redux-saga-effects-npm-proxy.esm.js' does not match the corresponding name on disk: './node_modules/Redux-Saga/dist/redux-saga'.

That's due to some capital letters in the LogRocket article.  Not only the npm install function which is shown installing Redux-Saga incrorrectly, also there is incorrect usage in the import:

import { call, takeEvery, put } from 'Redux-Saga/effects'

Should be:

import { call, takeEvery, put } from 'redux-saga/effects'

However, with that working the fetchNumberSaga is not called.  Along with the typos above, there may be other errors in this article.  SO says: *As the documentation says: you should call all() method to run your saga setup.*

The example shows this:

```javascript
const root = function* rootSaga() {
  yield all([
    watchRegister(),
  ]);
};
```

We have this:

```javascript
export default function* rootSaga() {
  yield takeEvery(sagaActions.FETCH_POSTS_SAGA, fetchPostsSaga)
}
```

Change that to all([]) but the saga is still not called.  I do see the FETCH_NUMBER_SAGA in the Redux dev tools, but the api is not called.

Some more searching on StackOverflow uncovers a big problem:

From the comments of [this question](https://stackoverflow.com/questions/71545338/unable-to-dispatch-action-by-using-saga-toolkit-and-redux-toolkit-together): *It seems like that still uses thunks internally, so you probably just cannot turn thunks off. That said, we as the Redux team really do not recommend sagas for most things any more. Even if you have an app that has a real need for sagas (using advanced features like action channels, forking etc.) we recommend using less convoluted tools like RTK Query, createAsyncThunks or thunks for simple use cases like data fetching in the same code base. Also, Redux Toolkit by now also contains a listener middleware that takes over most other things redux-saga was used for previously.*

So I've wasted a few days with this.

Another LogRocket [article](https://blog.logrocket.com/redux-toolkits-new-listener-middleware-vs-redux-saga/) says *Redux maintainers added new listener middleware functionality to enhance the capability of RTK and offer an in-house solution to most of the use cases covered by Sagas. It has finally landed in RTK v1.8.0 after endless iterations. The middleware’s primary functionality is let users respond to dispatched actions, or run code in response to state updates.*

We have this in package.json: "@reduxjs/toolkit": "^1.6.1",

I tried to go to 1.8 but instead 1.9.1 was installed.

Still, no the saga action is not called.

## Ogiginal Readme: Redux Essentials Tutorial Example

This project contains the setup and code from the "Redux Essentials" tutorial in the Redux docs ( https://redux.js.org/tutorials/essentials/part-1-overview-concepts ).

The `master` branch has a single commit that already has the initial project configuration in place. You can use this to follow along with the instructions from the tutorial.

The `tutorial-steps` branch has the actual code commits from the tutorial. You can look at these to see how the official tutorial actually implements each piece of functionality along the way.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

> **Note**: If you are using Node 17, this project may not start correctly due to a known issue with Webpack and Node's OpenSSL changes, which causes an error message containing `ERR_OSSL_EVP_UNSUPPORTED`.  
> You can work around this by setting a `NODE_OPTIONS=--openssl-legacy-provider` environment variable before starting the dev server.
> Details: https://github.com/webpack/webpack/issues/14532#issuecomment-947012063

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
