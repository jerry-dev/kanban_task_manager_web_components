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
        this.state = {};
        this.render();
    }

    render() {
        this.initializeComponentState();
        this.CSS();
        this.HTML();
        this.SCRIPTS();
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
        this.state.column = this.getAttribute('columnname');
        this.state.title = this.getAttribute('title');
        this.state.description = '';
        this.state.subtasks = [];

        // Searching for the component's associated data based on the title and column name
        // Once found, hydrate the this.state.description and this.state.subtasks
        // First loop: Iterating through the boards array
        for (let i = 0; i < this.store.state.boards.length; i++) {
            // Checking if the loop is at the board the component is in using the boards name
            if (this.store.state.boards[i].name === this.state.board) {
                // Second loop: While in the matched board, iterating over the array columns
                for (let j = 0; j < this.store.state.boards[i].columns.length; j++) {
                    // Checking if the second loop is at the column the component is in using the column name
                    if (this.store.state.boards[i].columns[j].name === this.state.column) {
                        // Third loop: While in the matched column of the matched board, iterating over the array tasks
                        for (let y = 0; y < this.store.state.boards[i].columns[j].tasks.length; y++) {
                            if (this.store.state.boards[i].columns[j].tasks[y].title === this.state.title) {
                                this.state.description = this.store.state.boards[i].columns[j].tasks[y].description;
                                this.state.subtasks = this.store.state.boards[i].columns[j].tasks[y].subtasks;
                            }
                        }
                    }
                }
            }
        }
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ taskPreviewStyleSheet ];
    }

    HTML() {
        /*WILL NEED TO REPLACE THE BELOW SELECT DROPDOWN WITH A CUSTOM ELEMENT*/
        /*THE NATIVE SELECT DROPDOWN DOES NOT ALLOW ONE TO STYLE THE OPTION ELEMENT OUTSIDE OF FONT STUFF*/
        const markup = /*html*/
        `<span class="taskInnerContainer">
            <h3 class="taskTitle">${this.state.title}</h3>
            <small class="detail">${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')} subtasks</small>
        </span>
        <dialog class="expandedTaskDialog">
            <form class="expandedTaskDialogForm">
                <span class="expandedTaskDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTaskTitle">${this.state.title}</h3>
                        <kebab-menu-button altering="Task"></kebab-menu-button>
                    </header>
                    <p class="dialogTaskDescription">${this.state.description}</p>
                    <label for="taskCheckboxList" class="dialogCompletionStats detail">Subtasks (${this.getAttribute('completedsubtasks')} of ${this.getAttribute('totalsubtasks')})</label>
                    <ul class="taskCheckboxList" name="taskCheckboxList">
                        ${this.generateListElements(this.state.subtasks)}
                    </ul>

                    <label class="currentStatusLabel" for="currentStatus">Current Status</label>
                    <select id="currentStatus" name="currentStatus">
                        ${this.generateOptionsElements()}
                    </select>
                </span>
            </form>
        </dialog>
        <dialog class="editTaskDialog">
            <form class="editTaskDialogForm" novalidate>
                <span class="editTaskDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTaskTitle">Edit Task</h3>
                    </header>
                    <label class="editTaskLabelContainer detail">
                        Title
                        <input type="text" class="formInput" placeholder="e.g. Take coffee break" value=${JSON.stringify(this.state.title)} required/>
                    </label>
                    <label class="editTaskLabelContainer detail">
                        Description
                        <textarea type="text" class="formInput descriptionTextarea" cols="30" rows="8" placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little.">${this.state.description}</textarea>
                    </label>
                    <label class="editTaskLabelContainer detail">
                        Subtasks
                        <ul class="editTaskSubtaskList"></ul>
                    </label>
                    <button type="button" class="newSubtaskButton">+ Add New Subtask</button>
                    <label class="editTaskLabelContainer detail">
                        Status
                        <select class="formInput" id="currentStatus" name="currentStatus">
                            ${this.generateOptionsElements()}
                        </select>
                    </label>
                    <button type="submit" class="editTaskSaveChanges">Save Changes</button>
                </span>
            </form>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
        this.state.currentStatus = this.shadowRoot.getElementById('currentStatus').value
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
                title: item.getElementsByTagName('label')[0].getElementsByTagName('span')[0].innerText
            }
        });

        const action = {
            type: 'UPDATE_TASK',
            payload: {
                boardName: this.state.board,
                columnName: this.state.column,
                taskTitle: this.state.title,
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

        // IF ANY CHANGES ARE MADE TO THIS input MARKUP, HAVE addNewSubtask'S input MARKUP MATCH THE CHANGE
        subtasks.forEach((task) => {
            subtasksListElementsMarkup += /*html*/
            `<li>
                <label>
                    <input type="checkbox" ${(task.isCompleted ? "checked" : "")} data-title="${task.title}"/> <span>${task.title}</span>
                </label>
            </li>`;
        });

        return subtasksListElementsMarkup;
    }

    generateEditTaskSubtaskList() {
        let subtasksListElementsMarkup = ``;
        
        this.state.subtasks.forEach((task) => {
            subtasksListElementsMarkup += /*html*/
            `<li>
                <input type="text" class="formInput" data-iscompleted=${task.isCompleted} placeholder="e.g. Make coffee" value="${task.title}" required data-title="${task.title}"/>
                <button class="deleteSubtask" type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;
        });

        this.shadowRoot.querySelector('.editTaskSubtaskList').innerHTML = subtasksListElementsMarkup
    }

    getCurrentBoardColumnNames() {
        let theColumns = [];

        let numberOfBoards = this.store.state.boards.length;

        for (let i = 0; i < numberOfBoards; i++) {
            if (this.store.state.boards[i].name === this.state.board) {
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
            const selected = (item === this.state.column) ? 'selected' : '';

            markup += /*html*/ `<option class="statusOption" value="${item}" ${selected}>${item}</option>`;
        });

        return markup;
    }

    dialogManager() {
        const expandedTaskDialog = this.shadowRoot.querySelector('.expandedTaskDialog');

        if (!expandedTaskDialog.open) {
            expandedTaskDialog.showModal();
            this.checkBoxManager();

            this.crossOutCompletedTask();
            this.addEventListener('click', (event) => {
                this.kebabMenuManager(event, expandedTaskDialog);
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

    checkBoxManager() {
        const taskCheckboxList = this.shadowRoot.querySelector('.expandedTaskDialog').querySelector('.taskCheckboxList');

        taskCheckboxList.querySelectorAll('li').forEach((item) => {

            const theInput = item.querySelector('input');

            theInput.addEventListener('click', () => {
                if (theInput.checked) {
                    theInput.setAttribute('checked', "");
                } else {
                    theInput.removeAttribute('checked');
                }

                this.updateLocalSubTaskIsComplete(theInput);
            });
        })
    }

    updateLocalSubTaskIsComplete(inputElement) {
        this.state.subtasks.forEach((item) => {
            if (item.title === inputElement.dataset.title) {
                item.isCompleted = inputElement.checked
            }
        })
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
            this.generateEditTaskSubtaskList()

            this.submitEditTaskDialogFormManager();

            editTaskDialog.addEventListener('click', (event) => {
                if (event.composedPath()[0].nodeName === "DIALOG") {
                    this.closeTaskEditDialog();
                }

                if (event.target.className === "newSubtaskButton") {
                    this.addNewSubtask();
                }

                if (event.target.className === "deleteSubtask") {
                    return event.target.parentNode.remove();
                }
            });
        }
    }

    dynamicInputValidation(elementInput, defaultMessage) {
        elementInput.addEventListener('input', () => {
            if (elementInput.validity.valid) {
                elementInput.className = "formInput";
                elementInput.placeholder = defaultMessage;
            } else {
                this.showErrorMessage(elementInput);
            }
        })
    }

    addNewSubtask() {
        const editTaskDialogFormElement = this.getEditTaskDialogForm().querySelector('form');

        let markup = '';

        const subtaskListElements = editTaskDialogFormElement.querySelectorAll('label')[2].querySelector('ul').querySelectorAll('li');

        subtaskListElements.forEach((item) => {
            const currenttitle = item.querySelector('input').dataset.title;
            const currentValue = item.querySelector('input').value;
            const isCompleted = item.querySelector('input').getAttribute('data-iscompleted');

            // MAKE SURE THE MARKUP MATCHES THE MARKUP GENERATED BY generateListElements
            markup += /*html*/
            `<li>
                <input type="text" class="formInput" data-iscompleted="${isCompleted}" placeholder="e.g. Make coffee" value="${currentValue}" required data-title="${currenttitle}"/>
                <button class="deleteSubtask" type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;
        });

        // MAKE SURE THE MARKUP MATCHES THE MARKUP GENERATED BY generateListElements
        markup += /*html*/
            `<li>
                <input type="text" class="formInput" data-iscompleted="false" placeholder="e.g. Make coffee" value="" required data-title=""/>
                <button class="deleteSubtask" type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;

        editTaskDialogFormElement.querySelector('.editTaskSubtaskList').innerHTML = markup;
    }

    closeTaskEditDialog() {
        const editTaskDialogForm = this.getEditTaskDialogForm();
        if (editTaskDialogForm.open) editTaskDialogForm.close();
    }

    submitEditTaskDialogFormManager() {
        if (!this.isTaskEditDialogShowing()) return;

        let isWatchingTitleInput = false;

        // SUBTASK OBJECT: For each subtask input within the edit form dialog, I will create a key for it.
        // Each subtask input's key name will be its index position within a querySelectorAll on the list.
        // The default value will be false for each.
        let isWatchingSubtaskInputs = {};

        const getEditTaskDialogFormElement = this.getEditTaskDialogForm().querySelector('form');

        // SUBTASK OBJECT: The specified operation a few lines above
        getEditTaskDialogFormElement.querySelectorAll('label')[2].querySelector('ul').querySelectorAll('li').forEach((item, index) => {
            isWatchingSubtaskInputs[index] = false;
        });

        getEditTaskDialogFormElement.addEventListener('submit', (event) => {
            event.preventDefault();

            const titleInput = getEditTaskDialogFormElement.querySelectorAll('label')[0].querySelector('input');
            const descriptionTextarea = getEditTaskDialogFormElement.querySelectorAll('label')[1].querySelector('textarea');
            const subtaskListElements = getEditTaskDialogFormElement.querySelectorAll('label')[2].querySelector('ul').querySelectorAll('li');
            const columnSelect = getEditTaskDialogFormElement.querySelectorAll('label')[3].querySelector('select');

            let formIsValid = false;

            if (titleInput.validity.valid) {
                // checking the list elements if the title input is valid
                let allListElementsAreValid = null;

                // Iterating through the list elements to individually check them
                // This loops job is to mark if any of the elements aren't valid (allElementsAreValid)
                // If That individual element is invalid, we place the dynamic input validation on it.
                subtaskListElements.forEach((listItem, index) => {
                    if (!listItem.querySelector('input').validity.valid) {
                        this.showErrorMessage(listItem.querySelector('input'));

                        if (!isWatchingSubtaskInputs[index]) {
                            this.dynamicInputValidation(listItem.querySelector('input'), "e.g. Make coffee");
                            isWatchingSubtaskInputs[index] = true;
                        }

                        if (allListElementsAreValid === null) {
                            allListElementsAreValid = false;
                        }
                    }
                });

                if (allListElementsAreValid === null) {
                    allListElementsAreValid = true;
                    formIsValid = true;
                }
            } else {
                // This else block is if the title is invalid.
                // If so, we skip checking the subtask list elements,
                // and just indicate that the form is invalid.
                formIsValid = false;
                this.showErrorMessage(titleInput);
                if (!isWatchingTitleInput) {
                    this.dynamicInputValidation(titleInput, "e.g. Take coffee break");
                    isWatchingTitleInput = true;
                }
            }

            if (formIsValid) {
                const action = {
                    type: 'EDIT_TASK',
                    payload: {
                        identifier: {
                            board: this.state.board,
                            column: this.state.column,
                            title: this.state.title,
                            columnChanged: this.state.column !== columnSelect.value
                        },
                        newState: {
                            newTitle: titleInput.value,
                            newDescription: descriptionTextarea.value,
                            newColumn: columnSelect.value,
                            newSubtasks: this.getEditTaskDialogFormSubtasks(getEditTaskDialogFormElement)
                        }
                    }
                };

                this.store.dispatch(action);
                this.closeTaskEditDialog();
            }
        });
    }

    showErrorMessage(element) {
        if (element.validity.valueMissing) {
            element.placeholder = "Can't be empty";
        }

        element.className = "formInput errorFormInput";
    }

    getEditTaskDialogFormSubtasks(editTaskDialogForm) {
        const subtasks = [];

        const subtasksListElement = editTaskDialogForm.querySelectorAll('label')[2].querySelector('ul');
        subtasksListElement.querySelectorAll('li').forEach((item) => {
            const completedStatus = (item.querySelector('input').dataset.iscompleted === 'true') ? true : false;
            subtasks[subtasks.length] = {title: item.querySelector('input').value, isCompleted: completedStatus}
        });

        return subtasks;
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