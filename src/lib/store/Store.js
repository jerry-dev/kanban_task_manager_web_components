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

        this.dispatch = this.dispatch.bind(this);
    }

    dispatch(action) {
        const self = this;

        if (typeof self.actions[action.type] !== 'function') {
            console.error(`Action "${action.type}" doesn't exist.`);
            return false;
        }

        console.groupCollapsed(`ACTION: "${action.type}"`);
        self.status = 'action';
        self.actions[action.type](self, action.payload);
        console.groupEnd();
        return true;
    }

    commit(mutation) {
        const self = this;

        if (typeof self.mutations[mutation.type] !== 'function') {
            console.log(`Mutation "${mutation.type}" doesn't exist.`);
			return false;
        }

        self.status = `mutation`;
        let newState = self.mutations[mutation.type](self.state, mutation.payload);
        self.state = Object.assign({}, self.state, newState);
        return true;
    }
}