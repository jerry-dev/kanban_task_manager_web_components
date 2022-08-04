import AddNewTaskButtonStyleSheet from './addnewtaskbutton.css' assert { type: 'css' };
import store from '../../lib/store/index.js';

export default class AddNewTaskButton extends HTMLElement {
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
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ AddNewTaskButtonStyleSheet ];
    }

    HTML() {
        let markup = /*html*/`<div id="innerContainer">+ Add New Task</div>`;

        markup += /*html*/
        `<dialog class="addNewTaskDialog">
            <form class="addNewTaskDialogForm" novalidate>
                <span class="addNewTaskDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTaskTitle">Add New Task</h3>
                    </header>
                    <label class="addNewTaskLabelContainer detail">
                        Title
                        <input type="text" class="formInput" placeholder="e.g. Take coffee break" value="" required/>
                    </label>
                    <label class="addNewTaskLabelContainer detail">
                        Description
                        <textarea type="text" class="formInput descriptionTextarea" cols="30" rows="8" placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."></textarea>
                    </label>
                    <label class="addNewTaskLabelContainer detail">
                        Subtasks
                        <ul class="addNewTaskSubtaskList">
                            <li>
                                <input type="text" class="formInput" data-iscompleted="false" placeholder="e.g. Make coffee" value="" required data-title=""/>
                                <button class="deleteSubtask" type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
                            </li>
                            <li>
                                <input type="text" class="formInput" data-iscompleted="false" placeholder="e.g. Drink coffee & smile" value="" required data-title=""/>
                                <button class="deleteSubtask" type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
                            </li>
                        </ul>
                    </label>
                    <button type="button" class="newSubtaskButton">+ Add New Subtask</button>
                    <label class="addNewTaskLabelContainer detail">
                        Status
                        <select class="formInput" id="currentStatus" name="currentStatus">
                            ${this.generateOptionsElements()}
                        </select>
                    </label>
                    <button type="submit" class="createNewTask">Create Task</button>
                </span>
            </form>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.addEventListener('click', (event) => {
            if (!this.isAddNewTaskDialogShowing()) {
                if (event.composedPath()[0].nodeName === "ADD-NEW-TASK-BUTTON") {
                    this.launchAddNewTaskDialog();
                }
            }
        });
        this.clickManagers();
        this.submitAddNewTaskDialogFormManager();
    }

    getName() {
        return `AddNewTaskButton`;
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    clickManagers() {
        this.addNewSubtaskClickListener();
        this.deleteSubtaskClickListener();
        this.addNewTaskDialogOverlayClickListener();
    }

    addNewTaskDialogOverlayClickListener() {
        const addNewTaskDialog = this.getAddNewTaskDialog();

        addNewTaskDialog.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName === "DIALOG") {
                this.closeAddNewTaskkDialog();
            }
        });
    }

    getAddNewTaskDialog() {
        return this.shadowRoot.querySelector('.addNewTaskDialog');
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = {
            currentBoard: this.getAttribute('currentboard')
        };

        this.state.columns = this.getCurrentBoardColumnNames();

        this.updateOldState();
    }

    refresh() {
        this.state = {
            currentBoard: this.getAttribute('currentboard')
        };

        this.state.columns = this.getCurrentBoardColumnNames();

        if (this.didComponentStateChanged()) {
            this.refreshUI();
            this.updateOldState();
        }
    }

    didComponentStateChanged() {
        const oldState = `${JSON.stringify(this.oldState.currentBoard)}${JSON.stringify(this.oldState.columns)}`;
		const currentState = `${JSON.stringify(this.state.currentBoard)}${JSON.stringify(this.state.columns)}`;
        return oldState !== currentState;
    }

    refreshUI() {
        this.shadowRoot.innerText = '';
        this.HTML();
    }

    isAddNewTaskDialogShowing() {
        return this.getAddNewTaskDialog().open === true;
    }

    closeAddNewTaskkDialog() {
        const addNewTaskDialog = this.getAddNewTaskDialog();
        if (addNewTaskDialog.open) addNewTaskDialog.close();
        this.clearForm();
    }

    launchAddNewTaskDialog() {
        this.refresh();
        this.getAddNewTaskDialog().showModal();
    }

    addNewSubtaskClickListener() {
        const addNewTaskDialog = this.getAddNewTaskDialog();
        const newSubtaskButton = addNewTaskDialog.querySelector('.newSubtaskButton');

        newSubtaskButton.addEventListener('click', () => {
            this.addNewSubtask();
        });
    }

    addNewSubtask() {
        const subtaskPlaceHolders = [
            'e.g. Make coffee',
            'e.g. Drink coffee & smile',
            'e.g. Walk dog',
            'e.g. Have existential crisis',
            'e.g. Stare at email',
            'e.g. Get lunch',
            'e.g. Go to sleep'
        ];

        let placeholderIndex = 0;

        const addNewTaskDialogFormElement = this.getAddNewTaskDialog().querySelector('form');

        let markup = '';

        const subtaskListElements = addNewTaskDialogFormElement.querySelector('.addNewTaskSubtaskList').querySelectorAll('li');

        subtaskListElements.forEach((item) => {
            if (placeholderIndex === subtaskPlaceHolders.length) {
                placeholderIndex = 0;
            }

            const thePlaceholderText = subtaskPlaceHolders[placeholderIndex];

            const currenttitle = item.querySelector('input').dataset.title;
            const currentValue = item.querySelector('input').value;
            const isCompleted = item.querySelector('input').getAttribute('data-iscompleted');

            // MAKE SURE THE MARKUP MATCHES THE MARKUP GENERATED BY generateListElements
            markup += /*html*/
            `<li>
                <input type="text" class="formInput" data-iscompleted="${isCompleted}" placeholder="${thePlaceholderText}" value="${currentValue}" required data-title="${currenttitle}"/>
                <button class="deleteSubtask" type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;

            placeholderIndex++;
        });

        if (placeholderIndex === subtaskPlaceHolders.length) {
            placeholderIndex = 0;
        }

        const thePlaceholderText = subtaskPlaceHolders[placeholderIndex];

        // MAKE SURE THE MARKUP MATCHES THE MARKUP GENERATED BY generateListElements
        markup += /*html*/
            `<li>
                <input type="text" class="formInput" data-iscompleted="false" placeholder="${thePlaceholderText}" value="" required data-title=""/>
                <button class="deleteSubtask" type="button"><img alt="Delete subtask symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;

        addNewTaskDialogFormElement.querySelector('.addNewTaskSubtaskList').innerHTML = markup;
    }

    clearForm() {
        this.getAddNewTaskDialog().querySelectorAll('.formInput')[0].value = '';
        this.getAddNewTaskDialog().querySelector('textarea').value = '';
        const subtaskListElements = Array.from(this.getAddNewTaskDialog().querySelector('.addNewTaskSubtaskList').querySelectorAll('li'));

        subtaskListElements.forEach((item) => {
            item.querySelector('input').dataset.title = '';
            item.querySelector('input').value = '';
        })
    }

    deleteSubtaskClickListener() {
        const addNewTaskDialog = this.getAddNewTaskDialog();
        const addNewTaskSubtaskList = addNewTaskDialog.querySelector('.addNewTaskSubtaskList');
        
        addNewTaskSubtaskList.addEventListener('click', (event) => {
            if (event.target.className === "deleteSubtask") {
                event.target.parentNode.remove();
            }
        });
    }

    generateOptionsElements() {
        let markup = ``;

        this.state.columns.forEach((item) => {
            markup += /*html*/ `<option class="statusOption" value="${item}">${item}</option>`;
        });

        return markup;
    }

    getCurrentBoardColumnNames() {
        let theColumns = [];

        let numberOfBoards = this.store.state.boards.length;

        for (let i = 0; i < numberOfBoards; i++) {
            if (this.store.state.boards[i].name === this.state.currentBoard) {
                this.store.state.boards[i].columns.forEach((column) => {
                    theColumns[theColumns.length] = column.name;
                });
            }
        }

        return theColumns;
    }

    showErrorMessage(element) {
        if (element.validity.valueMissing) {
            element.placeholder = "Can't be empty";
        }

        element.className = "formInput errorFormInput";
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

    getAddNewTaskDialogFormSubtasks() {
        const subtasks = [];

        const subtasksListElement = this.getAddNewTaskDialog().querySelector('.addNewTaskSubtaskList');
        subtasksListElement.querySelectorAll('li').forEach((item) => {
            subtasks[subtasks.length] = {title: item.querySelector('input').value, isCompleted: false}
        });

        return subtasks;
    }

    submitAddNewTaskDialogFormManager() {
        let isWatchingTitleInput = false;

        // SUBTASK OBJECT: For each subtask input within the edit form dialog, I will create a key for it.
        // Each subtask input's key name will be its index position within a querySelectorAll on the list.
        // The default value will be false for each.
        let isWatchingSubtaskInputs = {};

        const addNewTaskDialogFormElement = this.getAddNewTaskDialog().querySelector('form');

        // const getEditTaskDialogFormElement = this.getEditTaskDialogForm().querySelector('form');

        // SUBTASK OBJECT: The specified operation a few lines above
        addNewTaskDialogFormElement.querySelector('.addNewTaskSubtaskList').querySelectorAll('li').forEach((item, index) => {
            isWatchingSubtaskInputs[index] = false;
        });

        addNewTaskDialogFormElement.addEventListener('submit', (event) => {
            event.preventDefault();

            const titleInput = addNewTaskDialogFormElement.querySelectorAll('label')[0].querySelector('input');
            const descriptionTextarea = addNewTaskDialogFormElement.querySelectorAll('label')[1].querySelector('textarea');
            const subtaskListElements = addNewTaskDialogFormElement.querySelector('.addNewTaskSubtaskList').querySelectorAll('li');
            const columnSelect = addNewTaskDialogFormElement.querySelectorAll('label')[3].querySelector('select');

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
                    type: 'ADD_NEW_TASK',
                    payload: {
                        board: this.state.currentBoard,
                        column: columnSelect.value,
                        title: titleInput.value,
                        description: descriptionTextarea.value,
                        subtasks: this.getAddNewTaskDialogFormSubtasks()
                    }
                };
                
                this.store.dispatch(action);
                this.closeAddNewTaskkDialog();
            }
        });
    }
}

window.customElements.define('add-new-task-button', AddNewTaskButton);