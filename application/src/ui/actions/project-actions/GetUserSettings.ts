
import { GetUserSettingsResponse } from 'constellation-common/datatypes';
import { useStore } from "../../store/store";
import { Action } from "../Action";

export class GetUserSettingsAction extends Action {

    constructor() {
        super();
    }

    submit(): void {
        // This request never gets sent to the server - user settings are stored locally
        window.config.getUserSettings()
            .then((resp) => this.processResponse(resp));
    }

    processResponse(resp: GetUserSettingsResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            const store = useStore();

            store.dispatch('setPanSpeed', resp.panSpeed);
            store.dispatch('setZoomSpeed', resp.zoomSpeed);
            store.dispatch('switchCtrlShiftForSelection', resp.switchCtrlShiftForSelection);
            store.dispatch('useShiftToZoom', resp.useShiftToZoom);

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
