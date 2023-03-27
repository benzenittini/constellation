
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { BoardData, TemplateClassification } from '../DataTypes/BoardDataTypes';
import { BoundingBox, TypedMap } from '../DataTypes/GenericDataTypes';
import { Block, BlockContent, BlockIdAndPosition } from '../DataTypes/BlockDataTypes';
import { ChangedFieldValue, ChangedPVName, ClassificationDefinition, FieldDefinition, PossibleValueDefinition, getCompatibleFieldTypes } from '../DataTypes/FieldDataTypes';
import * as T from '../DataTypes/ActionDataTypes';
import * as ArrayUtils from '../utilities/ArrayUtils';

export class BoardDataPersistence {

    public sourceFile: string | undefined;

    private data: BoardData;

    private saveTimer: ReturnType<typeof setTimeout> | undefined = undefined;

    private reportSaveStatus: (status: boolean) => void;

    constructor(sourceFile: string | undefined = undefined, initialData: BoardData = BoardDataPersistence.getInitData(), reportSaveStatus: (status: boolean) => void = (s) => {}) {
        this.sourceFile = sourceFile;
        this.reportSaveStatus = reportSaveStatus;

        if (this.sourceFile) {
            // Get the file's data (or initialize the data if file is empty)
            let fileData: string;
            if (fs.existsSync(this.sourceFile)) {
                fileData = fs.readFileSync(this.sourceFile, 'utf8');
            } else {
                fileData = JSON.stringify(initialData);
            }
            this.data = JSON.parse(fileData);
            this.saveData(); // Save the initial state
        } else {
            this.data = initialData;
        }
    }

