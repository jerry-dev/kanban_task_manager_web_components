import appStyleSheet from './app.css' assert { type: 'css' };
import appTabletStyleSheet from './apptablet.css' assert { type: 'css' };
import appMobileStyleSheet from './appmobile.css' assert { type: 'css' };
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
        this.initializeComponentState();
        this.store.observer.subscribe(this, 'stateChange', () => {
            this.refresh();
        })
        this.render();
        this.routerInit();
    }

    render() {
        this.CSS();
        this.HTML(this.reformatHashToPropertyText(window.location.hash));
        this.SCRIPTS();
        
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [
            appStyleSheet,
            appTabletStyleSheet,
            appMobileStyleSheet
        ];
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

    getName() {
        return 'App';
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

        // router.resolve();
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
        this.HTML(boardName);
        this.forceChildBoardToSubscribe();
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = {
            boards: this.getBoards(),
            numberOfBoards: this.getBoards().length,
            currentBoard: this.reformatHashToPropertyText(window.location.hash),
            theme: this.getTheme()
        };

        if (!this.state.currentBoard) {
            this.state.currentBoard = this.state.boards[0];
            this.shadowRoot.textContent = '';
            this.navigateToTheFirstBoard();
        }
        
        this.updateOldState();
    }

    refresh() {
        this.state.boards = this.getBoards();
        this.state.numberOfBoards = this.state.boards.length;
        this.state.currentBoard = this.reformatHashToPropertyText(window.location.hash);
        this.state.theme = this.getTheme();

        if (this.didComponentStateChange()) {
            this.renderTasksBoard(this.getCurrentBoard());

            if (this.didNumberOfBoardsShrink()) {
                this.navigateToTheFirstBoard();
            } else if (this.didNumberOfBoardsGrow()) {
                this.navigateToTheNewBoard();
            } else {
                this.navigateToTheChangedBoard();
            }

            this.updateOldState();
        }

        this.applyTheme();
    }

    // Expecting window.location.hash
    reformatHashToPropertyText(hashText) {
        if (!hashText) return;
        const result = hashText.replace("#/", "").split("")
        result[0] = result[0].toUpperCase();

        for (let i = 0; i < result.length; i++) {
            
            if (result[i] === "-") {
                result[i+1] = result[i+1].toUpperCase();
            }
        }

        return result.join("").replace("-", " ");
    }

    navigateToTheChangedBoard() {
        for (let i = 0; i < this.state.boards.length; i++) {
            if (this.oldState.boards.indexOf(this.state.boards[i]) === -1) {
                router.navigate(this.state.boards[i]);
                break;
            }
        }
    }

    forceChildBoardToSubscribe() {
        this.shadowRoot.querySelector('tasks-board').subscribeToTheStore();
    }

    didNumberOfBoardsShrink() {
        return JSON.stringify(this.oldState.numberOfBoards) > JSON.stringify(this.state.numberOfBoards)
    }

    didNumberOfBoardsGrow() {
        return JSON.stringify(this.oldState.numberOfBoards) < JSON.stringify(this.state.numberOfBoards)
    }

    getBoards() {
        let result = [];

        for (let i = 0; i < this.store.state.boards.length; i++) {
            const reformattedBoardName = this.store.state.boards[i].name.replace(" ", "-").toLowerCase();
            result[result.length] = reformattedBoardName;
        }

        return result;
    }

    getMainRoute() {
        return this.shadowRoot.querySelector('tasks-board').shadowRoot.getElementById('mainRoute');
    }

    navigateToTheFirstBoard() {
        const firstBoard = this.state.boards[0];
        router.navigate(`${firstBoard}`);
        this.highlightSidebarFirstBoardButton();
    }

    navigateToTheNewBoard() {
        const newBoard = this.state.boards[this.state.boards.length-1];
        router.navigate(`${newBoard}`);
        this.highlightSidebarNewBoardButton();
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
        const oldState = `${JSON.stringify(this.oldState.numberOfBoards)}${JSON.stringify(this.oldState.boards)}`;
		const currentState = `${JSON.stringify(this.state.numberOfBoards)}${JSON.stringify(this.state.boards)}`;
        return oldState !== currentState;
    }

    SCRIPTS() {
        this.clickManager();
        this.applyTheme();
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

    getToggleSwitchInput() {
        return this.shadowRoot.querySelector("side-bar").shadowRoot
            .querySelector('dark-light-mode-switch').shadowRoot
            .querySelector('toggle-switch').shadowRoot
            .querySelector('#toggleSwitch');
    }

    getTheme() {
        return this.store.state.theme;
    }

    applyTheme() {
        if (this.state.theme === "light") {
            this.getToggleSwitchInput().removeAttribute("checked");
            this.classList.remove('darkTheme');
        }

        if (this.state.theme === "dark") {
            this.getToggleSwitchInput().setAttribute("checked", "");
            this.classList.add('darkTheme');
        }
    }

    setThemeToLight() {
        this.getToggleSwitchInput().setAttribute("checked", "");
        this.classList.remove('darkTheme');
        this.store.dispatch({ type: 'SET_THEME', payload: 'light' });
    }

    setThemeToDark() {
        this.getToggleSwitchInput().removeAttribute("checked");
        this.classList.add('darkTheme');
        this.store.dispatch({ type: 'SET_THEME', payload: 'dark' });
    }

    darkThemeToggle(event) {
        if (event.composedPath()[0].id === "toggleSwitch") {
            const toggleInput = event.composedPath()[0];

            (!toggleInput.checked) ? this.setThemeToLight() : this.setThemeToDark();
        }
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

    highlightSidebarNewBoardButton() {
        setTimeout(() => {
            this.shadowRoot.querySelector('side-bar').setNewBoardToCurrent();
        }, 0);
    }
}

if (!window.customElements.get('kanban-app')) {
	window.customElements.define('kanban-app', App);
}