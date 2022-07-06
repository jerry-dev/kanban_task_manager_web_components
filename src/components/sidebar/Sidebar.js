import sidebarStyleSheet from './sidebar.css' assert { type: 'css' };
import AppLogo from '../applogo/AppLogo.js';
import HideSidebarButton from '../hidesidebarbutton/HideSidebarButton.js';
import DarkLightModeSwitch from '../darklightmodeswitch/DarkLightModeSwitch.js';
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

    generateBoardNavListElements() {
        let collection = '';

        this.store.state.boards.forEach((item) => {
            const reformattedLink = item.name.replace(" ", "").toLowerCase();

            collection += `<li><a href="#/${reformattedLink}">${item.name}</a></li>`;
        });

        return collection;
    }
}

if (!window.customElements.get('side-bar')) {
    window.customElements.define('side-bar', Sidebar)
}