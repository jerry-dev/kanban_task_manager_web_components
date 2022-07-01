import appHeaderStylesheet from './appheader.css' assert { type: 'css' };

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
        `<div>
            <div id="logoOuterContainer">
                <div id="logoInnerContainer">
                    <h2>KANBAN</h2>
                </div>
            </div>
            
            </div id="sectionTitleSection">
                <div id="sectionTitleSectionInnerContainer">
                    <h2>Platform Launch</h2>
                </div>
            </div>
        </div>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('app-header')) {
    window.customElements.define('app-header', AppHeader);
}