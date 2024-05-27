
import { ArrayUtils } from "constellation-common/utilities";
import { useStore } from "../store/store";
import { Block } from "constellation-common/datatypes";

export function useCopyPaste() {

    const store = useStore();

    return {
        getCopyString: (selectedBlocks: Block[]) => {
            const classifications = store.getters.classifications;
            const fields = store.getters.fields;
            const pvs = store.getters.possibleValues;

            const classificationIdsToKeep = ArrayUtils.unique(selectedBlocks.flatMap(b => b.classificationIds));
            const classificationsToKeep = classificationIdsToKeep.map((cid) => classifications[cid]);
            const fieldsToKeep = ArrayUtils.unique([
                ...classificationsToKeep.flatMap(c => c.fieldIds),
                ...selectedBlocks.flatMap(b => b.fieldIds)
            ]).map(fid => fields[fid]);

            const pvsToKeep = fieldsToKeep.flatMap(f => f.possibleValueIds?.map(pvid => pvs[pvid]) ?? []);

            const clipData = {
                classifications: classificationsToKeep,
                fields: fieldsToKeep,
                possibleValues: pvsToKeep,
                blocks: selectedBlocks,
            }

            return JSON.stringify(clipData);
        },
        // TODO-ben: Will probably want to rename this...
        paste: (copyString: string) => {
            // Validate data before pasting - make sure it's an array of block data.
            // TODO-ben

            // Otherwise ... just paste as a new block's summary..?
            // TODO-ben

            // Generate new IDs for the blocks, updating internal references.
            // TODO-ben

            // Clear the "isSelected" state - we'll be selecting all the pasted blocks at the end.
            // TODO-ben

            // Clear the width/height, and update the positions to make them centered
            // TODO-ben

            // If a classification exists with all the block's field names (and types), then turn on that classification and set the values for it.
            // Otherwise, create a new classification (with a new ID!) with the appropriate data.
            // For fieldIds, just regenerate new IDs.
            // TODO-ben

            // Add them to our data!
            // TODO-ben

            // Select the new blocks.
            // TODO-ben
        }
    };
}