import kebabMenuButtonStyleSheet from './kebabmenubutton.css' assert { type: 'css' };

export default class KebabMenuButton extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ kebabMenuButtonStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<div id="kebabMenuButtonInnerContainer">
            <span></span>
            <span></span>
            <span></span>
        </div>`

        this.shadowRoot.innerHTML = markup;
    }
}

window.customElements.define('kebab-menu-button', KebabMenuButton);
