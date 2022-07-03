import appLogoStylesheet from './applogo.css' assert { type: 'css' };

export default class AppLogo extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ appLogoStylesheet ];
    }

    HTML() {
        const markup = /*html*/
        `<div id="logoInnerContainer">
            <div id="logoBarsContainer">
                <span class="logoBars" id="logoBarOne"></span>
                <span class="logoBars" id="logoBarTwo"></span>
                <span class="logoBars" id="logoBarThree"></span>
            </div>
            <h2>Kanban</h2>
        </div>`;

        this.shadowRoot.innerHTML = markup;
    }
}

window.customElements.define('app-logo', AppLogo);