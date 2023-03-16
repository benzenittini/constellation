
import { useVueNotify, VueNotify } from 'mw-vue-notify';
import { TypedMap } from '../../../common/DataTypes/GenericDataTypes';

let mwVueNotify: VueNotify;

export function initialize() {
    mwVueNotify = useVueNotify();
}

export function showError(code: string, replacements?: string[]) {
    let err = ERROR_LOOKUP[code];
    mwVueNotify.showNotification({
        cssClasses: ['mw-notification-failure'],
        dismissAfterMillis: err.dismissAfterMillis,
        data: { message: `${performReplacements(err.clientTemplate, replacements)} (Code ${code})` }
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
    dismissAfterMillis: number,
    clientTemplate: string,
}

export const GENERIC_RESTART = "Try restarting your app, and if that doesn't resolve the issue, reach out to ben@zenittini.dev for support.";
const ERROR_LOOKUP: TypedMap<ClientError> = {
    'C:1':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred receiving project data. %s" },
    'C:2':  { dismissAfterMillis: 0,    clientTemplate: "An error occurred receiving project data. %s" },
}