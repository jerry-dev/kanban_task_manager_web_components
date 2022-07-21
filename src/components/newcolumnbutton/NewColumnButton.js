import newColumnButtonStyleSheet from './newcolumnbutton.css' assert {type: 'css'};
import store from '../../lib/store/index.js';

export default class NewColumnButton extends HTMLElement {
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
        this.initializeState();
        this.CSS();
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ newColumnButtonStyleSheet ];
    }

    HTML() {
        let markup = /*html*/`<p>+ New Column</p>`;

        markup += /*html*/
        `<dialog class="editBoardDialog">
            <form class="editBoardDialogForm" novalidate>
                <span class="editBoardDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogTitle">Edit Board</h3>
                    </header>
                    <label class="editBoardLabelContainer detail">
                        Board Name
                        <input type="text" class="formInput" placeholder="e.g. Project X" value="${this.state.board}" required/>
                    </label>
                    <label class="editBoardLabelContainer detail">
                        Board Columns
                        <ul class="columnList"></ul>
                    </label>
                    <button type="button" class="newColumnButton">+ Add New Column</button>
                    <button type="submit" class="editBoardSaveChanges">Save Changes</button>
                </span>
            </form>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.generateColumnList();
        this.clickManagers();
        this.submitEditBoardDialogFormManager();
    }

    clickManagers() {       
        this.clickedListener();
        this.closeOnOverlayClickListener();
        this.addNewColumnClickListener();
        this.deleteColumnClickListener();
    }

    initializeState() {
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
        this.state.columnNames = [];
        
        for (let i = 0; i < this.store.state.boards.length; i++) {
            if (this.store.state.boards[i].name === this.state.board) {
                
                this.store.state.boards[i].columns.forEach((column) => {
                    this.state.columnNames[this.state.columnNames.length] = column.name;
                });
            }
        }
    }

    clickedListener() {
        this.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName !== "DIALOG") {
                this.launchEditBoardDialog();
            }
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
            this.getEditBoardDialog().showModal();
        };
    }

    closeEditBoardDialog() {
        if (this.isEditBoardDialogShowing()) this.getEditBoardDialog().close();
    }

    closeOnOverlayClickListener() {
        const editBoardDialog = this.getEditBoardDialog();

        editBoardDialog.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName === "DIALOG") {
                this.closeEditBoardDialog();
            }
        });
    }

    addNewColumnClickListener() {
        const newColumnButton = this.getEditBoardDialog().querySelector('.newColumnButton');

        newColumnButton.addEventListener('click', () => {
            this.addNewColumn();
        });
    }

    generateColumnList() {
        let markup = '';

        this.state.columnNames.forEach((item) => {
            markup += /*html*/
            `<li>
                <input type="text" class="formInput" placeholder="e.g. Todo" value="${item}" data-title="${item}" required/>
                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;
        });

        this.getEditBoardDialog().querySelector('.columnList').innerHTML = markup;
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

                this.store.dispatch(action);
                this.closeEditBoardDialog();
            }
        });
    }

    getEditBoardFormDetails() {
        const newBoardName = this.getEditBoardDialog().querySelector('.editBoardLabelContainer > input').value;
        const columnListElements = this.getEditBoardDialog().querySelector('.columnList').querySelectorAll('li');

        let boardNameDetails = {
            originalBoardName: this.state.board,
            originalBoardNameStatus: (this.state.board === newBoardName) ? "SAME" : "CHANGED",
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

            if ((originalColumnName.length > 1) && (originalColumnName !== newColumnName)) {
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

        return { boardNameDetails, columnDetails, deletedColumns };
    }
}

if (!window.customElements.get('new-column-button')) {
    window.customElements.define('new-column-button', NewColumnButton);
}