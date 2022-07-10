import taskPreviewStyleSheet from './taskpreview.css' assert { type: 'css' };
import store from '../../lib/store/index.js';

export default class TaskPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
        // this.store.observer.subscribe('stateChange', this.render);
        this.render();
    }

    render() {
        this.CSS();
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ taskPreviewStyleSheet ];
    }
    // columnname
    HTML() {
        const markup = /*html*/
        `<span class="taskInnerContainer">
            <h3 class="taskTitle">${this.getAttribute('title')}</h3>
            <small>${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')} subtasks</small>
        </span>
        <dialog>
            <form class="dialogForm">
                <span class="dialogFormInnerContainer">
                    <h3 class="dialogTaskTitle">${this.getAttribute('title')}</h3>
                    <p class="dialogTaskDescription">${this.getAttribute('description')}</p>
                    <small class="dialogCompletionStats">Subtasks (${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')})</small>
                    <ul class="taskCheckboxList">
                        ${this.generateListElements(JSON.parse(this.getAttribute('subtasks').replace(/__/g, " ")))}
                    </ul>
                </span>
            </form>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.clickManager();
        this.formChangeManager();
    }

    clickManager() {
        this.addEventListener('click', () => {
            this.dialogManager();
        });
    }

    formChangeManager() {
        this.shadowRoot.querySelector('form').addEventListener('change', () => {
            console.log('CHANGED!');
            // DISPATCH THE CHANGE
        });
    }

    generateListElements(subtasks) {
        let subtasksListElementsMarkup = ``;

        subtasks.forEach((task) => {
            subtasksListElementsMarkup += /*html*/ `
            <li>
                <label>
                    <input type="checkbox" ${(task.isCompleted ? "checked" : "")}/> ${task.title}
                </label>
            </li>`;
        });

        return subtasksListElementsMarkup;
    }

    dialogManager() {
        const theDialog = this.shadowRoot.querySelector('dialog');

        if (!theDialog.open) {
            theDialog.showModal();
            this.addEventListener('click', (event) => {
                this.closeDialog(event, theDialog);
            })
        }
        
    }

    closeDialog(event, theDialog) {
        if (!theDialog.open) return;

        if (event.composedPath()[0].nodeName === "DIALOG") {
            theDialog.close();
        }        
    }
}

window.customElements.define('task-preview', TaskPreview);