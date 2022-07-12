import tasksboardColumnStyleSheet from './tasksboardcolumn.css' assert { type: 'css' };
import TaskPreview from '../taskpreview/TaskPreview.js';
import store from '../../lib/store/index.js';

export default class TasksboardColumn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
        // this.store.observer.subscribe('stateChange', this.render); //NO use here
        this.render();
    }

    render() {
        this.CSS();
        this.HTML();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ tasksboardColumnStyleSheet ];
    }

    HTML() {
        const columnData = JSON.parse(this.getAttribute('columndata').replace(/__/g, " "));
        const columnName = this.getAttribute('columnname');

        const markup = /*html*/
        `<h4 class="columnTitle"><span class="circle" data-color=${this.getAttribute('colorindex')}></span>${this.getAttribute('columnname')} (${this.getAttribute('numberoftasks')})</h4>
        <ul>${columnData[columnName].map((taskInstances) => {
            const totalSubtasks = taskInstances.subtasks.length;
            let completedSubtasks = 0;

            taskInstances.subtasks.forEach((item) => {
                if (item.isCompleted) {
                    completedSubtasks++;
                }
            });

            return /*html*/ `
            <li>
                <task-preview
                    role="button"
                    board=${this.getAttribute('board')}
                    title=${JSON.stringify(taskInstances.title)}
                    description=${JSON.stringify(taskInstances.description)}
                    completedsubtasks=${completedSubtasks}
                    totalsubtasks=${totalSubtasks}
                    columnname=${columnName}
                    subtasks=${JSON.stringify(taskInstances.subtasks).replace(/ /g, "__")}
                ></task-preview>
            </li>`;
            }).join('')}</ul>`;

        this.shadowRoot.innerHTML = markup;
    }
}

window.customElements.define('tasksboard-column', TasksboardColumn);