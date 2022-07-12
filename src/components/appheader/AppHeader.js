import appHeaderStylesheet from './appheader.css' assert { type: 'css' };
import AddNewTaskButton from '../addnewtaskbutton/AddNewTaskButton.js';
import AppLogo from '../applogo/AppLogo.js';
import KebabMenuButton from '../kebabmenubutton/KebabMenuButton.js';

export default class AppHeader extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.CSS();
        this.HTML();
        this.SCRIPTS();
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ appHeaderStylesheet ];
    }

    HTML() {
        let boardName = window.location.hash.replace("#/", "");
        boardName = boardName.split("");
        boardName[0] = boardName[0].toUpperCase();

        for (let i = 0; i < boardName.length; i++) {
            if (boardName[i] === "-") {
                boardName[i] = " "
                boardName[i+1] = boardName[i+1].toUpperCase();
                break;
            }
        }
        
        boardName = boardName.join("");

        const markup = /*html*/
        `<section id="logoOuterContainer" data-behavior>
            <app-logo></app-logo>
        </section>
            
        <section id="sectionTitleSection">
            <div id="sectionTitleSectionInnerContainer">
                <h2>${boardName}</h2>
                <add-new-task-button></add-new-task-button>
                <kebab-menu-button></kebab-menu-button>
            </div>
        </section>`;

        this.shadowRoot.innerHTML = markup;
    }

    SCRIPTS() {
        this.updateBoardName();
    }

    updateBoardName() {
        window.addEventListener('popstate', () => {
            this.HTML();
        });
    }
}

if (!window.customElements.get('app-header')) {
    window.customElements.define('app-header', AppHeader);
}