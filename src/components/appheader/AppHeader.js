import appHeaderStylesheet from './appheader.css' assert { type: 'css' };
import AddNewTaskButton from '../addnewtaskbutton/AddNewTaskButton.js';
import AppLogo from '../applogo/AppLogo.js';
import KebabMenuButton from '../kebabmenubutton/KebabMenuButton.js';
import store from '../../lib/store/index.js';

export default class AppHeader extends HTMLElement {
    constructor() {
        super()
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
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ appHeaderStylesheet ];
    }

    HTML() {
        const markup = /*html*/
        `<section id="logoContainer">
            <app-logo></app-logo>
        </section>
            
        <section id="sectionTitleSection">
            <div id="sectionTitleSectionInnerContainer">
                <h2>${this.state.currentBoard}</h2>
                <add-new-task-button currentboard="${this.state.currentBoard}"></add-new-task-button>
                <kebab-menu-button currentboard="${this.state.currentBoard}" altering="Board"></kebab-menu-button>
            </div>
        </section>`;

        this.shadowRoot.innerHTML = markup;
    }

    initializeComponentState() {
        this.oldState = null;
        this.state = {
            currentBoard: this.getAttribute('currentboard')
        };
        
        this.updateOldState();
    }

    updateOldState() {
        this.oldState = JSON.parse(JSON.stringify(this.state));
    }

    didComponentStateChange() {
        return JSON.stringify(this.oldState.currentBoard) !== JSON.stringify(this.state.currentBoard);
    }

    refresh() {
        this.state = {
            currentBoard: this.getAttribute('currentboard')
        };

        if (this.didComponentStateChange()) {
            this.refreshUI();
            this.updateOldState();
        }
    }

    refreshUI() {
        this.shadowRoot.textContent = '';
        this.HTML();
    }

    getName() {
        return 'AppHeader';
    }
}

if (!window.customElements.get('app-header')) {
    window.customElements.define('app-header', AppHeader);
}