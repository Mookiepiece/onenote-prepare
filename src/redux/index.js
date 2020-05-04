import rootReducer from './reducers'
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ActionTypes from './actions';
import DB from '@/store/indexedDB';

const store = createStore(rootReducer, applyMiddleware(thunk));

DB.history().then(value => {
    store.dispatch({
        type: ActionTypes.INIT_MEMORY,
        value
    })
});

export default store;