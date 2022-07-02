import router from './lib/router/index.js';
import AppHeader from './components/appheader/AppHeader.js';
import Sidebar from './components/sidebar/Sidebar.js';
import Tasksboard from './components/tasksboard/Tasksboard.js';

export default class App extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.routerInit();
    }

    render() {
        this.HTML();
    }

    HTML() {
        const markup = /*html*/
        `<side-bar></side-bar>
        <div id="outer">
            <app-header></app-header>
            <tasks-board>
                <output id="mainRoute"></output>
            </tasks-board>
        </div>`;

        this.shadowRoot.innerHTML = markup;
    }

    clearRoute(route) {
        route.textContent = '';
    }

    routerInit() {
        router.on({
            '/': {
                as: 'home',
                uses: () => {
                    if (!router.lastResolved()) {
                        this.beforeNewViewRenderedOperations();
                    }

                    this.renderOneView();
                },
                hooks: {
                    before: (done) => {
                        this.beforeNewViewRenderedOperations();
                        done();
                    },
                    leave: (match) => {
                        match();
                    }
                }
            },
            '/two': {
                as: 'two',
                uses: () => {
                    if (!router.lastResolved()) {
                        this.beforeNewViewRenderedOperations();
                    }
                    this.renderTwoView();
                },
                hooks: {
                    before: (done) => {
                        this.beforeNewViewRenderedOperations();
                        done();
                    },
                    leave: (match) => {
                        match();
                    }
                }
            },
        });

        router.resolve();
    }

    getMainRoute() {
        return this.shadowRoot.getElementById('mainRoute');
    }

    renderOneView() {
        this.getMainRoute().innerHTML = /*html*/ `<div>ONE</div>`;
    }

    renderTwoView() {
        this.getMainRoute().innerHTML = /*html*/ `<div>Two</div>`;
    }

    beforeNewViewRenderedOperations() {
        this.clearRoute(this.getMainRoute());
    }
}

if (!window.customElements.get('kanban-app')) {
	window.customElements.define('kanban-app', App);
}