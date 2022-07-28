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
        this.HTML();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ tasksBoardStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<div id="componentInnerContainer">
            <output id="mainRoute">
                ${this.getColumns()}
            </output>
            <button type="button" id="sideBarControl">
                <img src="../../src/assets/icons/eye.svg"/>
            </button>
        </div>`;

        this.shadowRoot.innerHTML = markup;
    }

    getColumns() {
        if (!this.getAttribute('currentboard')) return;
        let markup = ``;
        // There are currently 6 colors to choose from.
        // The colors are positioned like arrays: 0, 1, 2, 3, 4, 5
        let colorIndex = null;

        if (this.state.columns.length > 1) {
            this.state.columns.forEach((column) => {
                // Keeping the color choice in range
                if (colorIndex !== null && colorIndex < 5) {
                    colorIndex++;
                } else {
                    colorIndex = 0;
                }
                
                markup += /*html*/
                `<tasksboard-column
                    colorindex=${colorIndex}
                    columnname="${column}"
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
            ? { columns: this.state.columns, currentBoard: this.getAttribute('currentboard') }
            : { columns: [], currentBoard: this.getAttribute('currentboard') }

        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.state.currentBoard === this.store.state.boards[i].name) {
                this.store.state.boards[i].columns.forEach((column) => {
                    this.state.columns[this.state.columns.length] = column.name;
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
        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.state.currentBoard === this.store.state.boards[i].name) {
                this.store.state.boards[i].columns.forEach((column) => {
                    this.state.columns[this.state.columns.length] = column.name;
                });
            }            
        }

        if (this.didComponentStateChange()) {
            this.HTML();
            this.updateOldState();
        }
    }
}

if (!window.customElements.get('tasks-board')) {
    window.customElements.define('tasks-board', Tasksboard)
}