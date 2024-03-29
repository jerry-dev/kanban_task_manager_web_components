import kebabMenuButtonStyleSheet from './kebabmenubutton.css' assert { type: 'css' };
import kebabMenuButtonTabletStyleSheet from './kebabmenubuttontablet.css' assert { type: 'css' };
import kebabMenuButtonMobileStyleSheet from './kebabmenubuttonmobile.css' assert { type: 'css' };
import editBoardDialogStyleSheet from '../../lib/stylesheets/editBoardDialog.css' assert { type: 'css' };
import editBoardDialogMobileStyleSheet from '../../lib/stylesheets/editBoardDialogMobile.css' assert { type: 'css' };
import deleteConfirmationDialogStyleSheet from '../../lib/stylesheets/deleteConfirmationDialog.css' assert { type: 'css' };
import deleteConfirmationDialogMobileStyleSheet from '../../lib/stylesheets/deleteConfirmationDialogMobile.css' assert { type: 'css' };
import store from '../../lib/store/index.js';
import isTextTooSimilar from '../../lib/isTextTooSimilar.js';

export default class KebabMenuButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.store = store;
        this.initializeState();
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
        this.shadowRoot.adoptedStyleSheets = [
            kebabMenuButtonStyleSheet,
            editBoardDialogStyleSheet,
            deleteConfirmationDialogStyleSheet,
            kebabMenuButtonTabletStyleSheet,
            kebabMenuButtonMobileStyleSheet,
            editBoardDialogMobileStyleSheet,
            deleteConfirmationDialogMobileStyleSheet
        ];
    }

    HTML() {
        let markup = /*html*/
        `<div id="kebabMenuButtonInnerContainer">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <dialog class="popupMenu">
            <span class="popupMenuInnerContainer">
                <button class="kebabEditMenuButton" type="button">Edit ${this.state.altering}</button>
                <button class="kebabDeleteMenuButton" type="button">Delete ${this.state.altering}</button>
            </span>
        </dialog>`;

        markup += /*html*/
        `<dialog class="editBoardDialog">
            <form class="editBoardDialogForm" novalidate>
                <span class="editBoardDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTitle">Edit Board</h3>
                    </header>
                    <label class="editBoardLabelContainer detail">
                        <span>Board Name</span>
                        <input type="text" class="formInput" placeholder="e.g. Project X" value="${this.state.currentBoard}" required/>
                    </label>
                    <label class="editBoardLabelContainer detail">
                        <span>Board Columns</span>
                        <ul class="columnList">
                            ${this.getColumnList()}
                        </ul>
                    </label>
                    <button type="button" class="newColumnButton">+ Add New Column</button>
                    <button type="submit" class="editBoardSaveChanges">Save Changes</button>
                </span>
            </form>
        </dialog>`;

        markup += /*html*/
        `<dialog class="deleteBoardDialog">
            <form class="deleteBoardDialogForm" novalidate>
                <span class="deleteBoardDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTaskTitle deleteHeader">Delete this task?</h3>
                    </header>
                    <p>Are you sure you want to delete the ‘${this.state.currentBoard}’ board? This action will remove all columns and tasks and cannot be reversed.</p>
                    <section class="buttonContainer">
                        <button class="confirmButton deleteButton">Delete</button>
                        <button class="confirmButton cancelButton">Cancel</button>
                    </section>
                </span>
            </form>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.clickManager();
        if (this.state.altering === "Board") {
            // if true, this means it's the kebab menu in the header
            // We don't use this method in other places
            this.submitEditBoardDialogFormManager();
        }        
    }

    getName() {
        return `KebabMenuButton${this.state.altering}`;
    }

    initializeState() {
        this.oldState = null;

        this.state = {
            altering: this.getAttribute('altering'),
            currentBoard: this.getAttribute('currentboard'),
        };

        this.state.columnNames = this.getColumnNames();

        this.updateOldState();

        // for (let i = 0; i < this.store.state.boards.length; i++) {
        //     if (this.store.state.boards[i].name === this.state.currentBoard) {
        //         this.store.state.boards[i].columns.forEach((column) => {
        //             this.state.columnNames[this.state.columnNames.length] = column.name;
        //         });
        //     }
        // }
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    getColumnNames() {
        const results = [];

        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.store.state.boards[i].name === this.state.currentBoard) {
                this.store.state.boards[i].columns.forEach((column) => {
                    results[results.length] = column.name;
                });
            }
        }

        return results;
    }

    popUpMenuManager() {
        this.shadowRoot.addEventListener('click', (event) => {
            if (event.composedPath()[0].id === 'kebabMenuButtonInnerContainer') {
                this.togglePopUpMenu();
            }
        });
    }

    togglePopUpMenu() {
        if (!this.isPopUpMenuShowing()) {
            this.launchPopUpMenu();
        } else {
            this.closePopUpMenu();
        }
    }

    getPopUpMenu() {
        return this.shadowRoot.querySelector('.popupMenu');
    }

    isPopUpMenuShowing() {
        return this.getPopUpMenu().open === true;
    }

    launchPopUpMenu() {
        const popupMenu = this.getPopUpMenu();
        if (!popupMenu.open) popupMenu.showModal();
    }

    closePopUpMenu() {
        const popupMenu = this.getPopUpMenu();
        if (popupMenu.open) popupMenu.close();
    }

    closeOnPopUpMenuOverlayClickListener() {
        const popupMenu = this.getPopUpMenu();

        popupMenu.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName === "DIALOG") {
                this.closePopUpMenu();
            }
        });
    }

    clickManager() {
        this.popUpMenuManager();
        this.editButtonClickManager();
        this.deleteButtonClickManager();
        this.addNewColumnClickListener();
        this.deleteColumnClickListener();
        this.closeOnEditBoardOverlayClickListener();
        this.closeOnDeleteBoardOverlayClickListener();
        this.closeOnPopUpMenuOverlayClickListener();
        this.confirmButtonsListener();
    }

    editButtonClickManager() {
        const kebabEditMenuButton = this.getPopUpMenu().querySelector('.kebabEditMenuButton');

        kebabEditMenuButton.addEventListener('click', () => {
            this.launchEditBoardDialog();
        });
    }

    deleteButtonClickManager() {
        const kebabDeleteMenuButton = this.getPopUpMenu().querySelector('.kebabDeleteMenuButton');

        kebabDeleteMenuButton.addEventListener('click', () => {
            this.launchDeleteBoardDialog();
        });
    }

    getEditBoardDialog() {
        return this.shadowRoot.querySelector('.editBoardDialog');
    }

    isEditBoardDialogShowing() {
        return this.getEditBoardDialog().open === true;
    }

    launchEditBoardDialog() {
        if (!this.isEditBoardDialogShowing()) {
            this.closePopUpMenu();
            this.getEditBoardDialog().showModal();
        };
    }

    closeEditBoardDialog() {
        if (this.isEditBoardDialogShowing()) this.getEditBoardDialog().close();
    }

    closeOnEditBoardOverlayClickListener() {
        const editBoardDialog = this.getEditBoardDialog();

        editBoardDialog.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName === "DIALOG") {
                this.closeEditBoardDialog();
            }
        });
    }

    getDeleteBoardDialog() {
        return this.shadowRoot.querySelector('.deleteBoardDialog');
    }

    isDeleteBoardDialogShowing() {
        return this.getDeleteBoardDialog().open === true;
    }

    launchDeleteBoardDialog() {
        if (!this.isDeleteBoardDialogShowing()) {
            this.closePopUpMenu();
            this.getDeleteBoardDialog().showModal();
        };
    }

    closeDeleteBoardDialog() {
        if (this.isDeleteBoardDialogShowing()) this.getDeleteBoardDialog().close();
    }

    closeOnDeleteBoardOverlayClickListener() {
        const deleteBoardDialog = this.getDeleteBoardDialog();

        deleteBoardDialog.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName === "DIALOG") {
                this.closeDeleteBoardDialog();
            }
        });
    }

    getColumnList() {
        let markup = '';

        this.state.columnNames.forEach((item) => {
            markup += /*html*/
            `<li>
                <input type="text" class="formInput" placeholder="e.g. Todo" value="${item}" data-title="${item}" required/>
                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;
        });

        return markup;
    }

    addNewColumn() {
        const editBoardDialog = this.getEditBoardDialog();

        let markup = '';

        const columnListElements = editBoardDialog.querySelector('.columnList').querySelectorAll('li');

        columnListElements.forEach((item) => {
            const currentValue = item.querySelector('input').value;
            const originalColumnName = item.querySelector('input').getAttribute('data-title');

            // The existing inputs being recreated
            markup += /*html*/
            `<li>
                <input type="text" class="formInput" placeholder="e.g. Todo" value="${currentValue}" data-title="${originalColumnName}" required/>
                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;
        });

        // The new input being created
        markup += /*html*/
            `<li>
                <input type="text" class="formInput" placeholder="e.g. Todo" value="" data-title required/>
                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;

        editBoardDialog.querySelector('.columnList').innerHTML = markup;
    }

    addNewColumnClickListener() {
        const newColumnButton = this.getEditBoardDialog().querySelector('.newColumnButton');

        newColumnButton.addEventListener('click', () => {
            this.addNewColumn();
        });
    }

    deleteColumnClickListener() {
        const columnList = this.getEditBoardDialog().querySelector('.columnList');
        
        columnList.addEventListener('click', (event) => {
            if (event.target.className === "deleteColumn") {
                event.target.parentNode.remove();
            }
        });
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

    // Invoke if the originalBoardNameStatus === "CHANGED"
    // Skip this check if the originalBoardNameStatus === "SAME"
    doesBoardNameExist(newBoardName, store) {
        const boards = JSON.parse(JSON.stringify(store.state.boards));

        let result = false;

        boards.forEach((board) => {
            if (isTextTooSimilar(board.name, newBoardName)) {
                result = true;
            }            
        });

        return result;
    }


    notifyOfDuplicateBoardName() {
        const messageContainer = this.getEditBoardDialog().querySelectorAll('label')[0].querySelector('span');
        messageContainer.classList.add('error');
        messageContainer.innerText = `The name you specified is too similar to an existing board's name. Please specify another name.`;
    }

    // Invoke if the originalColumnStatus !== "SAME"
    // If it isn't "SAME", then the originalColumnStatus === "NEW" or "CHANGED"
    // In the case of "NEW" or "CHANGED", we'll need to check those
    areThereDuplicateColumnNames() {
        let result = false;

        const columnListLabelContainer = this.getEditBoardDialog().querySelectorAll('.editBoardLabelContainer')[1];
        const columnListElements = Array.from(columnListLabelContainer.querySelectorAll('.columnList li'));

        let theColumnValues = [];

        columnListElements.forEach((listElement) => {
            theColumnValues[theColumnValues.length] = listElement.querySelector('input').value;
        });

        theColumnValues.forEach((columnValue) => {
            let count = 0;

            for (let i = 0; i < columnListElements.length; i++) {
                if (isTextTooSimilar(columnListElements[i].querySelector('input').value, columnValue)) {
                    count++
                }
            }

            if (count > 1) {
                result = true;
            }
        });

        return result;
    }

    notifyOfDuplicateColumnName() {
        const messageContainer = this.getEditBoardDialog().querySelectorAll('label')[1].querySelector('span');
        messageContainer.classList.add('error');
        messageContainer.innerText = `At least one column name you specified is too similar to an existing column name in this board. Please specify another name.`;
    }

    submitEditBoardDialogFormManager() {
        let isWatchingBoardNameInput = false;

        // SUBTASK OBJECT: For each column input within the edit form dialog, I will create a key for it.
        // Each subtask input's key name will be its index position within a querySelectorAll on the list.
        // The default value will be false for each.
        let isWatchingColumnInputs = {};

        const editBoardDialogFormElement = this.getEditBoardDialog().querySelector('.editBoardDialogForm');

        // SUBTASK OBJECT: The specified operation a few lines above
        this.getEditBoardDialog().querySelector('.columnList').querySelectorAll('li').forEach((item, index) => {
            isWatchingColumnInputs[index] = false;
        });

        editBoardDialogFormElement.addEventListener('submit', (event) => {
            event.preventDefault();

            const boardNameInput = this.getEditBoardDialog().querySelector('.editBoardLabelContainer > input');

            let formIsValid = false;

            if (boardNameInput.validity.valid) {
                // checking the list elements if the title input is valid
                let allListElementsAreValid = null;

                // Iterating through the list elements to individually check them
                // This loops job is to mark if any of the elements aren't valid (allElementsAreValid)
                // If That individual element is invalid, we place the dynamic input validation on it.
                Array.from(this.getEditBoardDialog().querySelector('.columnList').querySelectorAll('li')).forEach((listItem, index) => {
                    if (!listItem.querySelector('input').validity.valid) {
                        this.showErrorMessage(listItem.querySelector('input'));

                        if (!isWatchingColumnInputs[index]) {
                            this.dynamicInputValidation(listItem.querySelector('input'), "e.g. Build Thing");
                            isWatchingColumnInputs[index] = true;
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
                this.showErrorMessage(boardNameInput);
                if (!isWatchingBoardNameInput) {
                    this.dynamicInputValidation(boardNameInput, "e.g. Project X");
                    isWatchingBoardNameInput = true;
                }
            }

            if (formIsValid) {
                const action = {
                    type: 'EDIT_BOARD',
                    payload: this.getEditBoardFormDetails()
                };

                const newBoardName = this.getEditBoardDialog().querySelector('.editBoardLabelContainer > input').value;

                if (action.payload.boardNameDetails.originalBoardNameStatus === "CHANGED" && this.doesBoardNameExist(newBoardName, this.store)) {
                    this.notifyOfDuplicateBoardName();
                } else {
                    // If there is no dupliate boards name, we start
                    // to check if there are any duplicate column names
                    if (action.payload.columnDetails.originalColumnStatus !== "SAME" && this.areThereDuplicateColumnNames()) {
                        this.notifyOfDuplicateColumnName();
                    } else {
                        // if there are no duplicate board names and no duplicate column names
                        if (action.payload.boardNameDetails.originalBoardNameStatus === "CHANGED") {
                            this.unSubTheBoardAndChildColumns(action.payload.boardNameDetails.originalBoardName);
                        }

                        if (action.payload.deletedColumns.length > 0) {
                            this.unSubTheColumns(action.payload.deletedColumns);
                        }
                        this.store.dispatch(action);
                        this.closeEditBoardDialog(action.payload.columnDetails.deletedColumns);
                    }                    
                }
            }
        });
    }

    // Expecting an array of column name(s) as a strings
    unSubTheColumns(columns) {
        columns.forEach((column) => {
            const columnID = `${this.state.currentBoard} - Column ${column}`;
            this.store.observer.unsubscribe(columnID, 'stateChange');
        });
    }

    // Expecting a the board's name as a string
    unSubTheBoardAndChildColumns(board) {
        const theColumns = this.state.columnNames;
        this.unSubTheColumns(theColumns);

        const boardID = `Tasksboard - ${board}`;
        this.store.observer.unsubscribe(boardID, 'stateChange');
    }

    getEditBoardFormDetails() {
        const newBoardName = this.getEditBoardDialog().querySelector('.editBoardLabelContainer > input').value;
        const columnListElements = this.getEditBoardDialog().querySelector('.columnList').querySelectorAll('li');

        let boardNameDetails = {
            originalBoardName: this.state.currentBoard,
            originalBoardNameStatus: (this.state.currentBoard === newBoardName) ? "SAME" : "CHANGED",
            newBoardName: newBoardName,
        };

        let columnDetails = [];
        let deletedColumns = [];

        columnListElements.forEach((listElement) => {
            let columnStatus = null;

            const newColumnName = listElement.querySelector('input').value;
            const originalColumnName = listElement.querySelector('input').getAttribute('data-title');

            if (originalColumnName.length < 1) {
                columnStatus = "NEW";
            }

            if (originalColumnName === newColumnName) {
                columnStatus = "SAME";
            }

            if ((originalColumnName.length > 0) && (originalColumnName !== newColumnName)) {
                columnStatus = "CHANGED";
            }

            columnDetails[columnDetails.length] = {
                originalColumnName: originalColumnName,
                originalColumnStatus: columnStatus,
                newName: newColumnName
            };

            this.state.columnNames.forEach((stateDataColName) => {
                let columnStillExists = false;

                columnListElements.forEach((listElement) => {
                    const originalName = listElement.querySelector('input').getAttribute('data-title');

                    if (stateDataColName === originalName) {
                        columnStillExists = true;
                    }
                });

                if (!columnStillExists) {
                    const elementNotPresent = -1;
                    if (deletedColumns.indexOf(stateDataColName) === elementNotPresent) {
                        deletedColumns[deletedColumns.length] = stateDataColName;
                    }
                }
            });

        });

        // If there are no columns, then that means each column was deleted.
        // In that case, we'll mark each column name within the state to be deleted.
        if (columnListElements.length < 1) {
            this.state.columnNames.forEach((stateDataColName) => {
                deletedColumns[deletedColumns.length] = stateDataColName;
            });
        }

        return { boardNameDetails, columnDetails, deletedColumns };
    }

    confirmButtonsListener() {
        const deleteBoardDialog = this.getDeleteBoardDialog();

        const deleteButton = deleteBoardDialog.querySelector('.buttonContainer > .deleteButton');
        const cancelButton = deleteBoardDialog.querySelector('.buttonContainer > .cancelButton');

        deleteButton.addEventListener('click', (event) => {
            event.preventDefault();

            const action = {
                type: "DELETE_BOARD",
                payload: {
                    board: this.state.currentBoard,
                }
            };

            this.unSubTheBoardAndChildColumns(this.state.currentBoard);

            this.store.dispatch(action);
            this.closeDeleteBoardDialog();
        });

        cancelButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.closeDeleteBoardDialog();
        });
    }

    didComponentStateChanged() {
        const oldState = `${JSON.stringify(this.oldState.altering)}${JSON.stringify(this.oldState.currentBoard)}${JSON.stringify(this.oldState.columnNames)}`;
		const currentState = `${JSON.stringify(this.state.altering)}${JSON.stringify(this.state.currentBoard)}${JSON.stringify(this.state.columnNames)}`;
        return oldState !== currentState;
    }

    refresh(){
        this.state = {
            altering: this.getAttribute('altering'),
            currentBoard: this.getAttribute('currentboard'),
        };

        this.state.columnNames = this.getColumnNames();

        if (this.didComponentStateChanged()) {
            this.refreshUI();
            this.updateOldState();
        }
    }

    refreshUI() {
        this.shadowRoot.innerText = '';
        this.HTML();
    }
}

window.customElements.define('kebab-menu-button', KebabMenuButton);
