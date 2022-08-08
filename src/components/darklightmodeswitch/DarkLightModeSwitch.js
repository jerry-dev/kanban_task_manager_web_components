import darkLightModeSwitchStyleSheet from './darklightmodeswitch.css' assert { type: 'css' };
import darkLightModeSwitchTabletStyleSheet from './darklightmodeswitchtablet.css' assert { type: 'css' };
import ToggleSwitch from '../toggleswitch/ToggleSwitch.js';

export default class DarkLightModeSwitch extends HTMLElement {
    constructor() {
        super();
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
        this.shadowRoot.adoptedStyleSheets = [
            darkLightModeSwitchStyleSheet,
            darkLightModeSwitchTabletStyleSheet
        ];
    }

    HTML() {
        const markup = /*html*/
        `<div id="switchInnerContainer">
            <img alt="Light theme symbol" src="../../src/assets/icons/sun.svg"/>
            <toggle-switch></toggle-switch>
            <img alt="Dark theme symbol" src="../../src/assets/icons/moon.svg"/>
        </div>`;

        this.shadowRoot.innerHTML = markup;
    }
}

if (!window.customElements.get('dark-light-mode-switch')) {
    window.customElements.define('dark-light-mode-switch', DarkLightModeSwitch);
}