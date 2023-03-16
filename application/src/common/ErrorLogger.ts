
import { useVueNotify, VueNotify } from 'mw-vue-notify';

let mwVueNotify: VueNotify;

export function initialize() {
    mwVueNotify = useVueNotify();
}

export function showError(err: ClientError, replacements?: string[]) {
    mwVueNotify.showNotification({
        cssClasses: ['mw-notification-failure'],
        dismissAfterMillis: err.dismissAfterMillis,
        data: { message: `${performReplacements(err.clientTemplate, replacements)} (Code ${err.code})` }
    });
}

function performReplacements(stringTemplate: string, replacements?: string[]): string {
    let finalString = stringTemplate;
    if (Array.isArray(replacements)) {
        replacements.forEach(r => finalString = finalString.replace(/%s/, r));
    }
    return finalString;
}

type ClientError = {
    code: string,
    dismissAfterMillis: number,
    clientTemplate: string,
}

export const GENERIC_RESTART = "Try restarting your app, and if that doesn't resolve the issue, reach out to ben@zenittini.dev for support.";

// Commented-out errors have been obsoleted
export const E0: ClientError = { code: 'C:0', dismissAfterMillis: 0, clientTemplate: "An unexpected error occurred. %s" };
export const E1: ClientError = { code: 'C:1', dismissAfterMillis: 0, clientTemplate: "An error occurred receiving project data. %s" };
export const E2: ClientError = { code: 'C:2', dismissAfterMillis: 0, clientTemplate: "An error occurred receiving project data. %s" };
export const E3: ClientError = { code: 'C:3', dismissAfterMillis: 0, clientTemplate: "An error occurred receiving board templates from server. %s" };
export const E4: ClientError = { code: 'C:4', dismissAfterMillis: 0, clientTemplate: "An error occurred creating a new board. %s" };
export const E5: ClientError = { code: 'C:5', dismissAfterMillis: 0, clientTemplate: "%s cannot be blank." };
export const E6: ClientError = { code: 'C:6', dismissAfterMillis: 0, clientTemplate: "An error occurred deleting the board. %s" };
export const E7: ClientError = { code: 'C:7', dismissAfterMillis: 0, clientTemplate: "An error occurred editing the board configuration. %s" };