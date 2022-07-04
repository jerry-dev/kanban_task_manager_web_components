import sidebarStyleSheet from './sidebar.css' assert { type: 'css' };
import AppLogo from '../applogo/AppLogo.js';

export default class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
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
        <label for="sideBarNav">ALL BOARDS (3)</label>
        <nav id="sideBarNav">
            <ul>
                <li>
                    <a href="#/">Platform Launch</a>
                </li>
                <li>
                    <a href="#/two">Marketing Plan</a>
                </li>
                <li>
                    <a href="#/two">Roadmap</a>
                </li>
            </ul>
        </nav>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('side-bar')) {
    window.customElements.define('side-bar', Sidebar)
}