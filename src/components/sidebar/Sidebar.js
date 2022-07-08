import sidebarStyleSheet from './sidebar.css' assert { type: 'css' };
import AppLogo from '../applogo/AppLogo.js';
import HideSidebarButton from '../hidesidebarbutton/HideSidebarButton.js';
import DarkLightModeSwitch from '../darklightmodeswitch/DarkLightModeSwitch.js';
import BoardNavigationButton from '../boardnavigationbutton/BoardNavigationButton.js';
import store from '../../lib/store/index.js';

export default class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
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
        `<app-logo></app-logo>
        <label for="sideBarNav">ALL BOARDS (${this.getNumberOfBoards()})</label>
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
        this.refresh()
    }

    // generateBoardNavListElements() {
    //     let collection = '';

    //     this.store.state.boards.forEach((item) => {
    //         const reformattedLink = item.name.replace(" ", "-").toLowerCase();
    //         const hashReformatted = window.location.hash.replace(" ", "-").toLowerCase().replace("#/", "");

    //         const isCurrentClassCheck = (hashReformatted === reformattedLink) ? `class="current"` : null; 

    //         collection += /*html*/
    //         `<li ${isCurrentClassCheck}>
    //             <a href="#/${reformattedLink}">
    //                 <img src="./src/assets/icons/fluent_board-split-24-regular.svg"/>${item.name}
    //             </a>
    //         </li>`;
    //     });

    //     return collection;
    // }

    // `<a href="#/${this.getAttribute('boardname')}">
    //         <img src="./src/assets/icons/fluent_board-split-24-regular.svg"/>${this.getAttribute('boardname')}
    //     </a>`;

    generateBoardNavListElements() {
        let collection = '';

        this.store.state.boards.forEach((item) => {
            const reformattedLink = item.name.replace(" ", "-").toLowerCase();
            const hashReformatted = window.location.hash.replace(" ", "-").toLowerCase().replace("#/", "");

            const isCurrent = (hashReformatted === reformattedLink) ? true : false; 

            collection += /*html*/
            `<li ${(isCurrent) ? 'class="current"': ""} id=${reformattedLink}>
                <board-navigation-button
                    link=${reformattedLink}
                    boardname=${JSON.stringify(item.name).replace(" ", "__")}
                    isCurrent=${(isCurrent) ? true: false}
                ></board-navigation-button>
            </li>`;
        });

        return collection;
    }

    refresh() {
        window.addEventListener('popstate', () => {
            const currentLocation = window.location.hash.replace(" ", "-").toLowerCase().replace("#/", "");
            const liCollection = this.shadowRoot.querySelectorAll('li');
            liCollection.forEach((li) => {
                if (currentLocation === li.id) {
                    li.classList.add('current');
                    li.getElementsByTagName('board-navigation-button')[0].classList.add('current');
                } else {
                    li.classList.remove('current');
                    li.getElementsByTagName('board-navigation-button')[0].classList.remove('current');
                }
            })
        });
    }
}

if (!window.customElements.get('side-bar')) {
    window.customElements.define('side-bar', Sidebar)
}