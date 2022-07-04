import hideSidebarButtonStyleSheet from './hidesidebarbutton.css' assert { type: 'css' };

export default class HideSidebarButton extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ hideSidebarButtonStyleSheet ];
    }

    HTML() {
        const markup = /*HTML*/
        `<img src="../../src/assets/icons/eye-slash.1.svg"/>
        <p>Hide Sidebar</p>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('hide-sidebar-button')) {
    window.customElements.define('hide-sidebar-button', HideSidebarButton)
}