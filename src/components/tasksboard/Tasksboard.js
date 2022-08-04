import tasksBoardStyleSheet from './tasksboard.css' assert {type: 'css'};
import TasksboardColumn from '../tasksboardcolumn/TasksboardColumn.js';
import NewColumnButton from '../newcolumnbutton/NewColumnButton.js';
import store from '../../lib/store/index.js';

export default class Tasksboard extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
        this.initializeComponentState();
        this.store.observer.subscribe(this, 'stateChange', () => {
            this.refresh();
        })
        this.render();
    }

    render() {
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
        this.state = {
            currentBoard: this.getAttribute('currentboard'),
            FLIPdetails: { elementIdentifier: null, element: null, elementsFirstPosition: null }
        }

        this.state.columns = this.getColumnsData();
        this.state.numberOfColumns = this.state.columns.length;
        this.state.totalTasks = this.getNumberOfTasks();

        this.updateOldState();
    }

    getColumnsData() {
        const results = [];
        
        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.state.currentBoard.toLowerCase() === this.store.state.boards[i].name.toLowerCase()) {
                this.store.state.boards[i].columns.forEach((column) => {
                    const columnInstance = {
                        name: column.name,
                        taskCount: column.tasks.length
                    }

                    results[results.length] = columnInstance;
                    
                });
            }
        }

        return results;
    }

    getNumberOfTasks() {
        let results = 0;
        
        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.state.currentBoard === this.store.state.boards[i].name) {
                this.store.state.boards[i].columns.forEach((column) => {
                    results += column.tasks.length;
                });
            }
        }
        
        return results;
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    didComponentStateChange() {
        const oldState = `${JSON.stringify(this.oldState.columns)}${JSON.stringify(this.oldState.numberOfColumns)}${JSON.stringify(this.oldState.totalTasks)}`;
		const currentState = `${JSON.stringify(this.state.columns)}${JSON.stringify(this.state.numberOfColumns)}${JSON.stringify(this.state.totalTasks)}`;
        return oldState !== currentState;
    }

    refresh() {
        this.state.currentBoard = this.getAttribute('currentboard')
        this.state.columns = this.getColumnsData();
        this.state.numberOfColumns = this.state.columns.length;
        this.state.totalTasks = this.getNumberOfTasks();

        if (this.didComponentStateChange()) {
            //Triggered if task has changed columns/status
            // Will handle the view updating if a subtask has changed along with the column/status change
            this.HTML("static");
            if (!this.didTasksGrowOrShrink()) {
                // If the number of tasks grew or shrank, that
                // means a task was either added or deleted
                // and not just moved.
                // this.HTML("static");
                this.FLIPanimate();
            }
            this.updateOldState();
        } else {
            //Triggered if ONLY the taskpreview has been changed (like changing it's subtask input)
            this.HTML("static");
        }
    }

    getName() {
        return `Tasksboard - ${this.state.currentBoard}`;
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

        console.log({deltaX, deltaY})

        Array.from(this.shadowRoot.querySelectorAll('tasksboard-column')).forEach((column) => {
            const tasksCollection = column.shadowRoot.querySelectorAll('task-preview');
            for (let i = 0; i < tasksCollection.length; i++) {
                if (tasksCollection[i].title === this.state.FLIPdetails.elementIdentifier) {

                    tasksCollection[i].animate([
                        {
                            transform:`translate3d(${deltaX/16}rem, ${deltaY/16}rem, 0) scale(1)`
                        },
                        {
                            transform: 'none'
                        }], {
                            duration: 450,
                            easing: 'ease-in-out',
                            fill: 'forwards'
                    });
                }
            }
        });
    }

    subscribeToTheStore() {
        this.store.observer.subscribe(this, 'stateChange', () => {
            this.refresh();
        })
    }
}

if (!window.customElements.get('tasks-board')) {
    window.customElements.define('tasks-board', Tasksboard)
}