<template>
    <div class="mw-passwordconfirmation">
        <p>Please enter your current password to continue.</p>

        <div class="mw-password-input">
            <span>Current Password:</span>
            <eic-textbox ref="passwordInput"
                mw-type="password"
                v-model="currentPassword"
                v-on:keyup.enter="validatePassword"></eic-textbox>
        </div>

        <div class="mw-cancel-confirm">
            <span v-on:click="$emit('mw-cancel', $event)">Cancel</span>
            <button class="primary pink" v-on:click="validatePassword">Confirm</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

import * as ErrorLogger from '../utilities/ErrorLogger';
import { useGeneralStore } from "../store/GeneralStore";

// TODO-const : Re-enable all the actions
// import { VerifyPasswordRequest } from "../common/actions/RestActions/VerifyPassword";

export default defineComponent({
    props: {},
    setup(props, context) {
        let currentPassword = ref('');
        let passwordInput = ref(null);

        let generalStore = useGeneralStore();
        let userData = generalStore.userData();

        onMounted(() => {
            (passwordInput.value as any).$el.getElementsByTagName('input')[0].focus();
        });

        return {
            passwordInput,
            currentPassword,
            validatePassword: () => {
                // TODO-const : Re-enable all the actions
                // new VerifyPasswordRequest(userData.value.email, currentPassword.value)
                //     .send(({data}) => {
                //         if (data.statusCode === 0) {
                //             context.emit('mw-password-confirmed');
                //         } else {
                //             ErrorLogger.showError('1.5.17', [data.errorMessage]);
                //         }
                //     });
            }
        }
    }
});
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-passwordconfirmation {
    background: vars.$gray-very-dark;
    border-radius: vars.$dialog-section-radius;
    padding: 20px 35px;

    p {
        margin: 0;
        padding: 0;
    }

    .mw-password-input {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
    }

    .mw-cancel-confirm {
        text-align: right;
        span {
            margin-right: 10px;
            color: vars.$gray-light;
            cursor: pointer;
            &:hover { color: vars.$gray-very-light; }
        }
    }
}

</style>