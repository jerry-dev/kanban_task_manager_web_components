import taskPreviewStyleSheet from './taskpreview.css' assert { type: 'css' };

export default class TaskPreview extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ taskPreviewStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<span>
            <h3>${this.getAttribute('title')}</h3>
            <small>${this.getAttribute('completedSubtasks')} of ${this.getAttribute('totalSubtasks')} subtasks</small>
        </span>`;

        this.shadowRoot.innerHTML = markup;
    }
}

window.customElements.define('task-preview', TaskPreview);