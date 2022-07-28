import appHeaderStylesheet from './appheader.css' assert { type: 'css' };
import AddNewTaskButton from '../addnewtaskbutton/AddNewTaskButton.js';
import AppLogo from '../applogo/AppLogo.js';
import KebabMenuButton from '../kebabmenubutton/KebabMenuButton.js';

export default class AppHeader extends HTMLElement {
    constructor() {
        super()
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
        this.shadowRoot.adoptedStyleSheets = [ appHeaderStylesheet ];
    }

    HTML() {
        const markup = /*html*/
        `<section id="logoContainer" data-behavior>
            <app-logo></app-logo>
        </section>
            
        <section id="sectionTitleSection">
            <div id="sectionTitleSectionInnerContainer">
                <h2>${this.getAttribute('currentboard')}</h2>
                <add-new-task-button currentboard="${this.getAttribute('currentboard')}"></add-new-task-button>
                <kebab-menu-button currentboard="${this.getAttribute('currentboard')}" altering="Board"></kebab-menu-button>
            </div>
        </section>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('app-header')) {
    window.customElements.define('app-header', AppHeader);
}