
import { ArrayUtils } from "constellation-common/utilities";
import { Block, CopyData, DEFAULT_BLOCK_HEIGHT, DEFAULT_BLOCK_WIDTH, TypedMap, verifyCopyData } from "constellation-common/datatypes";

import { useStore } from "../store/store";
import { v4 as uuidv4 } from 'uuid';
import { E43, showError } from "../ErrorLogger";
import { PasteDataAction } from "../actions/board-actions/PasteData";

export function useCopyPaste() {

    const store = useStore();
    const canPaste = !store.getters.isCurrentBoardRemote || !!store.getters.currentProjectCapabilities.bulkCreateBlocks;

    return {
        getCopyString: (selectedBlocks: Block[]) => {
            // Prep our lookup maps
            const classifications = store.getters.classifications;
            const fields = store.getters.fields;
            const pvs = store.getters.possibleValues;
            const blocks = store.getters.visibleBlocks;

            // Collect the classification / field / possibleValue definitions that we want to copy.
            const classificationIdsToKeep = ArrayUtils.unique(selectedBlocks.flatMap(b => b.classificationIds));
            const classificationsToKeep = classificationIdsToKeep.map((cid) => classifications[cid]);
            const fieldsToKeep = ArrayUtils.unique([
                ...classificationsToKeep.flatMap(c => c.fieldIds),
                ...selectedBlocks.flatMap(b => b.fieldIds)
            ]).map(fid => fields[fid]);
            const pvsToKeep = fieldsToKeep.flatMap(f => f.possibleValueIds?.map(pvid => pvs[pvid]) ?? []);

            // Clean up any block references, mainly removing/updating parents if the parent blocks weren't copied.
            const copiedBlocks = JSON.parse(JSON.stringify(selectedBlocks)) as Block[];
            fixParents(copiedBlocks, blocks);

            // Package it all up into an object.
            const clipData: CopyData = {
                classifications: classificationsToKeep,
                fields: fieldsToKeep,
                possibleValues: pvsToKeep,
                blocks: copiedBlocks,
            }

            // Properly set the blocks' scales (since they might not be nested as deeply anymore)
            rescaleBlocks(clipData, store.getters.blockScales);

            return JSON.stringify(clipData);
        },

        paste: (copyString: string, location: {x: number, y: number}) => {
            // Can only paste if the server supports it.
            if (!canPaste) { showError(E43); return; }

            // Parse the pasted data
            let data: CopyData;
            if (verifyCopyData(copyString)) {
                data = JSON.parse(copyString);
            } else {
                data = {
                    classifications: [],
                    fields: [],
                    possibleValues: [],
                    blocks: [new Block(
                        uuidv4(),
                        { x: 0, y: 0, width: DEFAULT_BLOCK_WIDTH, height: DEFAULT_BLOCK_HEIGHT },
                        undefined,
                        { type: 'text', data: { text: copyString } }
                    )]
                };
            }

            // Generate new IDs for the blocks, updating internal references.
            regenerateBlockIds(data);

            // Clear the "isSelected" state - we'll be selecting all the pasted blocks at the end.
            data.blocks.forEach(b => b.isSelected = false);

            // Update the positions to make them centered
            centerAround(data, location);

            // (Classifications, fields, and PVs are all updated on the server at the persistence layer.)

            new PasteDataAction(data).submit();
        }
    };
}

function fixParents(copiedBlocks: Block[], blockLookup: TypedMap<Block>) {
    for (const block of copiedBlocks) {
        // "Walk up" the parents until we either get to a root node, or a block that *was* copied.
        let newParentId: string | undefined = block.parentBlockId;
        while (newParentId && !copiedBlocks.some(b2 => b2.id === newParentId)) {
            newParentId = blockLookup[newParentId].parentBlockId;
        }
        block.parentBlockId = newParentId;
    }
}

function regenerateBlockIds(data: CopyData) {
    /** Original block IDs mapped to new IDs */
    const idMap: Map<string, string> = new Map();

    // Generate new block IDs
    data.blocks.forEach(b => {
        const newId = uuidv4();
        idMap.set(b.id, newId);
        b.id = newId;
    });

    // Update any parents - clearing out any that weren't copied.
    data.blocks.forEach(b => {
        if (!b.parentBlockId) return;
        if (idMap.has(b.parentBlockId)) {
            b.parentBlockId = idMap.get(b.parentBlockId);
        } else {
            b.parentBlockId = undefined;
        }
    });
}

function centerAround(data: CopyData, centerpoint: {x: number, y: number}) {
    // Calculate the average centerpoint of the copied data.
    const xySums = data.blocks.reduce((acc, b) => ({
        xSum: acc.xSum + b.location.x + b.location.width/2,
        ySum: acc.ySum + b.location.y + b.location.height/2,
    }), { xSum: 0, ySum: 0 });
    const avgCenterpoint = {
        x: xySums.xSum / data.blocks.length,
        y: xySums.ySum / data.blocks.length
    };

    // Shift all the x/y locations by the delta in centerpoints
    const shift = {
        x: centerpoint.x - avgCenterpoint.x,
        y: centerpoint.y - avgCenterpoint.y,
    };
    data.blocks.forEach(b => {
        b.location.x += shift.x;
        b.location.y += shift.y;
    });
}

function rescaleBlocks(data: CopyData, oldScales: Record<string, number>) {
    const blockLookup = ArrayUtils.mapify(data.blocks, 'id');

    // TODO-ben: Scale : REMOVE THIS in favor of utilities..?

    // 1) Figure out the new scales of each block
    const newScales = data.blocks.reduce((acc, b) => {
        let scale = 1;
        let block = b;
        while (block.parentBlockId != undefined && block.parentBlockId in blockLookup) {
            scale *= 1.5;
            block = blockLookup[block.parentBlockId];
        }
        acc[b.id] = scale;
        return acc;
    }, {} as Record<string, number>);

    // 2) Do the rescaling
    data.blocks.forEach(b => {
        const oldScale = oldScales[b.id] ?? 1;
        const newScale = newScales[b.id] ?? 1;
        b.location.x      *= oldScale / newScale;
        b.location.y      *= oldScale / newScale;
        b.location.width  *= oldScale / newScale;
        b.location.height *= oldScale / newScale;
    });
}