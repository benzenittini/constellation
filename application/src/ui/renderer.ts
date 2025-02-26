
// Third-party styles and fonts
import "@fontsource/roboto";
import 'dragula/dist/dragula.min.css';

// Our global stylesheets
import './styles/global-styles.css';
import './styles/variables.css';
import './styles/mixins.css';
import './styles/animations.css';


// ==================
// App Initialization
// ------------------

import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);


// ===========
// Modal Setup
// -----------

import MWVueModals from 'mw-vue-modals';
import { PINK4, PURP0 } from './styles/styleVariables';
app.use(MWVueModals, {
    styleDefaults: {
        'background': `linear-gradient(60deg, ${PINK4} 16.54%, ${PURP0} 80.98%)`,
        'border': '1px solid black',
        'border-radius': '8px',
        'box-shadow': '0px 0px 20px rgba(0,0,0,0.5)',
        'width': '500px',
        'padding': '3px',
    }
});


// ===================
// Notifications Setup
// -------------------

import MWVueNotify from 'mw-vue-notify';
app.use(MWVueNotify, {
    defaults: {
        position: 'top-center'
    }
});

import * as ErrorLogger from './ErrorLogger';
ErrorLogger.initialize();


// ====================
// State Initialization
// --------------------

import {store} from './store/store';
app.use(store);


// ======================
// Component Registration
// ----------------------

import { components } from './components';

for (let componentKey in components) {
    app.component(componentKey, components[componentKey]);
}


// =================
// Third-Party Setup
// -----------------

// Add a hook to make all links inside markdown open a new window
import DOMPurify from 'dompurify';
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if ('target' in (node as Element)) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
    }
});


// =====
//  GO!
// -----

app.mount("#app");