
import { computed, ref, Ref, ComputedRef, SetupContext, onMounted, onUnmounted } from 'vue';

import { useStore } from '../store/store';
import { useWindowEvents } from './WindowEvents';
import { useEmitter } from './Emitter';
import { Entity } from '../store/Types/EntityDataTypes';

// TODO-const : Re-enable all the actions
// import { DeleteEntities } from '../actions/WebsocketActions/DeleteEntities';

export function useView(visibleBlocks: ComputedRef<Entity[]>, context: SetupContext<Record<string, any>>) {
    const store = useStore();
    const windowEvents = useWindowEvents();

    const eventEmitter = useEmitter();

    let selectedBlocks: Ref<Entity[]> = ref([]);
    let selectedBlockIds = computed(() => selectedBlocks.value.map(block => block.id));

    let selectedButFilteredBlocks = computed(() => selectedBlocks.value.filter(sb => !visibleBlocks.value.some(b => sb.id === b.id)));

    onMounted(() => {
        windowEvents.register('viewBlockDeletion', 'keydown', (keyboardEvent: KeyboardEvent) => {
            if (selectedBlockIds.value.length > 0 && (keyboardEvent.code === "Delete" || keyboardEvent.code === "Backspace")) {
                // Certain browsers (firefox) use the "backspace" key to go back a page. We don't want that behavior.
                keyboardEvent.preventDefault();

                let deletedBlockIds = selectedBlockIds.value;
                selectedBlocks.value = [];

                // Update our local store. (This assumes the server accepts the request)
                store.dispatch("deleteEntities", deletedBlockIds);

                // Send the update request to the server
                // TODO-const : Re-enable all the actions
                // new DeleteEntities(
                //     store.state.generalData.currentProjectBoard!.boardId,
                //     deletedBlockIds,
                // ).send();

                return; // Processed a keystroke, so exit.
            }
        });
    });
    onUnmounted(() => {
        windowEvents.deregisterAll();
    });

    return {

        // ===============
        // Block Selection
        // ---------------

        selectedBlocks,
        selectedBlockIds,
        selectedButFilteredBlocks,
        toggleSelection: (event: MouseEvent, block: Entity) => {
            if (event.shiftKey) {
                // If shift is being held, toggle the block's selection
                let index = selectedBlocks.value.findIndex((b) => b.id === block.id);
                if (index >= 0) {
                    selectedBlocks.value.splice(index, 1);
                } else {
                    selectedBlocks.value.push(block);
                }
            } else {
                // Otherwise, deselect everything, and select this one.
                // Unless it's already the only one selected, in which case toggle.
                if (selectedBlocks.value.length === 1 && selectedBlocks.value[0] === block) {
                    selectedBlocks.value = [];
                } else {
                    selectedBlocks.value = [block];
                }
            }
        },
        selectAll: () => {
            selectedBlocks.value = [...visibleBlocks.value, ...selectedButFilteredBlocks.value];
        },
        selectNone: () => {
            selectedBlocks.value = [];
        },


        // =======
        // Getters
        // -------

        getBlockStyle: (block: Entity) => {
            return store.getters.getCssStyles(block, 1);
        },
        getBreadcrumbs: (blockId: string) => {
            return store.getters.getParentChain(blockId)
                .map(id => store.state.entityData.entities[id].content.data.text)
                .join(' > ');
        },


        // =======
        // Actions
        // -------

        goToBlock: (blockId: string) => {
            store.dispatch("selectEntity", {entityId: blockId, clearCurrentSelection: true});
            context.emit('mw-close-view');
            setTimeout(() => eventEmitter.emit('goToBlock', blockId), 100);
        },
    };
}