import appStyleSheet from './app.css' assert { type: 'css' };
import router from '../../lib/router/index.js';
import Sidebar from '../sidebar/Sidebar.js';
import Tasksboard from '../tasksboard/Tasksboard.js';
import store from '../../lib/store/index.js';
import fetchLocalData from '../../lib/fetchLocalData.js';
import AppHeader from '../appheader/AppHeader.js';

export default class App extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.store = store;
        fetchLocalData(this.store.dispatch, this.store.state.isApplicationDataReady);
        this.store.observer.subscribe('stateChange', () => {
            this.refresh();
        })
        this.render();
        this.routerInit();
    }

    render() {
        this.initializeComponentState();
        this.CSS();
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ appStyleSheet ];
    }

    HTML(board) {
        let markup = '';
        markup +=  /*html*/ `<app-header currentboard="${board}"></app-header>`;
        markup += /*html*/ `<div id="canvas" data-menu="on-screen">
            <side-bar></side-bar>
            <tasks-board data-sidebar-control="off-screen" currentboard="${board}"></tasks-board>
        </div>`;

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

                    this.navigateToTheFirstBoard();
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
                    this.renderTasksBoard(data);
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
    
    renderTasksBoard(data) {
        if (!data.board) return;

        let boardName = data.board;
        boardName = boardName.split("");
        boardName[0] = boardName[0].toUpperCase();

        for (let i = 0; i < boardName.length; i++) {
            if (boardName[i] === "-") {
                boardName[i] = " "
                boardName[i+1] = boardName[i+1].toUpperCase();
            }
        }
        
        boardName = boardName.join("");
        this.state.currentBoard = boardName;

        this.HTML(this.state.currentBoard);
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = {};
        
        if (!this.state?.boards ?? false) this.state.boards = [];
        if (!this.state?.currentBoard ?? false) this.state.currentBoard = '';

        
        for (let i = 0; i < this.store.state.boards.length; i++) {
            const reformattedBoardName = this.store.state.boards[i].name.replace(" ", "-").toLowerCase();
            this.state.boards[this.state.boards.length] = reformattedBoardName;
        }

        this.updateOldState();
    }

    refresh() {
        this.refreshCurrentState();

        if (this.didComponentStateChange()) {
            this.navigateToTheFirstBoard();
            this.renderTasksBoard(this.getCurrentBoard());
            this.updateOldState();
        }
    }

    refreshCurrentState() {
        this.state.boards = [];

        for (let i = 0; i < this.store.state.boards.length; i++) {
            const reformattedBoardName = this.store.state.boards[i].name.replace(" ", "-").toLowerCase();
            this.state.boards[this.state.boards.length] = reformattedBoardName;
        }
    }

    getMainRoute() {
        return this.shadowRoot.querySelector('tasks-board').shadowRoot.getElementById('mainRoute');
    }

    navigateToTheFirstBoard() {
        const firstBoard = this.state.boards[0];
        router.navigate(`${firstBoard}`);
        this.highlightSidebarFirstBoardButton();
    }

    beforeNewViewRenderedOperations() {
        this.clearRoute(this.getMainRoute());
    }

    getCurrentBoard() {
        return this.state.currentBoard;
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    didComponentStateChange() {
        return JSON.stringify(this.oldState.boards) !== JSON.stringify(this.state.boards);
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
            }
        }
    }

    closeSideBarButtonLogic(event) {
        if (event.composedPath()[0].tagName === "HIDE-SIDEBAR-BUTTON") {
            if (this.isSideBarOnScreen()) {
                this.hideSidebar();
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

    highlightSidebarFirstBoardButton() {
        setTimeout(() => {
            this.shadowRoot.querySelector('side-bar').setFirstBoardToCurrent();
        }, 0);
    }
}

if (!window.customElements.get('kanban-app')) {
	window.customElements.define('kanban-app', App);
}