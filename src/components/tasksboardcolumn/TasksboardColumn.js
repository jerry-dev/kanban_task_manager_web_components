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
        this.initializeComponentState();
        this.store.observer.subscribe(this, 'stateChange', () => {
            this.refresh();
        });
        this.render();
    }

    render() {
        this.CSS();
        this.HTML();
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = {
            board: this.getAttribute('board'),
            columnName: this.getAttribute('columnname'),
            colorIndex: this.getAttribute('colorindex'),
            animationDetails: {
                style: this.getAttribute('animationstyle')
            },
        }

        this.state.numberOfTasks = this.getNumberOfTasks();
        this.state.columnData = this.getColumnData();

        this.updateOldState();
    }

    refresh() {
        this.state = {
            board: this.getAttribute('board'),
            columnName: this.getAttribute('columnname'),
            colorIndex: this.getAttribute('colorindex'),
            animationDetails: {
                style: this.getAttribute('animationstyle')
            },
        }

        this.state.numberOfTasks = this.getNumberOfTasks();
        this.state.columnData = this.getColumnData();

        if (this.didComponentStateChanged()) {
            this.refreshUI();
            this.updateOldState();
        }
    }

    refreshUI() {
        this.shadowRoot.textContent = '';
        this.HTML("static");
    }

    getColumnData() {
        let result = null;
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
                        result = this.store.state.boards[i].columns[j];
                    }
                }
            }
        }

        return result;
    }

    getNumberOfTasks() {
        let result = 0;
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
                        result = this.store.state.boards[i].columns[j].tasks.length;
                    }
                }
            }
        }

        return result;
    }

    getName() {
        return `${this.state.board} - Column ${this.state.columnName}`;
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    columnHasGrownNEW() {
        return (this.state.columnData.tasks.length + 1) === this.oldState.columnData.tasks.length;
    }

    didComponentStateChanged() {
        const oldState = `${JSON.stringify(this.oldState.numberOfTasks)}${JSON.stringify(this.oldState.columnData)}`;
		const currentState = `${JSON.stringify(this.state.numberOfTasks)}${JSON.stringify(this.state.columnData)}`;
        return oldState !== currentState;
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ tasksboardColumnStyleSheet ];
    }

    HTML() {
        let markup = /*html*/
            `<h4 class="columnTitle"><span class="circle" data-color=${this.state.colorIndex}></span>${this.state.columnName.toUpperCase()} (${this.state.numberOfTasks})</h4>`;
        markup += /*html*/ `<ul>${this.renderListOfPreviews()}</ul>`;

        this.shadowRoot.innerHTML = markup;
    }

    renderListOfPreviews() {
        if (!this.state.columnData) return '';
        if (!this.state.columnData.tasks) return '';

        let markup = ``;

        if (this.state.columnData.tasks) {
            this.state.columnData.tasks.forEach((taskInstances, index) => {
                const totalSubtasks = taskInstances.subtasks.length;
                let completedSubtasks = 0;
    
                taskInstances.subtasks.forEach((item) => {
                    if (item.isCompleted) {
                        completedSubtasks++;
                    }
                });

                markup +=/*html*/`<li class="${this.state.animationDetails.style}">
                    <task-preview
                        role="button"
                        board="${this.state.board}"
                        title="${taskInstances.title}"
                        completedsubtasks=${completedSubtasks}
                        totalsubtasks=${totalSubtasks}
                        columnname="${this.state.columnName}"
                    ></task-preview>
                </li> `;
            })
        }

        return markup;
    };
}

window.customElements.define('tasksboard-column', TasksboardColumn);