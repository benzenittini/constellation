
// const func = async () => {
//     const response = await window.versions.ping();
//     console.log(response);

//     console.log(`This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()})`);
// };

// func();


// ----------------------------------



import "@fontsource/roboto";

import 'dragula/dist/dragula.min.css';

import './styles/global-styles';


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

import * as ErrorLogger from '../common/ErrorLogger';
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