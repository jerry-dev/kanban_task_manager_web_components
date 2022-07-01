import AddNewTaskButtonStyleSheet from './addnewtaskbutton.css' assert { type: 'css' };

export default class AddNewTaskButton extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ AddNewTaskButtonStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<div id="innerContainer">+ Add New Task</div>`;

        this.shadowRoot.innerHTML = markup;
    }
}

window.customElements.define('add-new-task-button', AddNewTaskButton);