
import mitt from 'mitt';
import { TypedMap } from 'constellation-common';

export type EventRegistration = {
    type: string,
    handler: (event: any) => void,
}

const emitter = mitt();

// ID to EventRegistration mapping
let registrations: TypedMap<EventRegistration> = {};

export function useEmitter() {

    /** ID is used to deregister later on, and must be unique. Type does not need to be unique. All event handlers that share a type will be called. */
    function register(id: string, type: string, handler: (event: any) => void) {
        registrations[id] = { type, handler };
        emitter.on(type, handler);
    }

    function deregister(id: string) {
        let reg = registrations[id];
        emitter.off(reg.type, reg.handler);
        delete registrations[id];
    }

    return {
        emitter,
        emit: emitter.emit,
        register,
        deregister
    };
}