<template>
    <div class="mw-givefeedback">
        <!-- "Give Feedback" form -->
        <div class="mw-gf-form">
            <p>We love feedback! Submit the below form to let us know your thoughts - both good and bad. If you include your email, we may reach out if we have any questions.</p>
            <p>Alternatively, you can always send us an email at: <a href="mailto:support@moonwafer.io">support@moonwafer.io</a></p>

            <div class="mw-gf-form-component">
                <label for="feedback-name-input">Name</label>
                <eic-textbox mw-id="feedback-name-input" v-model="name" eic-placeholder="(optional)"></eic-textbox>
            </div>

            <div class="mw-gf-form-component">
                <label for="feedback-email-input">Email</label>
                <button      v-if="userSignedIn && !insertedEmail" class="mw-gf-insert-email gray secondary" v-on:click="insertEmail">Include my email</button>
                <eic-textbox mw-id="feedback-email-input" v-else v-model="email" eic-placeholder="(optional)"></eic-textbox>
            </div>

            <div class="mw-gf-form-component">
                <label for="feedback-feedback-input">Feedback ({{ feedback.length }}/2000)</label>
                <textarea mw-id="feedback-feedback-input" v-model="feedback" rows="10" maxlength="2000"></textarea>
            </div>

            <div class="mw-gf-button-container">
                <button class="primary pink" v-on:click="submitForm">Submit</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { useVueNotify } from "mw-vue-notify";

import { useEmitter } from "../composables/Emitter";
import { useGeneralStore } from "../store/GeneralStore";
import * as ErrorLogger from '../utilities/ErrorLogger';

// TODO-const : Re-enable all the actions
// import { GiveFeedbackRequest } from '../actions/RestActions/GiveFeedback';
import { isBlank } from "../utilities/StringUtils";

export default defineComponent({
    props: {},
    setup(props, context) {
        let emitter = useEmitter();
        const generalStore = useGeneralStore();
        const userData = generalStore.userData();

        const name = ref('');
        const email = ref('');
        const feedback = ref('');

        const userSignedIn = computed(() => userData.value.email);
        const insertedEmail = ref(false);
        const insertEmail = () => {
            email.value = userData.value.email || '';
            insertedEmail.value = true;
        }

        const submitForm = () => {
            if (isBlank(feedback.value)) {
                ErrorLogger.showError('1.8.1');
            } else {
                // TODO-const : Re-enable all the actions
                // new GiveFeedbackRequest(name.value, email.value, feedback.value).send(({data}) => {
                //     if (data.statusCode === 0) {
                //         useVueNotify().showNotification({
                //             cssClasses: ['mw-notification-success'],
                //             dismissAfterMillis: 4000,
                //             data: { message: 'Thank you for your feedback!' },
                //         });

                //         // Reset everything to initial values
                //         name.value = '';
                //         email.value = '';
                //         feedback.value = '';
                //         insertedEmail.value = false;

                //         context.emit('close-panel');
                //     } else {
                //         ErrorLogger.showError('1.8.2', [data.errorMessage]);
                //     }
                // });
            }
        }

        onMounted(() => {
            emitter.register('gf-give-feedback', 'give-feedback', (content: string) => {
                feedback.value = content;
            });
        });
        onUnmounted(() => {
            emitter.deregister('gf-give-feedback');
        });

        return {
            name, email, feedback,

            userSignedIn, insertedEmail, insertEmail,

            submitForm,
        };
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-givefeedback {
    $form-width: 300px;

    color: vars.$gray-light;

    .mw-gf-form, .mw-gf-button {
        width: $form-width;
        padding: 10px 20px;
    }

    .mw-gf-form {

        a { color: vars.$pink-medium; }
        a:hover { color: vars.$gray-very-light; }

        .mw-gf-form-component {
            margin-bottom: 15px;

            label {
                transition: color 0.2s;
                display: block;
                margin-bottom: 5px;
                color: vars.$gray-medium;
            }
            &:focus-within { label { color: vars.$gray-very-light; } }
        }

        .mw-gf-insert-email {
            width: 100%;
        }

        textarea {
            background: transparent;
            color: vars.$gray-very-light;
            width: 100%;
            font-size: 1.0rem;
        }

        .mw-gf-button-container {
            text-align: right;
        }
    }

}

</style>
