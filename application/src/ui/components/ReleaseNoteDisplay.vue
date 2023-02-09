<template>
    <div class="mw-releasenotedisplay">
        <div v-if="mwReleases.length > 0">
            <h1>We Made Changes &#x1F389;</h1>

            <eic-lightswitch v-model="highlightsOnly" eic-true-label="Highlights Only" eic-false-label="All Changes"></eic-lightswitch>

            <div v-for="release of releaseNotes" v-bind:key="release.versionId">
                <div class="mw-hr"></div>

                <h2>{{ release.versionId }} <span class="release-date">(Released {{ release.releaseDate }})</span></h2>

                <eic-release-notes-formatted
                    v-bind:mw-notes="releaseNotes[release.versionId].notes"
                    v-bind:mw-highlights-only="highlightsOnly"></eic-release-notes-formatted>
            </div>
        </div>
        <p v-else class="no-changes">There have been no changes since your last visit.</p>

        <div class="mw-hr"></div>
        <p class="older-changes">To view older changes, check out our changelog: <router-link to="/changelog">https://spacia.moonwafer.io/changelog</router-link></p>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { TypedMap } from "../store/StoreTypes";

// TODO-const : Re-enable all the actions
// import { GetReleaseNote } from '../actions/RestActions/GetReleaseNote';

export default defineComponent({
    props: {
        mwReleases: Array
    },
    setup(props) {
        // Here's a big ol' lookup map caching all of the fetched notes
        type ReleaseNote = {versionId: string, releaseDate: string, notes: any};
        const releaseNotes: TypedMap<ReleaseNote> = reactive((props.mwReleases as {versionId: string, releaseDate: Date}[])
            .reduce((lookupMap, release) => {
                lookupMap[release.versionId] = {
                    versionId: release.versionId,
                    releaseDate: release.releaseDate.toLocaleDateString(),
                    notes: undefined,
                };
                return lookupMap;
            }, ({} as TypedMap<ReleaseNote>)));

        // Look up all of our notes
        Object.keys(releaseNotes).forEach(versionId => {
            // TODO-const : Re-enable all the actions
            // new GetReleaseNote(versionId).send(({data}) => {
            //     releaseNotes[versionId].notes = data;
            // });
        })

        const highlightsOnly = ref(true);

        return {
            highlightsOnly,
            releaseNotes,
        }
    },
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-releasenotedisplay {
    padding: 40px 50px;
    max-height: 80vh;
    width: 500px;
    overflow-y: auto;

    h1 { margin-top: 0 }
    ul { margin: 0 }

    .release-date {
        font-size: 0.8em;
        color: vars.$gray4;
    }

    .no-changes {
        color: vars.$gray-very-light;
        text-align: center;
    }
    .older-changes {
        margin-top: 20px;
        margin-bottom: 0;

        color: vars.$gray4;
        text-align: center;
    }
}

</style>
