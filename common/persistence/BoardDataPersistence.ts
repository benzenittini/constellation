

import fs from 'fs';

import { BoardData, TemplateClassification } from '../DataTypes/BoardDataTypes';
import { BoundingBox, TypedMap } from '../DataTypes/GenericDataTypes';
import { Block, BlockContent, BlockIdAndPosition } from '../DataTypes/BlockDataTypes';
import { ChangedFieldValue, ChangedPVName, ClassificationDefinition, FieldDefinition, PossibleValueDefinition, getCompatibleFieldTypes } from '../DataTypes/FieldDataTypes';
import * as T from '../DataTypes/ActionDataTypes';
import * as ArrayUtils from '../utilities/ArrayUtils';

export class BoardDataPersistence {

    private sourceFile: string | undefined;

    private data: BoardData;

    private saveTimer: ReturnType<typeof setTimeout> | undefined = undefined;

    constructor(sourceFile: string | undefined = undefined) {

        this.sourceFile = sourceFile;

        if (this.sourceFile) {
            // Get the file's data (or initialize the data if file is empty)
            let fileData: string;
            if (fs.existsSync(this.sourceFile)) {
                fileData = fs.readFileSync(this.sourceFile, 'utf8');
            } else {
                fileData = JSON.stringify(BoardDataPersistence.getInitData());
            }
            this.data = JSON.parse(fileData);

        } else {
            this.data = BoardDataPersistence.getInitData();
        }
    }

    /** This function should be called any time this.data is modified! */
    private scheduleSave() {
        console.log("Saving data..."); // TODO-const : delete
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveData(), 5000);
    }

    private saveData() {
        if (this.sourceFile) {
            // logger.debug('Saving web data...'); // TODO-const : Logger setup
            fs.writeFileSync(this.sourceFile, JSON.stringify(this.data));
            // logger.debug('...done!'); // TODO-const : Logger setup
        }
        console.log("Data saved!"); // TODO-const : delete
    }

    static getInitData() {
        return {
            blocks: {},
            views: {},
            fields: {},
            classifications: {},
            possibleValues: {},
            blockPriorities: [],
            classificationIds: [],
        };
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
            // TODO-const : error handling
            // throw new TopError('3.3.13', Severity.MEDIUM,
            //     `When creating a new block, the specified parentBlockId does not exist. boardId: ${boardId}, blockId: ${blockId}, parentBlockId: ${parentBlockId}`,
            //     UserErrors.INTERNAL_ERROR);
            throw new Error('error in createBlock: parent block does not exist');
        }

        // Make sure there isn't a duplicate blockId
        if (this.data.blocks[blockId]) {
            // TODO-const : error handling
            // throw new TopError('3.3.14', Severity.MEDIUM,
            //     `When creating a new block, the specified block ID already exists. boardId: ${boardId}, blockId: ${blockId}, parentBlockId: ${parentBlockId}`,
            //     UserErrors.INTERNAL_ERROR);
            throw new Error('error in createBlock: block id already exists');
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
            // TODO-const : Error handling
            throw new Error("Error in setBlockParent: requested blockId cannot be undefined.");
        } else if (blockId !== undefined && !this.data.blocks[blockId]) {
            // TODO-const : Error handling
            throw new Error("Error in setBlockParent: requested blockId doesn't exist.");
        } else if (parentBlockId !== undefined && !this.data.blocks[parentBlockId]) {
            // TODO-const : Error handling
            throw new Error("Error in setBlockParent: requested parentBlockId doesn't exist.");
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
                // TODO-const : Error handling
                throw new Error("Error in setBlockParent: circular dependency detected!");
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
            // TODO-const : Error handling
            throw new Error("Error in setBlockContent: Requested block doesn't exist");
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

        // Lastly, build up the persisted template classifications, flattening out the objects and removing the IDs
        let template: TemplateClassification[] = classificationIds.map(cid => ({
            name: classifications[cid].name,
            fields: classifications[cid].fieldIds.map(fid => ({
                name: fields[fid].name,
                type: fields[fid].type,
                sourceType: 'classification',
                possibleValues: fields[fid].possibleValueIds.map(pvid => ({
                    name: possibleValues[pvid].name,
                    style: possibleValues[pvid].style,
                })),
            })),
        }));
        // TODO-const : persist the template somewhere/somehow..? Should these be just client-side, or server-side too?

        this.scheduleSave();

        return {
            classificationIds,
            classifications,
            fields,
            possibleValues,
            changedFieldValues,
        };
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
                // TODO-const : error handling
                throw new Error("Error in updatePossibleValueNames: the PV didn't have an associated field.");
                // throw new TopError('3.6.15', Severity.HIGH,
                //     `When updating possible value names, the possible value didn't have an associated field. boardId: ${boardId}, changedPV: ${JSON.stringify(changedPV)}, changedPVNames: ${JSON.stringify(changedPVNames)}`,
                //     UserErrors.INTERNAL_ERROR);
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
                // TODO-const : error handling
                throw new Error('Error in verifyValidFieldTypeTransitions: attempted to change between incompatible field types.');
            }
        }
    }

    async setClassificationOnBlocks({ blockIds, classificationId, isActive }: T.SetClassificationOnBlocksRequest): Promise<T.SetClassificationOnBlocksResponse> {
        // Make sure the blocks exist
        for (let blockId of blockIds) {
            if (this.data.blocks[blockId] === undefined) {
                // TODO-const : error handling
                throw new Error("Error in setClassificationOnBlocks: requested block does not exist.");
            }
        }

        // Make sure the classification exists
        if (this.data.classifications[classificationId] === undefined) {
            // TODO-const : error handling
            throw new Error("Error in setClassificationOnBlocks: requested classification does not exist.");
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
                // TODO-const : error handling
                throw new Error("Error in addFieldIdsToBlocks: requested block does not exist.");
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
                // TODO-const : error handling
                throw new Error("Error in setFieldOnBlocks: specified block does not exist.");
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

}