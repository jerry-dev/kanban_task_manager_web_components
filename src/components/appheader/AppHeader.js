import appHeaderStylesheet from './appheader.css' assert { type: 'css' };
import AddNewTaskButton from '../addnewtaskbutton/AddNewTaskButton.js';
import AppLogo from '../applogo/AppLogo.js';

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
        `<section id="logoOuterContainer" data-behavior>
            <app-logo></app-logo>
        </section>
            
        <section id="sectionTitleSection">
            <div id="sectionTitleSectionInnerContainer">
                <h2>Platform Launch</h2>
                <add-new-task-button></add-new-task-button>
                <div id="kebabMenu">
                   <span class="dots"></span>
                   <span class="dots"></span>
                   <span class="dots"></span>
                </div>
            </div>
        </section>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('app-header')) {
    window.customElements.define('app-header', AppHeader);
}