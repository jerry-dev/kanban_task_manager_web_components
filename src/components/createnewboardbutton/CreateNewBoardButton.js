import createNewBoardButtonStyleSheet from './createnewboardbutton.css' assert { type: 'css' };
import store from '../../lib/store/index.js';
import isTextTooSimilar from '../../lib/isTextTooSimilar.js';

export default class CreateNewBoardButton extends HTMLElement {
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
        this.shadowRoot.adoptedStyleSheets = [ createNewBoardButtonStyleSheet ];
    }

    HTML() {
        const markup = /*html*/
        `<img src="./src/assets/icons/fluent_board-split-24-regular.svg"/>+ Create New Board
        
        <dialog class="addNewBoardDialog">
            <form class="addNewBoardDialogForm" novalidate>
                <span class="addNewBoardDialogFormInnerContainer">
                    <header class="formHeader">
                        <h3 class="dialogBoardTitle">Add New Board</h3>
                    </header>
                    <label class="newBoardLabelContainer detail">
                        <span>Name</span>
                        <input type="text" class="formInput" placeholder="e.g. Web Design" value="" required/>
                    </label>
                    <label class="newBoardLabelContainer detail">
                        <span>Columns</span>
                        <ul class="newColumnList">
                            <li>
                                <input type="text" class="formInput" placeholder="e.g. Todo" value="" required/>
                                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
                            </li>
                            <li>
                                <input type="text" class="formInput" placeholder="e.g. Doing" value="" required/>
                                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
                            </li>
                        </ul>
                    </label>
                    <button type="button" class="newColumnButton">+ Add New Column</button>
                    <button type="submit" class="createNewBoard">Create New Board</button>
                </span>
            </form>
        </dialog>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.clickManagers();
    }

    clickManagers() {
        this.createNewBoardOnClick();
        this.addNewColumnClickListener();
        this.deleteNewColumnClickListener();
        this.submitAddNewBoardDialogFormManager();
        this.closeOnOverlayClickListener();
    }

    createNewBoardOnClick() {
        this.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName !== "DIALOG") {
                this.launchAddNewBoardDialog();
            }
        });
    }

    isAddNewBoardDialogShowing() {
        return this.getAddNewBoardDialog().open === true;
    }

    getAddNewBoardDialog() {
        return this.shadowRoot.querySelector('.addNewBoardDialog');
    }

    launchAddNewBoardDialog() {
        if (!this.isAddNewBoardDialogShowing()) {
            this.getAddNewBoardDialog().showModal();
        };
    }

    closeOnOverlayClickListener() {
        const addNewBoardkDialog = this.getAddNewBoardDialog();

        addNewBoardkDialog.addEventListener('click', (event) => {
            if (event.composedPath()[0].nodeName === "DIALOG") {
                this.closeAddNewBoardDialog();
            }
        });
    }

    closeAddNewBoardDialog() {
        if (this.isAddNewBoardDialogShowing()) {
            this.getAddNewBoardDialog().close();
        };
    }

    addNewColumnClickListener() {
        const addNewBoardDialog = this.getAddNewBoardDialog();
        const newColumnButton = addNewBoardDialog.querySelector('.newColumnButton');

        newColumnButton.addEventListener('click', () => {
            this.addNewColumn();
        });
    }

    addNewColumn() {
        const addNewBoardkDialog = this.getAddNewBoardDialog();

        let markup = '';

        const columnListElements = addNewBoardkDialog.querySelector('.newColumnList').querySelectorAll('li');

        columnListElements.forEach((item) => {
            const currentValue = item.querySelector('input').value;

            markup += /*html*/
            `<li>
                <input type="text" class="formInput" placeholder="e.g. Todo" value="${currentValue}" required/>
                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;
        });

        markup += /*html*/
            `<li>
                <input type="text" class="formInput" placeholder="e.g. Todo" value="" required/>
                <button class="deleteColumn" type="button"><img alt="Delete column symbol" src="./src/assets/icons/cross.svg"/></button>
            </li>`;

        addNewBoardkDialog.querySelector('.newColumnList').innerHTML = markup;
    }

    doesBoardNameExist(newBoardName, store) {
        const boards = JSON.parse(JSON.stringify(store.state.boards));

        let result = false;

        boards.forEach((board) => {
            result = isTextTooSimilar(board.name, newBoardName);
        });

        return result;
    }

    notifyOfDuplicateBoardName() {
        const messageContainer = this.getAddNewBoardDialog().querySelectorAll('label')[0].querySelector('span');
        messageContainer.classList.add('error');
        messageContainer.innerText = `The name you specified is too similar to an existing board's name. Please specify another name.`;
    }

    areThereDuplicateColumnNames() {
        let result = false;

        const theColumnValues = this.getNewBoardkDialogFormColumns();

        const columnListLabelContainer = this.getAddNewBoardDialog().querySelectorAll('label')[1];
        const columnListElements = Array.from(columnListLabelContainer.querySelectorAll('.newColumnList li'));

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
        const messageContainer = this.getAddNewBoardDialog().querySelectorAll('label')[1].querySelector('span');
        messageContainer.classList.add('error');
        messageContainer.innerText = `At least one column name you specified is too similar to an existing column name in this board. Please specify another name.`;
    }
    

    deleteNewColumnClickListener() {
        const addNewBoardkDialog = this.getAddNewBoardDialog();
        const newColumnList = addNewBoardkDialog.querySelector('.newColumnList');
        
        newColumnList.addEventListener('click', (event) => {
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

    getNewBoardkDialogFormColumns() {
        const columns = [];

        const newColumnList = this.getAddNewBoardDialog().querySelector('.newColumnList');

        newColumnList.querySelectorAll('li').forEach((item) => {
            columns[columns.length] = item.querySelector('input').value
        });

        return columns;
    }

    submitAddNewBoardDialogFormManager() {
        let isWatchingTitleInput = false;

        // COLUMN OBJECT: For each column input within the form, I will create a key for it.
        // Each column input's key name will be its index position within a querySelectorAll on the list.
        // The default value will be false for each.
        let isWatchingNewColumnInputs = {};

        const addNewBoardkDialog = this.getAddNewBoardDialog();

        // COLUMN OBJECT: The specified operation a few lines above
        addNewBoardkDialog.querySelector('.newColumnList').querySelectorAll('li').forEach((item, index) => {
            isWatchingNewColumnInputs[index] = false;
        });

        addNewBoardkDialog.querySelector('form').addEventListener('submit', (event) => {
            event.preventDefault();

            const titleInput = addNewBoardkDialog.querySelectorAll('label')[0].querySelector('input');
            const newColumnListElements = addNewBoardkDialog.querySelector('.newColumnList').querySelectorAll('li');

            let formIsValid = false;

            if (titleInput.validity.valid) {
                // checking the list elements if the title input is valid
                let allListElementsAreValid = null;

                // Iterating through the list elements to individually check them
                // This loops job is to mark if any of the elements aren't valid (allElementsAreValid)
                // If That individual element is invalid, we place the dynamic input validation on it.
                newColumnListElements.forEach((listItem, index) => {
                    if (!listItem.querySelector('input').validity.valid) {
                        this.showErrorMessage(listItem.querySelector('input'));

                        if (!isWatchingNewColumnInputs[index]) {
                            this.dynamicInputValidation(listItem.querySelector('input'), "e.g. Todo");
                            isWatchingNewColumnInputs[index] = true;
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
                // If so, we skip checking the column list elements,
                // and just indicate that the form is invalid.
                formIsValid = false;
                this.showErrorMessage(titleInput);
                if (!isWatchingTitleInput) {
                    this.dynamicInputValidation(titleInput, "e.g. Web Design");
                    isWatchingTitleInput = true;
                }
            }

            if (formIsValid) {
                const action = {
                    type: 'CREATE_NEW_BOARD',
                    payload: {
                        name: titleInput.value,
                        columns: this.getNewBoardkDialogFormColumns()
                    }
                };

                if (this.doesBoardNameExist(titleInput.value, this.store)) {
                    this.notifyOfDuplicateBoardName();
                } else {
                    // If there is no dupliate boards name, we start
                    // to check if there are any duplicate column names
                    if (this.areThereDuplicateColumnNames()) {
                        this.notifyOfDuplicateColumnName();
                    } else {
                        // if there are no duplicate board names and no duplicate column names
                        this.store.dispatch(action);
                        this.closeAddNewBoardDialog();
                    }                    
                }
            }
        });
    }
}

if (!window.customElements.get('create-new-board-button')) {
    window.customElements.define('create-new-board-button', CreateNewBoardButton);
}