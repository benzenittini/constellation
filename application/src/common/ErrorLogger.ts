
import { useVueNotify, VueNotify } from 'mw-vue-notify';
import { TypedMap } from '../../../common/DataTypes/GenericDataTypes';

let mwVueNotify: VueNotify;

export function initialize() {
    mwVueNotify = useVueNotify();
}

export function showError(code: string, replacements?: string[]) {
    if (code === '') {
        // Should only use this during development, NEVER for prod errors.
        mwVueNotify.showNotification({
            cssClasses: ['mw-notification-failure'],
            dismissAfterMillis: 5000,
            data: { message: performReplacements("An unexpected error occurred: %s", replacements) }
        });
    } else {
        let err = ERROR_LOOKUP[code];
        mwVueNotify.showNotification({
            cssClasses: ['mw-notification-failure'],
            dismissAfterMillis: err.dismissAfterMillis,
            data: { message: `${performReplacements(err.clientTemplate, replacements)} (Error C:${code})` }
        });
    }
}

function performReplacements(stringTemplate: string, replacements?: string[]): string {
    let finalString = stringTemplate;
    if (Array.isArray(replacements)) {
        replacements.forEach(r => finalString = finalString.replace(/%s/, r));
    }
    return finalString;
}

type ClientError = {
    dismissAfterMillis: number,
    clientTemplate: string,
}

/* Start counting at "1". "0" is reserved for misc items.
 *
 * 1.<page>.<errnum> = Website
 *     1.1.*  = Login
 *     1.2.*  = CreateAccount
 *     1.3.*  = Projects
 *     1.4.*  = Logout
 *     1.5.*  = Account
 *     1.6.*  = Forgot Password
 *     1.7.*  = Reset Password
 *     1.8.*  = Give Feedback
 *     1.9.*  = Changelog
 *     1.10.* = Admin
 * 
 * 2.<view/component>.<errnum> = Application
 *     2.1.* = <root application>
 *     2.2.* = ViewSelector
 * 
 * 3.<store>.<errnum> = Store
 *     3.1.* = Field Store Files
 *     3.2.* = Block Store Files
 *     3.3.* = View Store Files
 * 
 * 4.<file>.<errnum> = Common / Actions
 *     4.1.* = WebsocketAction
 *     4.2.* = RestAction
 *     4.3.* = GetWhatsNew
 * 
 * 5.<file>.<errnum> = Common / Utilities
 *     5.1.* = Websocket
 */

