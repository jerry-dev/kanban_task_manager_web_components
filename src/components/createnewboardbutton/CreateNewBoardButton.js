import createNewBoardButtonStyleSheet from './createnewboardbutton.css' assert { type: 'css' };

export default class CreateNewBoardButton extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ createNewBoardButtonStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<img src="./src/assets/icons/fluent_board-split-24-regular.svg"/>+ Create New Board`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.clickManagers();
    }

    clickManagers() {
        this.createNewBoardOnClick();
    }

    createNewBoardOnClick() {
        
    }
}

if (!window.customElements.get('create-new-board-button')) {
    window.customElements.define('create-new-board-button', CreateNewBoardButton);
}