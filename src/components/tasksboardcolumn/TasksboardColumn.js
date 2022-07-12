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
        this.store.observer.subscribe('stateChange', () => {
            this.refresh();
        });
        this.render();
    }

    render() {
        this.CSS();
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ tasksboardColumnStyleSheet ];
    }

    HTML() {
        const columnData = JSON.parse(this.getAttribute('columndata').replace(/__/g, " "));
        const columnName = this.getAttribute('columnname');

        const markup = /*html*/
        `<h4 class="columnTitle"><span class="circle" data-color=${this.getAttribute('colorindex')}></span>${this.getAttribute('columnname').toUpperCase()} (${this.getAttribute('numberoftasks')})</h4>
        <ul>${columnData[columnName].map((taskInstances) => {
            const totalSubtasks = taskInstances.subtasks.length;
            let completedSubtasks = 0;

            taskInstances.subtasks.forEach((item) => {
                if (item.isCompleted) {
                    completedSubtasks++;
                }
            });

            return /*html*/ `
            <li class="initialLoad">
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

    SCRIPTS() {
        this.setDefaultStateValues();
    }

    setDefaultStateValues() {
        this.state = {
            numberoftasks: Number(this.getAttribute('numberoftasks')),
            newNumberOfTasks: 0
        }
    }

    numberOfElementsHasGrown() {
        if ((this.state.numberoftasks + 1) === this.state.newNumberOfTasks) {
            // console.log(`Column ${this.getAttribute('columnname')} has grown`);
            return true;
        }
    }

    updateDefaultStateValues() {
        this.state.numberoftasks = this.state.newNumberOfTasks
    }

    updateNewNumberOfTasks(count) {
        this.state.newNumberOfTasks = count;
    }

    refresh() {
        const theBoard = this.getAttribute('board');
        const columnName = this.getAttribute('columnname');

        for (let i = 0; i < this.store.state.boards.length; ++i) {
            if (this.store.state.boards[i].name.toLowerCase().replace(/ /g, "-") === theBoard) {
                for (let j = 0; j < this.store.state.boards.length; ++j) {
                    if (this.store.state.boards[i].columns[j].name === columnName) {

                        this.updateNewNumberOfTasks(this.store.state.boards[i].columns[j].tasks.length);
                        const markup = /*html*/
                        `<h4 class="columnTitle"><span class="circle" data-color=${this.getAttribute('colorindex')}></span>${columnName} (${this.store.state.boards[i].columns[j].tasks.length})</h4>
                        <ul>${this.store.state.boards[i].columns[j].tasks.map((taskInstances, index) => {
                            const totalSubtasks = taskInstances.subtasks.length;
                            let completedSubtasks = 0;

                            taskInstances.subtasks.forEach((item) => {
                                if (item.isCompleted) {
                                    completedSubtasks++;
                                }
                            });

                            let hydrationClass = '';
                            if (this.numberOfElementsHasGrown()) {
                                if (index === this.store.state.boards[i].columns[j].tasks.length - 1) {
                                    hydrationClass = 'class="rehydrate"'
                                }
                            }
                            
                            return /*html*/ `
                            <li ${hydrationClass}>
                                <task-preview
                                    role="button"
                                    board=${theBoard}
                                    title=${JSON.stringify(taskInstances.title)}
                                    description=${JSON.stringify(taskInstances.description)}
                                    completedsubtasks=${completedSubtasks}
                                    totalsubtasks=${totalSubtasks}
                                    columnname=${columnName}
                                    subtasks=${JSON.stringify(taskInstances.subtasks).replace(/ /g, "__")}
                                ></task-preview>
                            </li>`;
                            }).join('')}</ul>`;

                            this.updateDefaultStateValues();
                            setTimeout(() => {this.shadowRoot.innerHTML = markup;}, 400);
                            
                    }
                }
            }
        }
    }
}

window.customElements.define('tasksboard-column', TasksboardColumn);