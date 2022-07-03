import appHeaderStylesheet from './appheader.css' assert { type: 'css' };
import AddNewTaskButton from '../addnewtaskbutton/AddNewTaskButton.js';
import AppLogo from '../applogo/AppLogo.js';

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
    }

    CSS() {
        this.shadowRoot.adoptedStyleSheets = [ appHeaderStylesheet ];
    }

    // OLD() {
    //     const markup = /*html*/
    //     `<section id="logoOuterContainer">
    //         <div id="logoInnerContainer">
    //             <div id="logoBarsContainer">
    //                 <span class="logoBars" id="logoBarOne"></span>
    //                 <span class="logoBars" id="logoBarTwo"></span>
    //                 <span class="logoBars" id="logoBarThree"></span>
    //             </div>
    //             <h2>Kanban</h2>
    //         </div>
    //     </section>
            
    //     <section id="sectionTitleSection">
    //         <div id="sectionTitleSectionInnerContainer">
    //             <h2>Platform Launch</h2>
    //             <add-new-task-button></add-new-task-button>
    //             <div id="kebabMenu">
    //                <span class="dots"></span>
    //                <span class="dots"></span>
    //                <span class="dots"></span>
    //             </div>
    //         </div>
    //     </section>`;

    //     this.shadowRoot.innerHTML = markup;
    // }

    HTML() {
        const markup = /*html*/
        `<section id="logoOuterContainer">
            <app-logo></app-logo>
        </section>
            
        <section id="sectionTitleSection">
            <div id="sectionTitleSectionInnerContainer">
                <h2>Platform Launch</h2>
                <add-new-task-button></add-new-task-button>
                <div id="kebabMenu">
                   <span class="dots"></span>
                   <span class="dots"></span>
                   <span class="dots"></span>
                </div>
            </div>
        </section>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('app-header')) {
    window.customElements.define('app-header', AppHeader);
}