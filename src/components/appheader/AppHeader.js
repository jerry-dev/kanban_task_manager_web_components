import appHeaderStylesheet from './appheader.css' assert { type: 'css' };
import appHeaderTabletStylesheet from './appheadertablet.css' assert { type: 'css' };
import appHeaderMobileStylesheet from './appheadermobile.css' assert { type: 'css' };
import AddNewTaskButton from '../addnewtaskbutton/AddNewTaskButton.js';
import AppLogo from '../applogo/AppLogo.js';
import KebabMenuButton from '../kebabmenubutton/KebabMenuButton.js';
import DarkLightModeSwitch from '../darklightmodeswitch/DarkLightModeSwitch.js';
import store from '../../lib/store/index.js';

export default class AppHeader extends HTMLElement {
    constructor() {
        super()
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
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [
            appHeaderStylesheet,
            appHeaderTabletStylesheet,
            appHeaderMobileStylesheet
        ];
    }

    HTML() {
        let markup = /*html*/
        `<section id="logoContainer">
            <app-logo></app-logo>
        </section>
            
        <section id="sectionTitleSection">
            <app-logo mobilestyle></app-logo>
            <div id="sectionTitleSectionInnerContainer">
                <h2>${this.state.currentBoard}</h2>
                <button id="showNavButton" type="button"><img alt="launch navigation icon" src="./src/assets/icons/down-arrow.svg"/></button>
                <add-new-task-button currentboard="${this.state.currentBoard}"></add-new-task-button>
                <kebab-menu-button currentboard="${this.state.currentBoard}" altering="Board"/></kebab-menu-button>
            </div>
        </section>`;

        markup += /*html*/
        `<dialog id="mobileNavDialog">
            <span id="mobileNavDialogInnerContainer">
                <label for="mobileNavList">ALL BOARDS (${this.state.numberOfBoards})</label>
                <nav id="mobileNavList" name="mobileNavList">
                    <ul>
                        ${this.generateBoardNavListElements()}
                    </ul>
                </nav>
                <dark-light-mode-switch/>
            </span>
        <dialog>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.showNavButtonClickListener();
        this.overlayClickListener();
        this.mobileNavDialogClosedListener();
        this.applyTheme();
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = {
            currentBoard: this.getAttribute('currentboard'),
            numberOfBoards: this.getNumberOfBoards(),
            boards: this.getBoardsData(),
            theme: this.getTheme()
        };
        
        this.updateOldState();
    }

    showNavButtonClickListener() {
        const showNavButton = this.getShowNavDialogButton();

        showNavButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.launchMobileNavDialog();            
        });
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    didComponentStateChange() {
        return JSON.stringify(this.oldState.currentBoard) !== JSON.stringify(this.state.currentBoard);
    }

    refresh() {
        this.state = {
            currentBoard: this.getAttribute('currentboard'),
            numberOfBoards: this.getNumberOfBoards(),
            boards: this.getBoardsData(),
            theme: this.getTheme()
        };

        if (this.didComponentStateChange()) {
            this.refreshUI();
            this.updateOldState();
        }

        this.applyTheme();
    }

    refreshUI() {
        this.shadowRoot.textContent = '';
        this.HTML();
        
    }

    getName() {
        return 'AppHeader';
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

    isMobileNavDialogShowing() {
        return this.getMobileNavDialog().open === true;
    }

    getMobileNavDialog() {
        return this.shadowRoot.querySelector('#mobileNavDialog');
    }

    launchMobileNavDialog() {
        if (!this.isMobileNavDialogShowing()) {
            this.getMobileNavDialog().showModal();
            this.flipArrow();
        }
    }

    closeMobileNavDialog() {
        if (this.isMobileNavDialogShowing()) {
            this.getMobileNavDialog().close();
        }
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

    getShowNavDialogButton() {
        return this.shadowRoot.querySelector('#showNavButton');
    }

    flipArrow() {
        this.getShowNavDialogButton().querySelector('img').classList.add('flipped');
    }

    unFlipArrow() {
        this.getShowNavDialogButton().querySelector('img').classList.remove('flipped');
    }

    mobileNavDialogClosedListener() {
        const mobileNavDialog = this.getMobileNavDialog();

        mobileNavDialog.addEventListener('close', () => {
            this.unFlipArrow();
        });
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

    getToggleSwitchInput() {
        return this.shadowRoot.querySelector('dark-light-mode-switch').shadowRoot
            .querySelector('toggle-switch').shadowRoot
            .querySelector('#toggleSwitch');
    }

    getTheme() {
        return this.store.state.theme;
    }

    overlayClickListener() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.composedPath()[0].id === "mobileNavDialog") {
                this.closeMobileNavDialog();
            }
        });
    }
}

if (!window.customElements.get('app-header')) {
    window.customElements.define('app-header', AppHeader);
}