    /** This function should be called any time this.data is modified! */
    private scheduleSave() {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveData(), 3000);
        this.reportSaveStatus(false);
    }

    private saveData() {
        if (this.sourceFile) {
            fs.writeFileSync(this.sourceFile, JSON.stringify(this.data, null, 2));
            this.reportSaveStatus(true);
        }
    }

    static getInitData(templateClassifications?: TemplateClassification[]) {
        let classificationIds: string[] = [];
        let classifications: TypedMap<ClassificationDefinition> = {};
        let fields: TypedMap<FieldDefinition> = {};
        let possibleValues: TypedMap<PossibleValueDefinition> = {};

        if (templateClassifications) {
            // Process each classification, generating an ID and converting its fields and PVs to be references.
            for (let classification of templateClassifications) {

                // Process this classification's fields
                let fieldIds: string[] = [];
                for (let field of classification.fields) {

                    // Process this field's possible values
                    let pvIds: string[] = [];
                    for (let pv of field.possibleValues) {
                        let pvid = uuidv4();
                        pvIds.push(pvid);
                        possibleValues[pvid] = {
                            id: pvid,
                            name: pv.name,
                            style: pv.style,
                        };
                    }

                    // Build/save the field lookup
                    let fid = uuidv4();
                    fieldIds.push(fid);
                    fields[fid] = {
                        id: fid,
                        name: field.name,
                        type: field.type,
                        possibleValueIds: pvIds,
                        sourceType: field.sourceType,
                    };
                }

                // Build/save the classification lookup
                let cid = uuidv4();
                classificationIds.push(cid);
                classifications[cid] = {
                    id: cid,
                    name: classification.name,
                    fieldIds: fieldIds,
                }
            }
        }

        return {
            blocks: {},
            views: {},
            blockPriorities: [],
            classificationIds,
            classifications,
            fields,
            possibleValues,
        };
    }

    static getBoardTemplate(boardData: BoardData): TemplateClassification[] {
        return boardData.classificationIds.map(cid => ({
            name: boardData.classifications[cid].name,
            fields: boardData.classifications[cid].fieldIds.map(fid => ({
                name: boardData.fields[fid].name,
                type: boardData.fields[fid].type,
                sourceType: 'classification',
                possibleValues: boardData.fields[fid].possibleValueIds.map(pvid => ({
                    name: boardData.possibleValues[pvid].name,
                    style: boardData.possibleValues[pvid].style,
                })),
            })),
        }));
    }


    // =============
    // Miscellaneous
    // -------------

    async getBoardData(): Promise<BoardData> {
        return this.data;
    }


    // ==========
    // Block CRUD
    // ----------

    async createBlock(blockId: string, location: BoundingBox, parentBlockId: string | undefined): Promise<Block> {
        // If specified, make sure the parent block exists
        if (parentBlockId && this.data.blocks[parentBlockId] === undefined) {
            throw new T.ConstError(3,
                `Parent block does not exist. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'createBlock', 1),
                'Error in createBlock: Parent block does not exist.');
        }

        // Make sure there isn't a duplicate blockId
        if (this.data.blocks[blockId]) {
            throw new T.ConstError(4,
                `Block already exists. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'createBlock', 2),
                'Error in createBlock: Block ID already exists.');
        }

        // All good! Add and persist the block.
        let newBlock = new Block(blockId, location, parentBlockId);
        this.data.blocks[blockId] = newBlock;
        this.data.blockPriorities.push(blockId);

        this.scheduleSave();

        return newBlock;
    }

    async setBlockPositions(blockIdsAndPositions: BlockIdAndPosition[]): Promise<BlockIdAndPosition[]> {
        for (let {blockId, location} of blockIdsAndPositions) {
            this.data.blocks[blockId].location = location;
        }

        this.scheduleSave();

        return blockIdsAndPositions;
    }

    async deleteBlocks(blockIds: string[]): Promise<string[]> {
        // Get all the decendants (and depths) of the given blockId - needed to re-scale blocks later on.
        let originalDescendents = await this.getBlockDescendents(blockIds);
        let originalDepths      = await this.getBlockDepths(Array.from(originalDescendents));

        // Update the parent block IDs of all the deleted blocks' children.
        for (let block of Object.values(this.data.blocks)) {
            // Traverse up the chain of parentBlockIds until we arrive at one that either isn't deleted, or is undefined.
            // That'll be this block's new parent.
            let newParentId = block.parentBlockId;
            while (newParentId && blockIds.includes(newParentId)) {
                newParentId = this.data.blocks[newParentId].parentBlockId;
            }
            block.parentBlockId = newParentId;
        }

        // Remove the blocks from existence
        for (let blockId of blockIds) {
            delete this.data.blocks[blockId];
            let index = this.data.blockPriorities.indexOf(blockId);
            if (index !== -1) {
                this.data.blockPriorities.splice(index, 1);
            }
        }

        // Determine the new depth of each descendant, and update its size appropriately
        let newDescendents = Array.from(originalDescendents).filter(od => !blockIds.includes(od.id));
        let newDepths      = await this.getBlockDepths(Array.from(newDescendents));
        await this.adjustBlockSizes(originalDepths, newDepths);

        this.scheduleSave();

        return blockIds;
    }

    async setBlockParent(blockId: string, parentBlockId: string | undefined): Promise<void> {
        // Validation
        if (blockId === undefined) {
            throw new T.ConstError(3,
                `Requested block wasn't defined. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'setBlockParent', 1),
                "Error in setBlockParent: requested blockId cannot be undefined.");
        } else if (blockId !== undefined && !this.data.blocks[blockId]) {
            throw new T.ConstError(4,
                `Requested block wasn't found. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'setBlockParent', 2),
                "Error in setBlockParent: requested blockId doesn't exist.");
        } else if (parentBlockId !== undefined && !this.data.blocks[parentBlockId]) {
            throw new T.ConstError(5,
                `Requested parent block wasn't found. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'setBlockParent', 3),
                "Error in setBlockParent: requested parentBlockId doesn't exist.");
        }

        // Get all the decendants (and depths) of the given blockId
        let originalDescendents = await this.getBlockDescendents([blockId]);
        let originalDepths      = await this.getBlockDepths(Array.from(originalDescendents));

        // Update the hierarchy - first verify we don't have a circular reference by traversing up the hierarchy
        let currentBlockId: string | undefined = parentBlockId;
        while (currentBlockId !== undefined) {
            currentBlockId = this.data.blocks[currentBlockId].parentBlockId;
            // If we ever return to the original block, then we're caught in a loop. Abandon ship!
            if (currentBlockId === blockId) {
                throw new T.ConstError(6,
                    `A circular dependency was detected.`,
                    T.ConstError.getLineId('BoardDataPersistence', 'setBlockParent', 4),
                    "Error in setBlockParent: circular dependency detected!");
            }
        }
        this.data.blocks[blockId].parentBlockId = parentBlockId;

        // Determine the new depth of each descendant, and update its size appropriately
        let newDescendents = await this.getBlockDescendents([blockId]);
        let newDepths      = await this.getBlockDepths(Array.from(newDescendents));
        await this.adjustBlockSizes(originalDepths, newDepths);

        // The data's dirty!
        this.scheduleSave();
    }

    async getBlockDescendents(parentIds: string[]): Promise<Set<Block>> {
        // Short-circuit if able
        if (parentIds.length === 0) {
            return new Set<Block>();
        }

        // We only track each block's parentId, which is very inconvenient for finding descendents.
        // Let's build up a list of each block's children for convenience and (hopefully) efficiency.
        let blockChildren: TypedMap<string[]> = {}; // Parent Id --> Children Ids
        Object.values(this.data.blocks).forEach(b => {
            if (b.parentBlockId) {
                blockChildren[b.parentBlockId] ??= [];
                blockChildren[b.parentBlockId].push(b.id);
            }
        });

        // Fetch and return the Blocks
        let descendents = new Set<Block>();
        let blocksToCheck = [...parentIds]; // Copying to prevent modifying the passed-in parameter on the caller.
        for (let blockId of blocksToCheck) {
            descendents.add(this.data.blocks[blockId]);
            blockChildren[blockId]?.forEach(b => blocksToCheck.push(b));
        }
        return descendents;
    }

    async getBlockDepths(blocks: Block[]): Promise<TypedMap<number>> {
        let depths: TypedMap<number> = {};

        for (let block of blocks) {
            let depth = 1;
            let parentId = block.parentBlockId;
            while (parentId !== undefined) {
                depth++;
                parentId = this.data.blocks[parentId]?.parentBlockId;
            }
            depths[block.id] = depth;
        }

        return depths;
    }

    async adjustBlockSizes(originalDepths: TypedMap<number>, newDepths: TypedMap<number>): Promise<void> {
        // Build up a list of blockIdsAndPositions to update
        let blockIdsAndPositions: BlockIdAndPosition[] = [];
        for (let blockId in newDepths) {
            // For each layer deep, we want to multiply its scale by 1.5.
            // Depth of 1 == scale 1
            // Depth of 2 == scale 1 * 1.5
            // Depth of 3 == scale 1 * 1.5 * 1.5
            // Depth of n == scale 1 * Math.pow(1.5, n-1)
            let originalScale = 1 * Math.pow(1.5, originalDepths[blockId]-1);
            let newScale      = 1 * Math.pow(1.5, newDepths[blockId]-1);

            let block = this.data.blocks[blockId];
            blockIdsAndPositions.push({
                blockId: block.id,
                location: {
                    ...block.location,
                    width:  block.location.width  * originalScale / newScale,
                    height: block.location.height * originalScale / newScale
                }
            });
        }

        // Do the update!
        await this.setBlockPositions(blockIdsAndPositions);
    }

    async setBlockContent(blockId: string, content: BlockContent): Promise<void> {
        // TODO-later : we should add dynamic, run-time checking of content to make sure it's of type BlockContent.

        // Make sure the block exists
        if (this.data.blocks[blockId] === undefined) {
            throw new T.ConstError(3,
                `Requested block wasn't found. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'setBlockContent', 1),
                "Error in setBlockContent: Requested block doesn't exist");
        }

        // Perform the update
        this.data.blocks[blockId].content = content;

        // The data's dirty!
        this.scheduleSave();
    }

    async setClassificationDefinitions({ classificationIds, classifications, fields, possibleValues }: T.SetClassificationDefinitionsRequest): Promise<T.SetClassificationDefinitionsResponse> {
        // Validating the request will work before changing any values.
        await this.verifyValidFieldTypeTransitions(fields);

        // Since classifications can point to fields, and fields can point to possible values, we're updating them in
        // reverse order to make sure the "target IDs" exist before we try and point to them.
        let changedPVs = await this.updatePossibleValueDefinitions(possibleValues);
        await this.updateFieldDefinitions(fields);
        await this.updateClassificationDefinitions(classifications, classificationIds);

        let changedFieldValues = await this.updatePossibleValueNames(changedPVs);

        this.scheduleSave();

        return {
            classificationIds,
            classifications,
            fields,
            possibleValues,
            changedFieldValues,
        };
    }

    getBoardTemplate(): TemplateClassification[] {
        return BoardDataPersistence.getBoardTemplate(this.data);
    }

    async updatePossibleValueDefinitions(possibleValues: TypedMap<PossibleValueDefinition>): Promise<ChangedPVName[]> {
        // Update the PVs, tracking any that have changed their names. Need these changes to update fields that have those values.
        let changedPVs: ChangedPVName[] = [];
        for (let pvId of Object.keys(possibleValues)) {
            let currentValue = this.data.possibleValues[pvId]?.name;
            if (currentValue && currentValue !== possibleValues[pvId].name) {
                changedPVs.push({ pvId, oldName: currentValue, newName: possibleValues[pvId].name });
            }
            // Just set each key/value pair, replacing existing IDs, but not worrying about having stale IDs
            // left over. We can clean those up some other time if they become a problem.
            this.data.possibleValues[pvId] = possibleValues[pvId];
        }

        return changedPVs;
    }

    async updateFieldDefinitions(fields: TypedMap<FieldDefinition>): Promise<void> {
        // Just set each key/value pair, replacing existing IDs, but not worrying about having stale IDs
        // left over. We can clean those up some other time if they're a problem..
        this.data.fields = { ...this.data.fields, ...fields };
    }

    async updateClassificationDefinitions(classifications: TypedMap<ClassificationDefinition>, classificationIds: string[]): Promise<void> {
        // Unlike updating field definitions, whenever we update "classifications", we will be updating ALL of them.
        // This means it's ok to just replace whatever's stored with whatever's passed in.
        this.data.classifications = classifications;
        this.data.classificationIds = classificationIds;
    }

    async updatePossibleValueNames(changedPVNames: ChangedPVName[]): Promise<ChangedFieldValue[]> {
        // Make the data updates
        let changedFieldValues: ChangedFieldValue[] = [];
        for (let changedPV of changedPVNames) {
            // Determine which field has this PV.
            // NOTE: This assumes PVs cannot be moved across fields, which was true at the time of writing.
            let fieldId = Object.values(this.data.fields).find(f => f.possibleValueIds.includes(changedPV.pvId))?.id;
            if (fieldId) {
                // Determine which blocks have the "old value" for this field. We update them *after*
                // generating the full list so the updates don't interfere with future iterations of the
                // loop. (This was a bug. All 1's updated to 2. All 2's updated to 3. Suddenly, everything
                // was a 3.)
                for (let block of Object.values(this.data.blocks)) {
                    if (Array.isArray(block.fieldValues[fieldId])) {
                        let index = block.fieldValues[fieldId].indexOf(changedPV.oldName);
                        if (index !== -1) {
                            let newValue = [...block.fieldValues[fieldId]]; // Copy the current value so we don't change it in-place.
                            newValue[index] = changedPV.newName;            // Then, update it to the new PV name
                            changedFieldValues.push({
                                blockId: block.id,
                                fieldId: fieldId,
                                newValue: newValue
                            });
                        }
                    } else if (block.fieldValues[fieldId] === changedPV.oldName) {
                        changedFieldValues.push({
                            blockId: block.id,
                            fieldId: fieldId,
                            newValue: changedPV.newName,
                        });
                    }
                }
            } else {
                throw new T.ConstError(4,
                    undefined,
                    T.ConstError.getLineId('BoardDataPersistence', 'updatePossibleValueNames', 1),
                    "Error in updatePossibleValueNames: the PV didn't have an associated field.");
            }
        }

        // Now that we know what to update, actually do the update!
        for (let cfv of changedFieldValues) {
            this.data.blocks[cfv.blockId].fieldValues[cfv.fieldId] = cfv.newValue;
        }

        return changedFieldValues;
    }

    async verifyValidFieldTypeTransitions(newFields: TypedMap<FieldDefinition>): Promise<void> {
        // Make sure none of the fields are being changed into incompatible types
        for (let newField of Object.values(newFields)) {
            let originalField = this.data.fields[newField.id];
            if (originalField && !getCompatibleFieldTypes(originalField.type).includes(newField.type)) {
                throw new T.ConstError(3,
                    `Cannot change between ${originalField.type} and ${newField.type}.`,
                    T.ConstError.getLineId('BoardDataPersistence', 'verifyValidFieldTypeTransitions', 1),
                    "Error in verifyValidFieldTypeTransitions: attempted to change between incompatible field types.");
            }
        }
    }

    async setClassificationOnBlocks({ blockIds, classificationId, isActive }: T.SetClassificationOnBlocksRequest): Promise<T.SetClassificationOnBlocksResponse> {
        // Make sure the blocks exist
        for (let blockId of blockIds) {
            if (this.data.blocks[blockId] === undefined) {
                throw new T.ConstError(3,
                    `Requested block wasn't found. ${T.GENERIC_RESTART}`,
                    T.ConstError.getLineId('BoardDataPersistence', 'setClassificationOnBlocks', 1),
                    "Error in setClassificationOnBlocks: requested block does not exist.");
            }
        }

        // Make sure the classification exists
        if (this.data.classifications[classificationId] === undefined) {
            throw new T.ConstError(4,
                `Requested classification wasn't found. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'setClassificationOnBlocks', 2),
                "Error in setClassificationOnBlocks: requested classification does not exist.");
        }

        // Make the data updates
        for (let blockId of blockIds) {
            let currentIndex = this.data.blocks[blockId].classificationIds.indexOf(classificationId);

            if (isActive && currentIndex === -1) {
                // Should be active, but isn't currently present. Add it.
                this.data.blocks[blockId].classificationIds.push(classificationId);
            } else if (!isActive && currentIndex !== -1) {
                // Shouldn't be active, but is currently present. Remove it.
                this.data.blocks[blockId].classificationIds.splice(currentIndex, 1);
            }
        }

        this.scheduleSave();

        return { blockIds, classificationId, isActive, };
    }

    async setFieldDefinitions({ blockIds, fieldDefinitions, fieldIds, possibleValueDefinitions, deletedFieldIds }: T.SetFieldDefinitionsRequest): Promise<T.SetFieldDefinitionsResponse> {
        // Validating the request will work before changing any values.
        await this.verifyValidFieldTypeTransitions(fieldDefinitions);

        // Update the field and possibleValue definitions on the board. Since fields can point to possible values,
        // we're updating them in reverse order to make sure the "target IDs" exist before we try and point to them.)
        let changedPVs = await this.updatePossibleValueDefinitions(possibleValueDefinitions);
        await this.updateFieldDefinitions(fieldDefinitions);

        let changedFieldValues = await this.updatePossibleValueNames(changedPVs);

        // Remove the deleted fields from the blocks
        for (let fieldId of deletedFieldIds) {
            let blockIdToFieldValue: TypedMap<any> = blockIds.reduce((prev: TypedMap<any>, curr) => {
                prev[curr] = undefined;
                return prev;
            }, {});
            await this.setFieldOnBlocks({ fieldId, blockIdToFieldValue });
        }

        // Ensure all the blocks have the new/updated fields on them.
        let blockFieldIds = await this.addFieldIdsToBlocks(blockIds, Object.keys(fieldDefinitions));

        this.scheduleSave();

        // We want to return the blockIds and ALL their field definitions.
        return {
            fieldDefinitions: fieldDefinitions,
            possibleValueDefinitions: possibleValueDefinitions,
            blockFieldIds,
            changedFieldValues,
        };
    }

    async addFieldIdsToBlocks(blockIds: string[], fieldIds: string[]): Promise<TypedMap<string[]>> {
        // Make sure the block exists
        for (let blockId of blockIds) {
            if (this.data.blocks[blockId] === undefined) {
                throw new T.ConstError(6,
                    `Requested block wasn't found. ${T.GENERIC_RESTART}`,
                    T.ConstError.getLineId('BoardDataPersistence', 'setBlockContent', 1),
                    "Error in addFieldIdsToBlocks: requested block does not exist.");
            }
        }

        // Make the data changes
        let blockFieldIds: TypedMap<string[]> = {};
        for (let blockId of blockIds) {
            let block = this.data.blocks[blockId];
            let additionalFieldIdsOnBlock = block.fieldIds.filter(fid => !fieldIds.includes(fid));

            // We need to keep the order of the fields passed into this function ("fieldIds")... but
            // also merge them with the other fields already on the block ("additionalFieldIdsOnBlock").
            block.fieldIds = [...additionalFieldIdsOnBlock, ...fieldIds];

            blockFieldIds[blockId] = block.fieldIds;
        }

        return blockFieldIds;
    }

    /**
     * fieldValue meanings:
     *   - undefined = delete this field
     *   - anything else = set to the given value
     */
    async setFieldOnBlocks({ fieldId, blockIdToFieldValue }: T.SetFieldOnBlocksRequest): Promise<T.SetFieldOnBlocksResponse> {
        // Make sure the block exists
        for (let blockId of Object.keys(blockIdToFieldValue)) {
            if (this.data.blocks[blockId] === undefined) {
                throw new T.ConstError(5,
                    `Requested block wasn't found. ${T.GENERIC_RESTART}`,
                    T.ConstError.getLineId('BoardDataPersistence', 'setFieldOnBlocks', 1),
                    "Error in setFieldOnBlocks: specified block does not exist.");
            }
        }

        // Make the data updates
        for (let blockId in blockIdToFieldValue) {
            let fieldValue = blockIdToFieldValue[blockId];
            if (fieldValue === undefined) {
                // "undefined" means "delete this field"
                delete this.data.blocks[blockId].fieldValues[fieldId];
                ArrayUtils.removeItem(this.data.blocks[blockId].fieldIds, fieldId);
            } else {
                // any other value means to initialize/set to the given value
                this.data.blocks[blockId].fieldValues[fieldId] = fieldValue;
            }
        }

        this.scheduleSave();

        return { fieldId, blockIdToFieldValue, };
    }

    async saveView({ viewConfig }: T.SaveViewRequest): Promise<T.SaveViewResponse> {
        // TODO-later : Do some validation on viewConfig
        this.data.views[viewConfig.id] = viewConfig;

        this.scheduleSave();

        return {
            baseViewConfig: {
                id: viewConfig.id,
                name: viewConfig.name,
                type: viewConfig.type,
                filter: viewConfig.filter,
            },
        };
    }

    async deleteView({ viewId }: T.DeleteViewRequest): Promise<T.DeleteViewResponse> {
        delete this.data.views[viewId];

        this.scheduleSave();

        return { viewId };
    }

    async setBlockPriority({ blockId, beforeId }: T.SetBlockPriorityRequest): Promise<T.SetBlockPriorityResponse> {
        // Make sure the "before" block exists if it was defined.
        let beforeIndex = -1;
        if (beforeId !== undefined) {
            beforeIndex = this.data.blockPriorities.indexOf(beforeId);
            if (beforeIndex === -1) {
                throw new T.ConstError(3,
                    `Requested "before block" wasn't found in the priority list. ${T.GENERIC_RESTART}`,
                    T.ConstError.getLineId('BoardDataPersistence', 'setBlockPriority', 1),
                    "Error in setBlockPriority: the 'beforeId' block was not found in the priority list.");
            }
        }

        // Remove the blocks from their current locations
        for (let id of blockId) {
            let originalIndex = this.data.blockPriorities.indexOf(id);

            // Remove it if it exists.
            if (originalIndex !== -1) {
                this.data.blockPriorities.splice(originalIndex, 1);
            }
        }

        if (beforeId === undefined) {
            // If "beforeId" is undefined, insert the blocks at the end of the list.
            this.data.blockPriorities.push(...blockId);
        } else {
            // Otherwise, insert them before the location of "beforeId".
            // ...need to re-look-up the index since we've since updated the array.
            beforeIndex = this.data.blockPriorities.indexOf(beforeId);
            this.data.blockPriorities.splice(beforeIndex, 0, ...blockId);
        }

        this.scheduleSave();

        return { blockId, beforeId };
    }

    async loadView({ viewId }: T.LoadViewRequest): Promise<T.LoadViewResponse> {
        return {
            viewConfig: this.data.views[viewId],
        };
    }

}