
// const information = document.getElementById('info');
// information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;
// information!.innerText = `hey.`;


// const func = async () => {
//     const response = await window.versions.ping();
//     console.log(response);
// };

// func();


// ----------------------------------



// import "@fontsource/roboto";

// import 'dragula/dist/dragula.min.css';

// import './common/styles/global-styles';


// ==================
// App Initialization
// ------------------

import { createApp, defineAsyncComponent } from 'vue';
import App from './App.vue';

const app = createApp(App);


// ===========
// Modal Setup
// -----------

// import MWVueModals from 'mw-vue-modals';
// import { PINK4, PURP0 } from './common/styles/styleVariables';
// app.use(MWVueModals, {
//     styleDefaults: {
//         'background': `linear-gradient(60deg, ${PINK4} 16.54%, ${PURP0} 80.98%)`,
//         'border': '1px solid black',
//         'border-radius': '8px',
//         'box-shadow': '0px 0px 20px rgba(0,0,0,0.5)',
//         'width': '500px',
//         'padding': '3px',
//     }
// });


// ===================
// Notifications Setup
// -------------------

// import MWVueNotify from 'mw-vue-notify';
// import * as ErrorLogger from './common/utilities/ErrorLogger';
// app.use(MWVueNotify, {
//     defaults: {
//         position: 'top-center'
//     }
// });
// ErrorLogger.initialize();


// ====================
// State Initialization
// --------------------

// import {store} from './store/store';
// app.use(store);


// ====================
// Route Initialization
// --------------------

// import { createRouter, createWebHistory } from 'vue-router';
// import { routes } from './routes';

// export const router = createRouter({
//     history: createWebHistory(),
//     routes,
//     scrollBehavior: () => ({ top: 0 }),
// });
// app.use(router);


// ======================
// Component Registration
// ----------------------

// import { components } from './components';

// for (let componentKey in components) {
//     app.component(componentKey, defineAsyncComponent(components[componentKey]));
// }


// =================
// Third-Party Setup
// -----------------

// // Add a hook to make all links inside markdown open a new window
// import DOMPurify from 'dompurify';
// DOMPurify.addHook('afterSanitizeAttributes', function (node) {
//     if ('target' in (node as Element)) {
//         node.setAttribute('target', '_blank');
//         node.setAttribute('rel', 'noopener');
//     }
// });


// =====
//  GO!
// -----

app.mount("#app");