
import { Action } from "../Action";
import { SetUserSettingsResponse, UserSettings } from 'constellation-common';

export class SetUserSettingsAction extends Action {

    private config: Partial<UserSettings>;

    constructor(config: Partial<UserSettings>) {
        super();
        this.config = config;
    }

    submit(): void {
        // This request is local-only. User settings are only stored locally.
        window.config.setUserSettings(this.config)
            .then((resp) => this.processResponse(resp));
    }

    processResponse(resp: SetUserSettingsResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
