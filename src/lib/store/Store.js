import PubSub from '../PubSub.js';

export default class Store {
    constructor(params) {
        let self = this;
        self.actions = {};
        self.mutations = {};
        self.state = {};
        self.status = `default state`;
        self.observer = new PubSub();

        if (params.hasOwnProperty('actions')) {
            self.actions = params.actions;
        }

        if (params.hasOwnProperty('mutations')) {
            self.mutations = params.mutations;
        }

        self.state = new Proxy((params.state || {}), {
            set: function(state, key, value) {
                state[key] = value;
                console.log(`stateChange: ${key}: ${value}`);
                self.observer.publish('stateChange', self.state);

                if (self.status !== 'mutation') {
					console.warn(`You should use a mutation to set ${key}`);
                }

                self.status = 'resting';
                return true;
            }
        });
    }

    dispatch(action) {
        if (typeof this.actions[action.type] !== 'function') {
            console.error(`Action "${action.type}" doesn't exist.`);
            return false;
        }

        console.groupCollapsed(`ACTION: "${action.type}"`);
        this.status = 'action';
        this.actions[action.type](this, action.payload);
        console.groupEnd();
        return true;
    }

    commit(mutation) {
        if (typeof this.mutations[mutation.type] !== 'function') {
            console.log(`Mutation "${mutation.type}" doesn't exist.`);
			return false;
        }

        this.status = `mutation`;
        let newState = this.mutations[mutation.type](this.state, mutation.payload);
        this.state = Object.assign({}, this.state, newState);
        return true;
    }
}