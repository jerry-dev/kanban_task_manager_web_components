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
        this.initializeComponentState();
        this.CSS();
        this.HTML();
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = { animationDetails: { style: this.getAttribute('animationstyle') }, columnData: [] }
        
        this.state.board = this.getAttribute('board');
        this.state.columnName = this.getAttribute('columnname');
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
                        this.state.numberOfTasks = this.store.state.boards[i].columns[j].tasks.length;
                        this.state.columnData = this.store.state.boards[i].columns[j];
                    }
                }
            }
        }

        this.updateOldState();
    }

    refresh() {
        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.store.state.boards[i].name === this.state.board) {
                for (let j = 0; j < this.store.state.boards[i].columns.length; j++) {
                    if (this.store.state.boards[i].columns[j].name === this.state.columnName) {
                        this.state.numberOfTasks = this.store.state.boards[i].columns[j].tasks.length;
                        this.state.columnData = this.store.state.boards[i].columns[j];
                    }
                }
            }
        }

        this.HTML("static");
        this.updateOldState();
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    columnHasGrownNEW() {
        return (this.state.columnData.tasks.length + 1) === this.oldState.columnData.tasks.length;
    }

    didComponentStateChanged() {
        return JSON.stringify(this.oldState) !== JSON.stringify(this.state);
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