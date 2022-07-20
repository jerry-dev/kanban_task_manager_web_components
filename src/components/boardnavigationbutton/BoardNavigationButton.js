import boardNavigationButtonStyleSheet from './boardnavigationbutton.css' assert { type: 'css' };

export default class BoardNavigationButton extends HTMLElement {
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
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ boardNavigationButtonStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<a href="#/${this.getAttribute('link').replace(" ", "-")}">
            <img src="./src/assets/icons/fluent_board-split-24-regular.svg"/>${this.getAttribute('boardname')}
        </a>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        if (this.getAttribute('isCurrent') === 'true') {
            this.classList.add('current');
        }
    }
}

window.customElements.define('board-navigation-button', BoardNavigationButton);
