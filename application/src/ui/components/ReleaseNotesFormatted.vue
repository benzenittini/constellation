<template>
    <div class="mw-releasenotesformatted">
        <div v-for="category of displayedCategories" v-bind:key="category.key">
            <template v-if="filtered(mwNotes?.[category.key]).length > 0">
                <h3>{{ category.title }}</h3>
                <ul>
                    <li v-for="note of filtered(mwNotes?.[category.key])" v-bind:key="note.id">
                        {{ note.text }}
                        <span v-if="note.reasoning && !note.showingReason"
                            v-on:click="note.showingReason = true"
                            class="explain-yourself">(more)</span>
                        <div v-else-if="note.reasoning" class="explanation">{{ note.reasoning }}</div>
                    </li>
                </ul>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        mwNotes: Object,
        mwHighlightsOnly: Boolean,
    },
    setup(props) {

        let filtered = (notes: any[]) => {
            if (!notes) return [];

            let results = notes;
            if (props.mwHighlightsOnly) {
                results = results.filter(n => n.highlight);
            }

            return results;
        }

        return {
            displayedCategories: [
                { key: 'features', title: 'Features' },
                { key: 'bugs', title: 'Bug Fixes' },
                { key: 'tweaks', title: 'Tweaks' },
            ],
            filtered,
        }
    },
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;
@use "../styles/mixins";

.mw-releasenotesformatted {

    color: vars.$gray-light;
    h3 { color: vars.$gray-very-light; }

    li { margin: 10px 0; }

    .explain-yourself {
        @include mixins.link;
    }
    .explanation {
        border-left: 5px solid vars.$gray-dark;
        margin: 5px 0 10px 10px;
        padding: 5px 10px;
    }
}

</style>
