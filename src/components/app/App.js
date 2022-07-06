import appStyleSheet from './app.css' assert { type: 'css' };
import router from '../../lib/router/index.js';
import Sidebar from '../sidebar/Sidebar.js';
import Tasksboard from '../tasksboard/Tasksboard.js';
import store from '../../lib/store/index.js';

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
        this.store = store;
        this.store.observer.subscribe('stateChange', this.render);
        this.CSS();
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ appStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        
        `<main id="canvas" data-menu="off-screen">
            <side-bar></side-bar>
            <tasks-board data-sidebar-control="on-screen">
                <output id="mainRoute"></output>
            </tasks-board>
        </main>`;

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

    SCRIPTS() {
        this.clickManager();
    }

    clickManager() {
        this.shadowRoot.addEventListener('click', (event) => {
            this.sideBarControl(event);
            this.closeSideBarButtonLogic(event);
            this.darkThemeToggle(event);
        });
    }

    sideBarControl(event) {
        if (event.composedPath()[0].id === 'sideBarControl') {
            if (!this.isSideBarOnScreen()) {
                this.revealSidebar();
                return this.hideAppHeaderLogo();
            }
        }
    }

    closeSideBarButtonLogic(event) {
        if (event.composedPath()[0].tagName === "HIDE-SIDEBAR-BUTTON") {
            if (this.isSideBarOnScreen()) {
                this.hideSidebar();
                return this.unhideAppHeaderLogo();
            }
        }
    }

    darkThemeToggle(event) {
        if (event.composedPath()[0].id === "toggleSwitch") {
            const toggleInput = event.composedPath()[0];

            if (!toggleInput.checked) {
                toggleInput.setAttribute("checked", "");
                this.deactivateDarkTheme();
            } else {
                toggleInput.removeAttribute("checked");
                this.activateDarkTheme();
            }
        }
    }

    hideAppHeaderLogo() {
        this.shadowRoot.getElementById('canvas')
            .getElementsByTagName('tasks-board')[0]
            .shadowRoot.querySelector('app-header')
            .shadowRoot.getElementById('logoOuterContainer').setAttribute('data-behavior', 'hide');
    }

    unhideAppHeaderLogo() {
        this.shadowRoot.getElementById('canvas')
            .getElementsByTagName('tasks-board')[0]
            .shadowRoot.querySelector('app-header')
            .shadowRoot.getElementById('logoOuterContainer').setAttribute('data-behavior', 'show');
    }

    activateDarkTheme() {
        this.classList.add('darkTheme');
    }

    deactivateDarkTheme() {
        this.classList.remove('darkTheme');
    }

    isSideBarOnScreen() {
        return this.shadowRoot.getElementById('canvas').getAttribute('data-menu') === "on-screen";
    }

    revealSidebar() {
        this.shadowRoot.getElementById('canvas').setAttribute('data-menu', "on-screen");
        this.hideSidebarControl();
    }

    hideSidebar() {
        this.shadowRoot.getElementById('canvas').setAttribute('data-menu', "off-screen");
        this.revealSidebarControl();
    }

    revealSidebarControl() {
        this.shadowRoot.getElementById('canvas').getElementsByTagName('tasks-board')[0].setAttribute('data-sidebar-control', "on-screen");
    }

    hideSidebarControl() {
        this.shadowRoot.getElementById('canvas')
            .getElementsByTagName('tasks-board')[0].setAttribute('data-sidebar-control', "off-screen");
    }
}

if (!window.customElements.get('kanban-app')) {
	window.customElements.define('kanban-app', App);
}