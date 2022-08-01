import tasksBoardStyleSheet from './tasksboard.css' assert {type: 'css'};
import TasksboardColumn from '../tasksboardcolumn/TasksboardColumn.js'; //NEW
import NewColumnButton from '../newcolumnbutton/NewColumnButton.js'; //NEW
import store from '../../lib/store/index.js';

export default class Tasksboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
        this.store.observer.subscribe('stateChange', () => {
            this.refresh();
        })
        this.render();
        
    }

    render() {
        this.initializeComponentState();
        this.CSS();
        this.HTML("initialLoad");
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ tasksBoardStyleSheet ];
    }

    HTML(animationStyle) {
        const markup = /*html*/
        `<div id="componentInnerContainer">
            <output id="mainRoute">
                ${this.getColumns(animationStyle)}
            </output>
            <button type="button" id="sideBarControl">
                <img src="../../src/assets/icons/eye.svg"/>
            </button>
        </div>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.FLIPsetup();
    }

    getColumns(animationStyle) {
        if (!this.state.currentBoard) return;
        let markup = ``;
        // There are currently 6 colors to choose from.
        // The colors are positioned like arrays: 0, 1, 2, 3, 4, 5
        let colorIndex = null;

        if (this.state.columns.length > 0) {
            this.state.columns.forEach((column) => {
                // Keeping the color choice in range
                if (colorIndex !== null && colorIndex < 5) {
                    colorIndex++;
                } else {
                    colorIndex = 0;
                }
                
                markup += /*html*/
                `<tasksboard-column
                    animationstyle="${animationStyle}"
                    colorindex=${colorIndex}
                    columnname="${column.name}"
                    board="${this.state.currentBoard}"
                ></tasksboard-column>`;
            });
    
            markup += /*html*/`<new-column-button board="${this.state.currentBoard}"></new-column-button>`;
        } else {
            markup += /*html*/`<new-column-button style="empty" board="${this.state.currentBoard}"></new-column-button>`;
        }
        

        return markup;
    }

    initializeComponentState() {
        this.oldState = null;

        this.state = (this.state?.columns ?? false)
            ? { columns: this.state.columns, currentBoard: this.getAttribute('currentboard'), totalTasks: 0 }
            : { columns: [], currentBoard: this.getAttribute('currentboard'), totalTasks: 0 }

        this.state.FLIPdetails = { elementIdentifier: null, element: null, elementsFirstPosition: null }

        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.state.currentBoard === this.store.state.boards[i].name) {
                this.store.state.boards[i].columns.forEach((column) => {
                    const columnInstance = {
                        name: column.name,
                        taskCount: column.tasks.length
                    }
                    
                    this.state.totalTasks += column.tasks.length;
                    this.state.columns.push(columnInstance);
                });
            }
        }

        this.updateOldState();
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    didComponentStateChange() {
        return JSON.stringify(this.oldState.columns) !== JSON.stringify(this.state.columns);
    }

    refresh() {
        this.state.columns = [];
        this.state.totalTasks = 0;

        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.state.currentBoard === this.store.state.boards[i].name) {
                this.store.state.boards[i].columns.forEach((column) => {
                    const columnInstance = {
                        name: column.name,
                        taskCount: column.tasks.length
                    }
                    this.state.totalTasks += column.tasks.length;
                    this.state.columns.push(columnInstance);
                });
            }
        }

        if (this.didComponentStateChange()) {
            console.log('@ Taskboard.js - component state changed');
            this.HTML("static");
            if (!this.didTasksGrowOrShrink()) {
                // If the number of tasks grew, that
                // means a task was either added or deleted
                // and not moved. Not sure how editing effects this.
                this.FLIPanimate();
            }
            this.updateOldState();
        }
    }

    FLIPsetup() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.composedPath()[0].tagName !== 'TASK-PREVIEW') return;

            event.preventDefault();
            this.state.FLIPdetails.elementIdentifier = event.composedPath()[0].title;
            this.state.FLIPdetails.element = event.composedPath()[0];
            this.state.FLIPdetails.elementsFirstPosition = this.state.FLIPdetails.element.getBoundingClientRect();
        });
    }

    didTasksGrowOrShrink() {
        return this.state.totalTasks !== this.oldState.totalTasks;
    }

    FLIPanimate() {
        if (!this.state.FLIPdetails.element) return;

        let lastPosition = null;
        Array.from(this.shadowRoot.querySelectorAll('tasksboard-column')).forEach((column) => {
            const tasksCollection = column.shadowRoot.querySelectorAll('task-preview');
            for (let i = 0; i < tasksCollection.length; i++) {
                if (tasksCollection[i].title === this.state.FLIPdetails.elementIdentifier) {
                    lastPosition = tasksCollection[i].getBoundingClientRect();
                }
            }
        });
        
        if (lastPosition === null) {
            return;
        }
        const deltaX = this.state.FLIPdetails.elementsFirstPosition.left - lastPosition.left;
        const deltaY = this.state.FLIPdetails.elementsFirstPosition.top - lastPosition.top;

        Array.from(this.shadowRoot.querySelectorAll('tasksboard-column')).forEach((column) => {
            const tasksCollection = column.shadowRoot.querySelectorAll('task-preview');
            for (let i = 0; i < tasksCollection.length; i++) {
                if (tasksCollection[i].title === this.state.FLIPdetails.elementIdentifier) {

                    tasksCollection[i].animate([
                        {
                            transform:`translate3d(${deltaX/16}rem, ${deltaY/16}rem, 0)`
                        }, {
                            transform: 'none'
                        }], {
                            duration: 350,
                            easing: 'ease-in-out',
                            fill: 'forwards'
                    });
                }
            }
        });
    }
}

if (!window.customElements.get('tasks-board')) {
    window.customElements.define('tasks-board', Tasksboard)
}