const ERROR_LOOKUP: TypedMap<ClientError> = {
    // Website / Login
    '1.1.1':  { dismissAfterMillis: 4000, clientTemplate: "Log-in failed: %s" },
    '1.1.2':  { dismissAfterMillis: 5000, clientTemplate: "An unknown error has occurred: %s" },
    // Website / CreateAccount
    '1.2.1':  { dismissAfterMillis: 5000, clientTemplate: "An unknown error has occurred: %s" },
    '1.2.2':  { dismissAfterMillis: 5000, clientTemplate: "Password and password confirmation fields do not match." },
    '1.2.3':  { dismissAfterMillis: 5000, clientTemplate: "Account creation failed: %s" },
    '1.2.4':  { dismissAfterMillis: 5000, clientTemplate: "Password cannot be blank." },
    '1.2.5':  { dismissAfterMillis: 5000, clientTemplate: "You must accept the terms of use before creating an account." },
    // Website / Projects
    '1.3.1':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred receiving board data: %s" },
    '1.3.2':  { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred. Please refresh and try again." },
    '1.3.3':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred fetching project list: %s" },
    '1.3.4':  { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred. Please refresh and try again." },
    '1.3.5':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred saving project configuration: %s" },
    '1.3.6':  { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred when leaving the project. Please refresh and try again." },
    '1.3.7':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred when leaving the project: %s" },
    '1.3.8':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred saving board configuration: %s" },
    '1.3.9':  { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred when leaving the board. Please refresh and try again." },
    '1.3.10': { dismissAfterMillis: 0,    clientTemplate: "An error occurred when leaving the board: %s" },
    '1.3.11': { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred when hiding the board or project. Please refresh and try again." },
    '1.3.12': { dismissAfterMillis: 0,    clientTemplate: "An error occurred when hiding the board or project: %s" },
    '1.3.13': { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred when joining the board or project. Please refresh and try again." },
    '1.3.14': { dismissAfterMillis: 0,    clientTemplate: "An error occurred when joining the board or project: %s" },
    '1.3.15': { dismissAfterMillis: 0,    clientTemplate: "An error occurred creating the board: %s" },
    '1.3.16': { dismissAfterMillis: 0,    clientTemplate: "An error occurred fetching project list: %s" },
    '1.3.17': { dismissAfterMillis: 0,    clientTemplate: "An error occurred fetching your projects. Try refreshing the page, and if this error persists, try logging out and back in." },
    '1.3.18': { dismissAfterMillis: 0,    clientTemplate: "Project creation failed: %s" },
    '1.3.19': { dismissAfterMillis: 0,    clientTemplate: "An error occurred fetching project list: %s" },
    '1.3.20': { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred. Please refresh and try again." },
    '1.3.21': { dismissAfterMillis: 0,    clientTemplate: "An error occurred fetching your plan data: %s" },
    '1.3.22': { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred when deleting the board. Please refresh and try again." },
    '1.3.23': { dismissAfterMillis: 0,    clientTemplate: "An error occurred when deleting the board: %s" },
    '1.3.24': { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred when deleting the project. Please refresh and try again." },
    '1.3.25': { dismissAfterMillis: 0,    clientTemplate: "An error occurred when deleting the project: %s" },
    '1.3.26': { dismissAfterMillis: 3000, clientTemplate: "Board name cannot be blank." },
    '1.3.27': { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred receiving board templates from the server: %s" },
    // Website / Logout
    '1.4.1':  { dismissAfterMillis: 0,     clientTemplate: "An unexpected error occurred logging out: %s" },
    // Website / Account
    '1.5.1':  { dismissAfterMillis: 5000,  clientTemplate: "Invalid email address format." },
    // No longer used:
    // '1.5.2':  { dismissAfterMillis: 5000,  clientTemplate: "User is already a member of your plan." },
    '1.5.3':  { dismissAfterMillis: 5000,  clientTemplate: "Your plan is limited to only 8 members." },
    '1.5.4':  { dismissAfterMillis: 0,     clientTemplate: "An error occurred when saving your user data: %s" },
    '1.5.5':  { dismissAfterMillis: 5000,  clientTemplate: "An unexpected error occurred. Please refresh your browser and try again." },
    '1.5.6':  { dismissAfterMillis: 6000,  clientTemplate: "An error occurred loading your subscription: %s" },
    '1.5.7':  { dismissAfterMillis: 6000,  clientTemplate: "An unexpected error occurred. Please refresh your browser and try again." },
    '1.5.8':  { dismissAfterMillis: 5000,  clientTemplate: "An unexpected error occurred. Please refresh your browser and try again." },
    '1.5.9':  { dismissAfterMillis: 0,     clientTemplate: "An error occurred when updating your subscription: %s" },
    '1.5.10': { dismissAfterMillis: 0,     clientTemplate: "An unexpected error occurred when displaying your subscription. Try refreshing the page, and if the problem persists, reach out to customer support." },
    '1.5.11': { dismissAfterMillis: 0,     clientTemplate: "An unexpected error occurred when displaying your subscription. Try refreshing the page, and if the problem persists, reach out to customer support." },
    '1.5.12': { dismissAfterMillis: 0,     clientTemplate: "An unexpected error occurred when removing your plan member. Try refreshing the page, and if the problem persists, reach out to customer support." },
    '1.5.13': { dismissAfterMillis: 5000,  clientTemplate: "An unexpected error occurred. Please refresh your browser and try again." },
    '1.5.14': { dismissAfterMillis: 0,     clientTemplate: "A valid, default payment method is required." },
    '1.5.15': { dismissAfterMillis: 0,     clientTemplate: "An error occurred when fetching your exact cost: %s" },
    '1.5.16': { dismissAfterMillis: 0,     clientTemplate: "An error occurred when cancelling your subscription: %s" },
    '1.5.17': { dismissAfterMillis: 4000,  clientTemplate: "Password verification failed: %s" },
    '1.5.18': { dismissAfterMillis: 0,     clientTemplate: "An error occurred when resuming your subscription: %s" },
    '1.5.19': { dismissAfterMillis: 0,     clientTemplate: "An error occurred adding your payment method: %s" },
    '1.5.20': { dismissAfterMillis: 0,     clientTemplate: "An error occurred adding your payment method: %s" },
    '1.5.21': { dismissAfterMillis: 0,     clientTemplate: "An error occurred generating your invoice: %s" },
    '1.5.22': { dismissAfterMillis: 0,     clientTemplate: "An error occurred loading your payment methods: %s" },
    '1.5.23': { dismissAfterMillis: 0,     clientTemplate: "An unexpected error occurred loading your payment methods. Please refresh your browser and try again." },
    // Website / Forgot Password
    '1.6.1':  { dismissAfterMillis: 0,     clientTemplate: "An error occurred when processing your request: %s" },
    '1.6.2':  { dismissAfterMillis: 5000,  clientTemplate: "Invalid email address format." },
    // Website / Reset Password
    '1.7.1':  { dismissAfterMillis: 5000, clientTemplate: "Password and password confirmation fields do not match." },
    '1.7.2':  { dismissAfterMillis: 5000, clientTemplate: "New password cannot be blank." },
    '1.7.3':  { dismissAfterMillis: 0,    clientTemplate: "%s" },
    // Website / Give Feedback
    '1.8.1':  { dismissAfterMillis: 5000, clientTemplate: "Feedback cannot be empty." },
    '1.8.2':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred when submitting your feedback: %s" },
    // Website / Changelog
    '1.9.1':  { dismissAfterMillis: 5000, clientTemplate: "An error occurred fetching the release notes: %s" },
    // Website / Admin
    '1.10.1':  { dismissAfterMillis: 5000, clientTemplate: "An error occurred during authentication: %s" },
    '1.10.2':  { dismissAfterMillis: 5000, clientTemplate: "An error occurred updating the MotD: %s" },
    '1.10.3':  { dismissAfterMillis: 5000, clientTemplate: "An error occurred stopping an app server: %s" },
    '1.10.4':  { dismissAfterMillis: 5000, clientTemplate: "An error occurred posting an outage: %s" },

    // Application / <root application>
    '2.1.1': { dismissAfterMillis: 0,     clientTemplate: "An error occurred loading your project and board: %s" },
    '2.1.2': { dismissAfterMillis: 0,     clientTemplate: "An error occurred loading your project and board. Try refreshing the page, and if this error persists, try logging out and back in." },
    // Application / ViewSelector
    '2.2.1': { dismissAfterMillis: 0,     clientTemplate: "An unexpected error occurred loading your view. Please refresh your browser and try again." },

    // Store / Field Store Files
    '3.1.1': { dismissAfterMillis: 0, clientTemplate: "An unexpected error occurred updating some field values." },
    // Store / Block Store Files
    '3.2.1': { dismissAfterMillis: 0, clientTemplate: "An unexpected error occurred moving your block. Try refreshing the page, and if this error persists, reach out to our support team at support@moonwafer.io" },
    // Store / View Store Files
    '3.3.1': { dismissAfterMillis: 5000, clientTemplate: "View name cannot be blank." },
    '3.3.2': { dismissAfterMillis: 5000, clientTemplate: "Must choose a field for creating the columns." },

    // Common Actions / WebsocketAction
    '4.1.1':  { dismissAfterMillis: 0,    clientTemplate: "An unexpected error occurred. Please refresh your browser and try again." },
    '4.1.2':  { dismissAfterMillis: 0,    clientTemplate: "Feature not currently available in the demo. This was a miss on our side - let us know you saw this message, and we'll add it in!" },
    '4.1.3':  { dismissAfterMillis: 6000, clientTemplate: "An error occurred deleting blocks: %s" },
    '4.1.4':  { dismissAfterMillis: 6000, clientTemplate: "An error occurred setting the parent block: %s" },
    '4.1.5':  { dismissAfterMillis: 6000, clientTemplate: "An error occurred setting new field definitions: %s" },
    '4.1.6':  { dismissAfterMillis: 6000, clientTemplate: "An error occurred setting new classification definitions: %s" },
    '4.1.7':  { dismissAfterMillis: 6000, clientTemplate: "An error occurred setting the field's value: %s" },
    '4.1.8':  { dismissAfterMillis: 6000, clientTemplate: "An error occurred setting the block's classification: %s" },
    '4.1.9':  { dismissAfterMillis: 6000, clientTemplate: "An error occurred fetching the board data: %s" },
    '4.1.10': { dismissAfterMillis: 6000, clientTemplate: "An error occurred moving the block(s): %s" },
    '4.1.11': { dismissAfterMillis: 6000, clientTemplate: "An error occurred updating the block's summary: %s" },
    '4.1.12': { dismissAfterMillis: 6000, clientTemplate: "An error occurred creating a new block: %s" },
    '4.1.13': { dismissAfterMillis: 0,    clientTemplate: "Failed to load demo data: %s" },
    '4.1.14': { dismissAfterMillis: 6000, clientTemplate: "An error occurred saving the view: %s" },
    '4.1.15': { dismissAfterMillis: 6000, clientTemplate: "An error occurred loading the view: %s" },
    '4.1.16': { dismissAfterMillis: 6000, clientTemplate: "An error occurred deleting the view: %s" },
    '4.1.17': { dismissAfterMillis: 6000, clientTemplate: "An error occurred changing the block's priority: %s" },
    // Common Actions / RestAction
    '4.2.1': { dismissAfterMillis: 0, clientTemplate: "An unknown error has occurred: %s" },
    // Common Actions / GetWhatsNew
    '4.3.1': { dismissAfterMillis: 0, clientTemplate: "An error occurred fetching the latest release notes: %s" },

    // Common Utilities / Websocket
    '5.1.1':  { dismissAfterMillis: 0, clientTemplate: "An unexpected error occurred. Please refresh your browser and try again." },
    '5.1.2':  { dismissAfterMillis: 0, clientTemplate: "An unexpected error occurred. Please refresh your browser and try again." },
}