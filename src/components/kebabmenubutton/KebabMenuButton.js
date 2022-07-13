import kebabMenuButtonStyleSheet from './kebabmenubutton.css' assert { type: 'css' };

export default class KebabMenuButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.menuManager = this.menuManager.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
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
        this.shadowRoot.adoptedStyleSheets = [ kebabMenuButtonStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<div id="kebabMenuButtonInnerContainer">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <dialog class="popupMenu">
            <span class="popupMenuInnerContainer">
                <button class="kebabEditMenuButton" type="button">Edit ${this.getAttribute('altering')}</button>
                <button class="kebabDeleteMenuButton" type="button">Delete ${this.getAttribute('altering')}</button>
            </span>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.menuManager();
    }

    menuManager() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.composedPath()[0].id === 'kebabMenuButtonInnerContainer') {
                this.toggleMenu();
            }
        });
    }

    toggleMenu() {
        const theDialog = this.shadowRoot.querySelector('dialog');

        if (!theDialog.open) {
            theDialog.showModal();
        } else {
            theDialog.close();
        }
    }

    isMenuShowing() {
        return this.shadowRoot.querySelector('dialog').open === true;
    }
}

window.customElements.define('kebab-menu-button', KebabMenuButton);
