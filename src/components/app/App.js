import appStyleSheet from './app.css' assert { type: 'css' };
import router from '../../lib/router/index.js';
import Sidebar from '../sidebar/Sidebar.js';
import Tasksboard from '../tasksboard/Tasksboard.js';
import TasksboardColumn from '../tasksboardcolumn/TasksboardColumn.js';
import store from '../../lib/store/index.js';
import fetchLocalData from '../../lib/fetchLocalData.js';

export default class App extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.store = store;
        this.store.observer.subscribe('stateChange', this.render);
        fetchLocalData(this.store.dispatch, this.store.state.isApplicationDataReady);
        this.render();
        this.routerInit();
    }

    render() {
        this.CSS();
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ appStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        
        `<main id="canvas" data-menu="on-screen">
            <side-bar></side-bar>
            <tasks-board data-sidebar-control="off-screen">
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
                uses: () => {
                    if (!router.lastResolved()) {
                        this.beforeNewViewRenderedOperations();
                    }

                    this.renderOneView();
                    //Navigate to the first board
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
            '/:board': {
                uses: ({ data }) => {
                    if (!router.lastResolved()) {
                        this.beforeNewViewRenderedOperations();
                    }

                    this.renderBoardColumns(data);
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

    renderBoardColumns(data) {
        const reformattedColumnData = this.getReformattedData(data);

        let markup = ``;

        // There are currently 6 colors to choose from.
        // The colors are positioned like arrays: 0, 1, 2, 3, 4, 5
        let colorIndex = null;

        Object.keys(reformattedColumnData).forEach((columnName) => {

            // Keeping the color choice in range
            if (colorIndex !== null && colorIndex < 5) {
                colorIndex++;
            } else {
                colorIndex = 0;
            }

            const numberOfTasks = reformattedColumnData[columnName].length;

            const colData = JSON.stringify(reformattedColumnData).replace(/ /g, "__");

            markup += /*html*/
            `<tasksboard-column
                colorindex=${colorIndex}
                columnname=${columnName}
                numberoftasks=${numberOfTasks}
                columndata=${colData}
            ></tasksboard-column>`;
        });

        this.getMainRoute().innerHTML = markup;
    }


    getReformattedData(data) {
        const observedColumns = {};

        for (let i = 0; i < this.store.state.boards.length; i++) {
            const reformattedBoardName = this.store.state.boards[i].name.replace(" ", "-").toLowerCase();
            if (reformattedBoardName === data.board) {
                for (let j = 0; j < this.store.state.boards[i].columns.length; j++) {
                    // For each distinct column name, we create a array property for it within
                    // the observedColumns object. We'll inject/push the associated tasks in it later.
                    if (!observedColumns[this.store.state.boards[i].columns[j].name]) {
                        observedColumns[this.store.state.boards[i].columns[j].name] = [];

                        // Pushing the individual tasks objects into the associated column array
                        this.store.state.boards[i].columns[j].tasks.forEach((taskInstance) => {
                            observedColumns[this.store.state.boards[i].columns[j].name].push(taskInstance);
                        });
                    }
                }
            }
        }

        return observedColumns;
    }

    getMainRoute() {
        return this.shadowRoot.getElementById('mainRoute');
    }

    renderOneView() {
        this.getMainRoute().innerHTML = /*html*/ `<div>ONE</div>`;
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