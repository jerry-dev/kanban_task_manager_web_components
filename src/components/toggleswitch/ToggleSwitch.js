import toggleSwitchStyleSheet from './toggleswitch.css' assert { type: 'css' };

export default class ToggleSwitch extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ toggleSwitchStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<input type="checkbox" id="toggleSwitch">
        <label for="toggleSwitch">
            <span></span>
        </label>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('toggle-switch')) {
    window.customElements.define('toggle-switch', ToggleSwitch);
}