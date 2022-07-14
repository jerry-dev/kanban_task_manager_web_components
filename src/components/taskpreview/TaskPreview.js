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
            <small class="detail">${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')} subtasks</small>
        </span>
        <dialog class="expandedTaskDialog">
            <form class="expandedTaskDialogForm">
                <span class="expandedTaskDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTaskTitle">${this.getAttribute('title')}</h3>
                        <kebab-menu-button altering="Task"></kebab-menu-button>
                    </header>
                    <p class="dialogTaskDescription">${this.getAttribute('description')}</p>
                    <label for="taskCheckboxList" class="dialogCompletionStats detail">Subtasks (${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')})</label>
                    <ul class="taskCheckboxList" name="taskCheckboxList">
                        ${this.generateListElements(JSON.parse(this.getAttribute('subtasks').replace(/__/g, " ")))}
                    </ul>

                    <label class="currentStatusLabel" for="currentStatus">Current Status</label>
                    <select id="currentStatus" name="currentStatus">
                        ${this.generateOptionsElements()}
                    </select>
                </span>
            </form>
        </dialog>
        <dialog class="editTaskDialog">
            <form class="editTaskDialogForm">
                <span class="editTaskDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTaskTitle">Edit Task</h3>
                    </header>
                    <label class="editTaskLabelContainer detail">
                        Title
                        <input type="text" class="formInput" placeholder="e.g. Take coffee break"/>
                    </label>
                    <label class="editTaskLabelContainer detail">
                        Description
                        <textarea type="text" class="formInput descriptionTextarea" cols="30" rows="8" placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."></textarea>
                    </label>
                    <label class="editTaskLabelContainer detail">
                        Subtasks
                        <ul class="editTaskSubtaskList">
                            <li>
                                <input type="text" class="formInput" placeholder="e.g. Make coffee"/>
                                <button type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
                            </li>
                            <li>
                                <input type="text" class="formInput" placeholder="e.g. Drink coffee & smile"/>
                                <button type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
                            </li>
                        </ul>
                        <button type="button" class="newSubtaskButton">+ Add New Subtask</button>
                    </label>
                    <label class="editTaskLabelContainer detail">
                        Status
                        <select class="formInput" id="currentStatus" name="currentStatus">
                            ${this.generateOptionsElements()}
                        </select>
                    </label>
                    <button type="button" class="editTaskSaveChanges">Save Changes</button>
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
            if (this.dialogsAreNotShowing()) {
                this.dialogManager();
            }
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
        const taskCheckboxList = this.shadowRoot.querySelector('.taskCheckboxList');
        const subtasksArray = [];

        taskCheckboxList.querySelectorAll('li').forEach((item) => {
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
        const taskCheckboxList = this.shadowRoot.querySelector('.taskCheckboxList');

        taskCheckboxList.querySelectorAll('li').forEach((item) => {

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
        const expandedTaskDialog = this.shadowRoot.querySelector('.expandedTaskDialog');

        if (!expandedTaskDialog.open) {
            expandedTaskDialog.showModal();
            this.crossOutCompletedTask();
            this.addEventListener('click', (event) => {
                this.kebabMenuManager(event, expandedTaskDialog);
                this.submitEditTaskDialogForm(event)
                this.closeDialog(event, expandedTaskDialog);
            })
        }
    }

    kebabMenuManager(event, expandedTaskDialog) {
        if (!expandedTaskDialog.open) return;

        if (event.composedPath()[0].id === "kebabMenuButtonInnerContainer") {
            const kebabPopupMenu = this.getKebabPopupMenu();

            kebabPopupMenu.addEventListener('click', (event) => {
                event.preventDefault();

                if (event.composedPath()[0].className === "kebabEditMenuButton") {
                    this.closeExpandedTaskDialog();
                    this.launchTaskEditDialog(event);
                    kebabPopupMenu.close();
                }

                if (event.composedPath()[0].className === "kebabDeleteMenuButton") {
                    kebabPopupMenu.close();
                }
            })
        }
    }

    getKebabPopupMenu() {
        return this.shadowRoot.querySelector('kebab-menu-button').shadowRoot.querySelector('.popupMenu');
    }

    closeExpandedTaskDialog() {
        const expandedTaskDialog = this.shadowRoot.querySelector('.expandedTaskDialog');
        if (expandedTaskDialog.open) expandedTaskDialog.close();
    }

    isExpandedTaskDialogShowing() {
        return this.shadowRoot.querySelector('.expandedTaskDialog').open === true;
    }

    launchTaskEditDialog() {
        const editTaskDialog = this.getEditTaskDialogForm();

        if (!editTaskDialog.open) {
            editTaskDialog.showModal();

            editTaskDialog.addEventListener('click', (event) => {
                if (event.composedPath()[0].nodeName === "DIALOG") {
                    this.closeTaskEditDialog();
                }
            });
        }
    }

    closeTaskEditDialog() {
        const editTaskDialogForm = this.getEditTaskDialogForm();
        if (editTaskDialogForm.open) editTaskDialogForm.close();
    }

    submitEditTaskDialogForm(event) {
        if (!this.isTaskEditDialogShowing()) return;

        if (event.composedPath()[0].className === "editTaskSaveChanges") {
            // this.store.dispatch({});
            this.closeTaskEditDialog();
        }
    }

    getEditTaskDialogForm() {
        return this.shadowRoot.querySelector('.editTaskDialog');
    }

    isTaskEditDialogShowing() {
        return this.shadowRoot.querySelector('.editTaskDialog').open === true;
    }

    closeDialog(event, expandedTaskDialog) {
        if (!expandedTaskDialog.open) return;

        if (event.composedPath()[0].nodeName === "DIALOG") {
            expandedTaskDialog.close();
            this.dispatchFormDataIfChangesMade();
            this.currentStatusChanged();
        }
    }

    dialogsAreNotShowing() {
        if (!this.isExpandedTaskDialogShowing() && !this.isTaskEditDialogShowing()) {
            return true;
        }
    }
}

window.customElements.define('task-preview', TaskPreview);