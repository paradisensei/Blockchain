import { combineReducers } from 'redux'

function contract(state = {}, action) {
	if (action.type === 'CONTRACT_INITIALIZED') {
		return action.payload
	}
	return state
}

function user(state = {}, action) {
	if (action.type === 'USER') {
		return action.payload
	}
	return state
}

const reducer = combineReducers({
  contract, user
})

export default reducer
