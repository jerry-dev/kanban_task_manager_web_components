import sidebarStyleSheet from './sidebar.css' assert { type: 'css' };
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
        this.store.observer.subscribe('stateChange', () => {this.render()})
        this.render();
    }

    render() {
        this.CSS();
        this.HTML();
        this.SCRIPTS()
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ sidebarStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<label for="sideBarNav">ALL BOARDS (${this.getNumberOfBoards()})</label>
        <nav id="sideBarNav">
            <ul>
                ${this.generateBoardNavListElements()}
            </ul>
        </nav>

        <dark-light-mode-switch></dark-light-mode-switch>
        <hide-sidebar-button></hide-sidebar-button>`;

        this.shadowRoot.innerHTML = markup;
    }

    getNumberOfBoards() {
        return this.store.state.boards.length;
    }

    SCRIPTS() {
        this.currentBoardHighlighter()
    }

    generateBoardNavListElements() {
        let collection = '';

        this.store.state.boards.forEach((item) => {
            const reformattedLink = item.name.replace(" ", "-").toLowerCase();
            const hashReformatted = window.location.hash.replace(" ", "-").toLowerCase().replace("#/", "");

            const isCurrent = (hashReformatted === reformattedLink) ? true : false; 

            collection += /*html*/
            `<li ${(isCurrent) ? 'class="current"': ""} id=${reformattedLink}>
                <board-navigation-button
                    link="${reformattedLink}"
                    boardname="${item.name}"
                    isCurrent=${(isCurrent) ? true: false}
                ></board-navigation-button>
            </li>`;
        });

        collection += /*html*/ `<li><create-new-board-button></create-new-board-button></li>`;

        return collection;
    }

    currentBoardHighlighter() {
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
}

if (!window.customElements.get('side-bar')) {
    window.customElements.define('side-bar', Sidebar)
}