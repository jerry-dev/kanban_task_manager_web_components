import taskPreviewStyleSheet from './taskpreview.css' assert { type: 'css' };
import store from '../../lib/store/index.js';
import KebabMenuButton from '../kebabmenubutton/KebabMenuButton.js';

export default class TaskPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
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

    HTML() {
        /*WILL NEED TO REPLACE THE BELOW SELECT DROPDOWN WITH A CUSTOM ELEMENT*/
        /*THE NATIVE SELECT DROPDOWN DOES NOT ALL ONE TO STYLE THE OPTION ELEMENT OUTSIDE OF FONT STUFF*/
        const markup = /*html*/
        `<span class="taskInnerContainer">
            <h3 class="taskTitle">${this.getAttribute('title')}</h3>
            <small>${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')} subtasks</small>
        </span>
        <dialog>
            <form class="dialogForm">
                <span class="dialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTaskTitle">${this.getAttribute('title')}</h3>
                        <kebab-menu-button altering="Task"></kebab-menu-button>
                    </header>
                    <p class="dialogTaskDescription">${this.getAttribute('description')}</p>
                    <small class="dialogCompletionStats">Subtasks (${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')})</small>
                    <ul class="taskCheckboxList">
                        ${this.generateListElements(JSON.parse(this.getAttribute('subtasks').replace(/__/g, " ")))}
                    </ul>

                    <label class="currentStatusLabel" for="currentStatus">Current Status</label>
                    <select id="currentStatus" name="currentStatus">
                        ${this.generateOptionsElements()}
                    </select>
                </span>
            </form>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
        this.state = {

            currentStatus: this.shadowRoot.getElementById('currentStatus').value
        }
    }

    SCRIPTS() {
        this.clickManager();
        this.shadowRoot.querySelector('form').addEventListener('change', () => {
            this.crossOutCompletedTask();
        });
    }

    clickManager() {
        this.addEventListener('click', () => {
            this.dialogManager();
        });
    }

    currentStatusChanged() {
        if (this.state.currentStatus !== this.shadowRoot.getElementById('currentStatus').value) {
            this.setAttribute('changed', '');
            this.updateDefaultStateValues();
        }
    }

    updateDefaultStateValues() {
        this.state.currentStatus = this.shadowRoot.getElementById('currentStatus').value
    }

    dispatchFormDataIfChangesMade() {
        const subtasksArray = [];

        this.shadowRoot.querySelectorAll('li').forEach((item) => {
            this.crossOutCompletedTask();

            subtasksArray[subtasksArray.length] = {
                isCompleted: item.getElementsByTagName('input')[0].checked,
                title: item.getElementsByTagName('label')[0].innerText
            }
        });

        const action = {
            type: 'UPDATE_TASK',
            payload: {
                boardName: this.getAttribute('board'),
                columnName: this.getAttribute('columnname'),
                taskTitle: this.getAttribute('title'),
                newStatus: this.shadowRoot.getElementById('currentStatus').value,
                subtasks: subtasksArray
            }
        }

        this.store.dispatch(action);
    }

    crossOutCompletedTask() {
        this.shadowRoot.querySelectorAll('li').forEach((item) => {

            if (item.getElementsByTagName('input')[0].checked) {
                item.getElementsByTagName('label')[0].classList.add('crossOut');
            } else {
                item.getElementsByTagName('label')[0].classList.remove('crossOut');
            }
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

    getCurrentBoardColumnNames() {
        let theColumns = [];
        let currentBoard = this.getAttribute('board').split("");
        currentBoard[0] = currentBoard[0].toUpperCase();

        currentBoard.forEach((item, index) => {
            if (item === "-") {
                currentBoard[index + 1] = currentBoard[index + 1].toUpperCase();
            }
        });

        currentBoard = currentBoard.join("").replace(/-/g, " ");

        let numberOfBoards = this.store.state.boards.length;

        for (let i = 0; i < numberOfBoards; i++) {
            if (this.store.state.boards[i].name === currentBoard) {
                this.store.state.boards[i].columns.forEach((column) => {
                    theColumns[theColumns.length] = column.name;
                });
            }
        }

        return theColumns;
    }

    generateOptionsElements() {
        let markup = ``;
        const theColumns = this.getCurrentBoardColumnNames();

        theColumns.forEach((item) => {
            const selected = (item === this.getAttribute('columnname')) ? 'selected' : '';

            markup += /*html*/ `<option class="statusOption" value="${item}" ${selected}>${item}</option>`;
        });

        return markup;
    }

    dialogManager() {
        const theDialog = this.shadowRoot.querySelector('dialog');

        if (!theDialog.open) {
            theDialog.showModal();
            this.crossOutCompletedTask();
            this.addEventListener('click', (event) => {
                this.kebabMenuManager(event, theDialog);
                this.closeDialog(event, theDialog);                
            })
        }
    }

    kebabMenuManager(event, theDialog) {
        if (!theDialog.open) return;

        if (event.composedPath()[0].id === "kebabMenuButtonInnerContainer") {
            const popupMenu = this.shadowRoot.querySelector('kebab-menu-button').shadowRoot.querySelector('dialog');

            popupMenu.addEventListener('click', (event) => {
                event.preventDefault();

                if (event.composedPath()[0].className === "kebabEditMenuButton") {
                    console.log('kebabEditMenuButton');
                    popupMenu.close();
                }

                if (event.composedPath()[0].className === "kebabDeleteMenuButton") {
                    console.log('kebabDeleteMenuButton');
                    popupMenu.close();
                }
            })
        }
    }

    closeDialog(event, theDialog) {
        if (!theDialog.open) return;

        if (event.composedPath()[0].nodeName === "DIALOG") {
            theDialog.close();
            this.dispatchFormDataIfChangesMade();
            this.currentStatusChanged();
        }
    }
}

window.customElements.define('task-preview', TaskPreview);