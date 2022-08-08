import sidebarStyleSheet from './sidebar.css' assert { type: 'css' };
import sidebarTabletStyleSheet from './sidebartablet.css' assert { type: 'css' };
import sidebarMobileStyleSheet from './sidebarmobile.css' assert { type: 'css' };
import AppLogo from '../applogo/AppLogo.js';
import HideSidebarButton from '../hidesidebarbutton/HideSidebarButton.js';
import DarkLightModeSwitch from '../darklightmodeswitch/DarkLightModeSwitch.js';
import BoardNavigationButton from '../boardnavigationbutton/BoardNavigationButton.js';
import CreateNewBoardButton from '../createnewboardbutton/CreateNewBoardButton.js';
import store from '../../lib/store/index.js';

export default class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
        this.initializeComponentState();
        this.store.observer.subscribe(this, 'stateChange', () => {
            this.refresh();
        })
        this.render();
    }

    render() {
        this.CSS();
        this.HTML();
        this.SCRIPTS()
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [
            sidebarStyleSheet,
            sidebarTabletStyleSheet,
            sidebarMobileStyleSheet
        ];
    }

    HTML() {
        let markup = /*html*/
        `<label for="sideBarNav">ALL BOARDS (${this.state.numberOfBoards})</label>
        <nav id="sideBarNav">
            <ul>
                ${this.generateBoardNavListElements()}
            </ul>
        </nav>

        <dark-light-mode-switch></dark-light-mode-switch>
        <hide-sidebar-button></hide-sidebar-button>`;       

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.highlighCurrentBoardOnPopState();
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = {
            numberOfBoards: this.getNumberOfBoards(),
            boards: this.getBoardsData(),
        };
        
        this.updateOldState();
    }

    getBoardsData() {
        const boards = [];

        this.store.state.boards.forEach((item) => {
            const board = { };
            board.name = item.name;
            board.link = item.name.replace(" ", "-").toLowerCase();

            boards[boards.length] = board;
        });

        return boards;
    }

    getNumberOfBoards() {
        return this.store.state.boards.length;
    }

    getName() {
        return 'Sidebar';
    }

    refresh() {
        this.state = {
            numberOfBoards: this.getNumberOfBoards(),
            boards: this.getBoardsData(),
        };

        if (this.didComponentStateChange()) {
            this.updateOldState();
            this.refreshUI();
        }
    }

    refreshUI() {
        this.shadowRoot.textContent = '';
        this.HTML();
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    didComponentStateChange() {
        return JSON.stringify(this.oldState.boards) !== JSON.stringify(this.state.boards);
    }

    generateBoardNavListElements() {
        let collection = '';

        this.state.boards.forEach((item) => {
            const hashReformatted = window.location.hash.replace(" ", "-").toLowerCase().replace("#/", "");
            const isCurrent = (hashReformatted === item.link) ? true : false; 

            collection += /*html*/
            `<li ${(isCurrent) ? 'class="current"': ""} id="${item.name}">
                <board-navigation-button
                    link="${item.link}"
                    boardname="${item.name}"
                    isCurrent=${(isCurrent) ? true: false}
                ></board-navigation-button>
            </li>`;
        });

        collection += /*html*/ `<li><create-new-board-button></create-new-board-button></li>`;

        return collection;
    }

    highlighCurrentBoardOnPopState() {
        window.addEventListener('popstate', () => {
            const currentLocation = window.location.hash.replace(" ", "-").toLowerCase().replace("#/", "");
            const liCollection = this.shadowRoot.querySelectorAll('li');
            liCollection.forEach((li) => {
                if (!li.getElementsByTagName('create-new-board-button')[0]) {
                    if (currentLocation === li.id) {
                        li.classList.add('current');
                        li.getElementsByTagName('board-navigation-button')[0].classList.add('current');
                    } else {
                        li.classList.remove('current');
                        li.getElementsByTagName('board-navigation-button')[0].classList.remove('current');
                    }
                }
            })
        });
    }

    setFirstBoardToCurrent() {
        const firstLi = Array.from(this.shadowRoot.querySelectorAll('li'))[0];

        firstLi.classList.add('current');
        firstLi.getElementsByTagName('board-navigation-button')[0].classList.add('current');
    }

    setNewBoardToCurrent() {
        const liCollection = Array.from(this.shadowRoot.querySelectorAll('li'));

        // Length - 2 because the last li element features the + Create New Board Button
        for (let i = 0; i < liCollection.length - 2; i++) {
            liCollection[i].classList.remove('current');
            liCollection[i].getElementsByTagName('board-navigation-button')[0].classList.remove('current');
        }

        // Length - 2 because the last li element features the + Create New Board Button
        liCollection[liCollection.length - 2].classList.add('current');
        liCollection[liCollection.length - 2].getElementsByTagName('board-navigation-button')[0].classList.add('current');
    }
}

if (!window.customElements.get('side-bar')) {
    window.customElements.define('side-bar', Sidebar)
}