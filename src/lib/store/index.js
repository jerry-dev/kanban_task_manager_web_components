import actions from './actions/index.js';
import mutations from './mutations/index.js';
import state from './state.js';
import Store from './Store.js';

export default new Store({
	actions,
	mutations,
	state
});