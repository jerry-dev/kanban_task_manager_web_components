export default class PubSub {
    constructor() {
        this.events = {};
    }

    #subscribers = {};
    #callbackIndex = {};

    getSubscribers() {
		return this.#subscribers;
    }

    getCallbackIndex() {
		return this.#callbackIndex;
    }

    isSubscribed(subscriber, event) {
        for (let i = 0; i < this.getCallbackIndex()[event].length; i++) {
            if (this.getCallbackIndex()[event][i].id === subscriber.getName()) {
                return true;
            }
        }

        return false;
    }

    unsubscribe(id, event) {
		for (let i = 0; i < this.#callbackIndex[event].length; i++) {
			if (id === this.#callbackIndex[event][i].id) {
				console.log(`Deleting ${id}'s callback at index ${this.#callbackIndex[event][i].position} from the ${event}`);
				const index = this.#callbackIndex[event][i].position;
				this.#subscribers[event].splice(index, 1);
				this.#subscribers[event].splice(this.#callbackIndex[event][i].position, 1);
				
				for (let j = i+1; j < this.#callbackIndex[event].length; j++) {
					this.#callbackIndex[event][j].position--;
				}
				
				this.#callbackIndex[event].splice(this.#callbackIndex[event][i], 1);
			}
		}
    }

    subscribe(subscriber, event, callback) {
		if (!Array.isArray(this.#subscribers[event])) {
			this.#subscribers[event] = [];
		}
		
		if (!Array.isArray(this.#callbackIndex[event])) {
			this.#callbackIndex[event] = [];
		}

        if (!this.isSubscribed(subscriber, event)) {
            const index = this.#subscribers[event].push(callback) - 1;
            this.#callbackIndex[event].push({ id: subscriber.getName(), position: index });
            console.log(`${subscriber.getName()} is subscribed to the ${event} event.`);
        }
    }

    publish(event, newValue) {
		if (!this.#subscribers[event]) {
			return;
		}
		
		// Iterating over all notification callbacks appended within the specified event's array
		this.#subscribers[event].forEach((subscriberCallback) => {
			// Providing the current iterated callback with the new value
			// Might be a good idea to give it more context: publisher, previous value, the event, etc.
			subscriberCallback(newValue);
		});
    }
}