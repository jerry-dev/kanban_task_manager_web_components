import newColumnButtonStyleSheet from './newcolumnbutton.css' assert {type: 'css'};
import store from '../../lib/store/index.js';

export default class NewColumnButton extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ newColumnButtonStyleSheet ];
    }

    HTML() {
        const markup = /*html*/`<p>+ New Column</p>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('new-column-button')) {
    window.customElements.define('new-column-button', NewColumnButton);
}