import tasksBoardStyleSheet from './tasksboard.css' assert {type: 'css'};
import AppHeader from '../appheader/AppHeader.js';

export default class Tasksboard extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ tasksBoardStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<app-header></app-header>    
        <div id="componentInnerContainer">
            <slot></slot>
        </div>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('tasks-board')) {
    window.customElements.define('tasks-board', Tasksboard)
}