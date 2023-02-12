
import { TypedMap } from "../../../../common/DataTypes/GenericDataTypes";


export type EventRegistration = {
    type: string,
    handler: (event?: any) => void,
}

export function useWindowEvents() {

    // ID to EventRegistration mapping
    let registrations: TypedMap<EventRegistration> = {};

    function register(id: string, type: string, handler: (event?: any) => void, wrapHandler: boolean = true) {
        let wrappedHandler = (event?: any) => {
            if (wrapHandler) {
                // Ignore all keystrokes on text inputs, etc.
                // It's more common to want this check, hence why it's here by default.
                if (document.activeElement && document.activeElement.tagName === "BODY") {
                    handler(event);
                }
            } else {
                handler(event);
            }
        }
        registrations[id] = {
            type,
            handler: wrappedHandler,
        };
        window.addEventListener(type, wrappedHandler);
    }

    function deregister(id: string) {
        let reg = registrations[id];
        window.removeEventListener(reg.type, reg.handler);
        delete registrations[id];
    }

    function deregisterAll() {
        for (let reg of Object.values(registrations)) {
            window.removeEventListener(reg.type, reg.handler);
        }
        registrations = {};
    }

    return {
        register,
        deregister,
        deregisterAll,
    };
}