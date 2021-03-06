import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const intitalState = {};

const middleWare = [thunk];

const store = createStore(
  rootReducer,
  intitalState,
  composeWithDevTools(applyMiddleware(...middleWare))
);

export default store;
