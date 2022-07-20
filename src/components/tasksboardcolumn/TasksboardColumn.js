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
            this.rehydrate();
        });
        this.state = {};
        this.render();
    }

    render() {
        this.initializeComponentState();
        this.CSS();
        this.HTML("initialLoad");
    }

    initializeComponentState() {
        let reformattedBoardName = this.getAttribute('board').split("");
        reformattedBoardName[0] = reformattedBoardName[0].toUpperCase();

        for (let i = 0; i < reformattedBoardName.length; i++) {
            if (reformattedBoardName[i] === "-") {
                reformattedBoardName[i] = " "
                reformattedBoardName[i+1] = reformattedBoardName[i+1].toUpperCase();
                break;
            }
        }

        this.state.board = reformattedBoardName.join("");
        this.state.columnName = this.getAttribute('columnname');
        this.state.columnData = [];
        this.state.title = this.getAttribute('title');
        this.state.colorIndex = this.getAttribute('colorindex');
        

        // Searching for the component's associated data based on the title and column name
        // Once found, hydrate the this.state.x and this.state.y
        // First loop: Iterating through the boards array
        for (let i = 0; i < this.store.state.boards.length; i++) {
            // Checking if the loop is at the board the component is in using the boards name
            if (this.store.state.boards[i].name === this.state.board) {
                // Second loop: While in the matched board, iterating over the array columns
                for (let j = 0; j < this.store.state.boards[i].columns.length; j++) {
                    // Checking if the second loop is at the column the component is in using the column name
                    if (this.store.state.boards[i].columns[j].name === this.state.columnName) {
                        this.state.columnData = this.store.state.boards[i].columns[j];
                    }
                }
            }
        }
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ tasksboardColumnStyleSheet ];
    }

    rehydrate() {
        this.initializeComponentState();
        this.HTML("rehydrate");
    }

    HTML(renderState) {
        if (this.state.columnData.length < 1) {
            this.noTaskRender();
        } else {
            const markup = /*html*/
            `<h4 class="columnTitle"><span class="circle" data-color=${this.state.colorIndex}></span>${this.state.columnName.toUpperCase()} (${this.getAttribute('numberoftasks')})</h4>
            <ul>${this.state.columnData.tasks.map((taskInstances) => {
                const totalSubtasks = taskInstances.subtasks.length;
                let completedSubtasks = 0;

                taskInstances.subtasks.forEach((item) => {
                    if (item.isCompleted) {
                        completedSubtasks++;
                    }
                });

                if (renderState === "initialLoad") {
                    return /*html*/ `
                    <li class="initialLoad">
                        <task-preview
                            role="button"
                            board="${this.state.board}"
                            title="${taskInstances.title}"
                            completedsubtasks=${completedSubtasks}
                            totalsubtasks=${totalSubtasks}
                            columnname="${this.state.columnName}"
                        ></task-preview>
                    </li>`;
                } else if (renderState === "rehydrate") {
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
                            board="${this.state.board}"
                            title="${taskInstances.title}"
                            completedsubtasks=${completedSubtasks}
                            totalsubtasks=${totalSubtasks}
                            columnname="${this.state.columnName}"
                        ></task-preview>
                    </li>`;
                }
            }).join('')}</ul>`;

            if (renderState === "initialLoad") {
                this.shadowRoot.innerHTML = markup;
            } else {
                setTimeout(() => {this.shadowRoot.innerHTML = markup;}, 400);
            }
        }
    }

    numberOfElementsHasGrown() {
        if ((this.state.numberoftasks + 1) === this.state.newNumberOfTasks) {
            return true;
        }
    }

    noTaskRender() {
        const markup = /*html*/
        `<h4 class="columnTitle"><span class="circle" data-color=${this.state.colorIndex}></span>${this.state.columnName.toUpperCase()} (${this.getAttribute('numberoftasks')})</h4>`;
        this.shadowRoot.innerHTML = markup;
    }
}

window.customElements.define('tasksboard-column', TasksboardColumn);