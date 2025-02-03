
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { BoardData, CopyData, TemplateClassification } from '../datatypes/BoardDataTypes';
import { BoundingBox, TypedMap } from '../datatypes/GenericDataTypes';
import { Block, BlockContent, BlockIdAndPosition, verifyBlockContent } from '../datatypes/BlockDataTypes';
import { ChangedFieldValue, ChangedPVName, ClassificationDefinition, FieldDefinition, PossibleValueDefinition, getCompatibleFieldTypes, getFieldDataType } from '../datatypes/FieldDataTypes';
import * as T from '../datatypes/ActionDataTypes';
import * as ArrayUtils from '../utilities/ArrayUtils';
import { verifyViewConfig } from '../datatypes/ViewDataTypes';
import { ScaleUtils } from '../utilities';

export class BoardDataPersistence {

    public sourceFile: string | undefined;
    public backupFile: string | undefined;

    private data: BoardData;

    private saveTimer: ReturnType<typeof setTimeout> | undefined = undefined;

    private reportSaveStatus: (status: boolean) => void;

    constructor(
        sourceFilepath: string | undefined = undefined,
        backupFilepath: string | undefined = undefined,
        initialData: BoardData = BoardDataPersistence.getInitData(),
        reportSaveStatus: (status: boolean) => void = (s) => {}
    ) {
        this.sourceFile = sourceFilepath;
        this.backupFile = backupFilepath;
        this.reportSaveStatus = reportSaveStatus;

        if (this.sourceFile && this.backupFile) {
            // Get the file's data (or initialize the data if file is empty)
            if (fs.existsSync(this.sourceFile)) {
                try {
                    this.data = JSON.parse(fs.readFileSync(this.sourceFile, 'utf8'));
                } catch(err) {
                    // Fallback to backup file if main file fails to parse
                    if (fs.existsSync(this.backupFile)) {
                        this.data = JSON.parse(fs.readFileSync(this.backupFile, 'utf8'));
                        this.saveData(); // Save the initial state
                    } else {
                        // Corrupt main file, and no backup file. Woe is me.
                        throw new T.ConstError(3,
                            `Failed to load board data. ${T.GENERIC_SUPPORT}`,
                            T.ConstError.getLineId('BoardDataPersistence', 'constructor', 1),
                            `Error in constructor: Failed to load the board's data. ${T.GENERIC_SUPPORT}`);
                    }
                }
            } else {
                this.data = JSON.parse(JSON.stringify(initialData));
                this.saveData(); // Save the initial state
            }
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
        if (this.sourceFile && this.backupFile) {
            fs.writeFileSync(this.sourceFile, JSON.stringify(this.data, null, 2));
            fs.writeFileSync(this.backupFile, JSON.stringify(this.data, null, 2));
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

    async pasteData({classifications, fields, possibleValues, blocks}: CopyData): Promise<{
        blocks: Block[],
        classificationIds: string[],
        classificationDefs: TypedMap<ClassificationDefinition>,
        fieldDefs: TypedMap<FieldDefinition>,
        possibleValueDefs: TypedMap<PossibleValueDefinition>
    }> {
        const fieldMap = ArrayUtils.mapify<FieldDefinition>(fields, 'id');

        // Look up the existing classification/field/PV IDs. Any that don't exist are assigned to undefined.
        const pastedCidToExistingMappings = classifications.reduce((acc, curr) => {
            const idMappings = this.getExistingClassificationMappings(curr, fieldMap);
            acc[curr.id] = idMappings;
            return acc;
        }, {} as TypedMap<{ cid: string, fids: TypedMap<string> } | undefined>);

        // Flatten the above object into three individual ID lookup maps -- pasted IDs to their persisted IDs.
        let cidPastedToPersisted  = {} as TypedMap<string>;
        let fidPastedToPersisted  = {} as TypedMap<string>;
        let pvidPastedToPersisted = {} as TypedMap<string>;
        for (const [pastedCid, existingMappings] of Object.entries(pastedCidToExistingMappings)) {
            // existingMappings will be undefined for any new classifications, which we don't need in our lookup maps AT THIS POINT. They're added later.
            if (existingMappings != undefined) {
                cidPastedToPersisted[pastedCid] = existingMappings.cid;
                fidPastedToPersisted  = { ...fidPastedToPersisted,  ...existingMappings.fids  };
            }
        }

        // Figure out which classifications, fields, and PVs need to be created
        const csToCreateArr = Object.entries(pastedCidToExistingMappings)
            .filter(([_, existingMappings]) => existingMappings?.cid == undefined)
            .map(([pastedCid, _]) => classifications.find(c => c.id === pastedCid)!);
        const fsToCreateArr = csToCreateArr
            .flatMap(c => c.fieldIds)
            .map(fid => fields.find(f => f.id === fid)!);
        const pvsToCreateArr = fsToCreateArr
            .flatMap(f => f.possibleValueIds)
            .map(pvid => possibleValues.find(pv => pv.id === pvid)!);

        // Regenerate all their IDs, saving the mapped values for later use
        const csToCreate  = this.recreateIds(csToCreateArr,  cidPastedToPersisted);
        const fsToCreate  = this.recreateIds(fsToCreateArr,  fidPastedToPersisted);
        const pvsToCreate = this.recreateIds(pvsToCreateArr, pvidPastedToPersisted);
        // Also, update the field IDs on each classification to the new values.
        Object.values(csToCreate).forEach(c => {
            c.fieldIds = c.fieldIds
                .filter(fid => fid in fidPastedToPersisted) // Cut out any that aren't in our lookup map. (Shouldn't ever happen.)
                .map(fid => fidPastedToPersisted[fid]!);
        });
        // Also also, update the PV IDs on each field to the new values.
        Object.values(fsToCreate).forEach(f => {
            f.possibleValueIds = f.possibleValueIds
                .filter(pvid => pvid in pvidPastedToPersisted) // Cut out any that aren't in our lookup map. (Shouldn't ever happen.)
                .map(pvid => pvidPastedToPersisted[pvid]!);
        });

        // Classification updates need to include ALL classifications, so take what we already have and add on the new ones.
        // (PV and Field updates just need the new definitions.)
        const classificationIds  = [ ...this.data.classificationIds, ...Object.keys(csToCreate) ];
        const classificationDefs = { ...this.data.classifications, ...csToCreate };

        // Create the pasted non-classification fields and their PVs
        await this.setClassificationDefinitions({
            classificationIds: classificationIds,
            classifications: classificationDefs,
            fields: fsToCreate,
            possibleValues: pvsToCreate,
        });

        // Create the pasted blocks.
        for (const block of blocks) {
            await this.createBlock(block.id, block.location, undefined);
            await this.setBlockContent(block.id, block.content);
            for (const cid of block.classificationIds) {
                await this.setClassificationOnBlocks({ blockIds: [block.id], classificationId: cidPastedToPersisted[cid], isActive: true })
            }
            for (const [fid, value] of Object.entries(block.fieldValues)) {
                await this.setFieldOnBlocks({ fieldId: fidPastedToPersisted[fid], blockIdToFieldValue: { [block.id]: value } })
            }
            // TODO-ben: For fields directly on blocks (not classifications)
            // await this.addFieldIdsToBlocks([block.id], block.fieldIds.map(fid => fidPastedToPersisted[fid]));
            // await this.setFieldDefinitions(...);
        }
        for (const block of blocks) {
            await this.setBlockParent(block.id, block.parentBlockId, true);
        }

        // TODO-ben: Include a "we made a best attempt" flag in the response, and only set it if we mapped some IDs..?
        return {
            blocks: blocks.map(b => this.data.blocks[b.id]),
            classificationIds,
            classificationDefs,
            fieldDefs: fsToCreate,
            possibleValueDefs: pvsToCreate,
        };
    }


    // ================
    // Helper Utilities
    // ----------------

    /**
     * Considered "matching" if the names match, all field names match (uni-directionally), and all field types are compatible. PVs *do not matter*
     * because they are only stored on blocks as values (not IDs), and don't necessarily have a hard mapping to PV definitions.
     * 
     * Returns mappings from "pasted" to "persisted/existing" ids.
     */
    getExistingClassificationMappings(pastedClassification: ClassificationDefinition, fieldDefs: TypedMap<FieldDefinition>): { cid: string, fids: TypedMap<string> } | undefined {
        for (const existingClassification of Object.values(this.data.classifications)) {
            // If the classification names don't match, on to the next!
            if (existingClassification.name !== pastedClassification.name) continue;

            // Every pasted field must exist in the existing classification's field list
            const existingFields = existingClassification.fieldIds.map(fid => this.data.fields[fid]);
            const pastedToExistingFids = pastedClassification.fieldIds
                .reduce((acc, pastedFid) => {
                    // The field names must match and the field data types must be compatible in order to count as a matching field.
                    const matchingField = existingFields.find(existing => existing.name === fieldDefs[pastedFid].name && getFieldDataType(existing.type) === getFieldDataType(fieldDefs[pastedFid].type));
                    acc[pastedFid] = matchingField?.id;
                    return acc;
                }, {} as TypedMap<string | undefined>);

            // Check if we found a compatible match
            if (Object.values(pastedToExistingFids).every(fid => fid !== undefined)) {
                return {
                    cid: existingClassification.id,
                    fids: pastedToExistingFids as TypedMap<string>, // Safe to cast since we just verified all values were not undefined
                };
            }
        }

        // If we didn't find any matches, then return undefined :(
        return undefined;
    }

    recreateIds<T extends {id: string}>(targets: T[], oldToNewLookup: TypedMap<string>): TypedMap<T> {
        return targets.reduce((acc, t) => {
            const newId = uuidv4();
            oldToNewLookup[t.id] = newId;
            t.id = newId;
            acc[newId] = t;
            return acc;
        }, {} as TypedMap<T>);
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
        // Process one block deletion at a time to ensure things are resized properly.
        for (const deletedId of blockIds) {
            // The "parent" of the deleted block is relevant for scaling. Remember that it *could* be undefined.
            const parentId = this.data.blocks[deletedId].parentBlockId;

            // Update all the children and descendents
            const childLookup = this.getBlockChildLookup();
            if (childLookup[deletedId] != undefined) {
                // The "focal point" for repositioning is "the child location closest to the deleted node"
                const deletedLoc = this.data.blocks[deletedId].location;
                const focalPoint = childLookup[deletedId]
                    .map(childId => this.data.blocks[childId].location)
                    .map(childLoc => ({
                        location: childLoc,
                        distance: Math.sqrt(
                            Math.pow(childLoc.x - deletedLoc.x, 2) +
                            Math.pow(childLoc.y - deletedLoc.y, 2)
                        )
                    }))
                    .sort((a, b) => a.distance - b.distance)?.[0]?.location;

                // Update the child's location and all its descendents
                for (const childId of childLookup[deletedId]) {
                    // Collect some data
                    const child = this.data.blocks[childId];
                    const originalBlockDepth = ScaleUtils.getDepth(child, this.data.blocks);
                    const parentBlockDepth = parentId ? ScaleUtils.getDepth(this.data.blocks[parentId], this.data.blocks) : 0;

                    // Point the child at their new parent (...a phrase I never thought I'd say.)
                    child.parentBlockId = parentId;

                    // Update the child and all the grandchildren
                    const descendents      = await this.getBlockDescendents([childId], childLookup);
                    const descendentDepths = await this.getBlockDepths(Array.from(descendents), childId);

                    const oldDepths = {} as TypedMap<number>;
                    const newDepths = {} as TypedMap<number>;
                    Object.entries(descendentDepths).forEach(([id, depth]) => {
                        oldDepths[id] = originalBlockDepth + depth;
                        newDepths[id] = parentBlockDepth + 1 + depth;
                    });
                    await this.adjustBlockSizes(oldDepths, newDepths, focalPoint);
                }
            }

            // Finally, delete this node
            delete this.data.blocks[deletedId];
            let index = this.data.blockPriorities.indexOf(deletedId);
            if (index !== -1) {
                this.data.blockPriorities.splice(index, 1);
            }
        }

        this.scheduleSave();

        return blockIds;
    }

    getTreeRoots(descendentBlocks: Block[], deletedBlockIds: string[]): Record<string, {x: number, y: number}> {
        const dBidToRootId: Record<string, {x: number, y: number}> = {};
        for (let descendent of descendentBlocks) {
            // Traverse up the tree until we reach a root node or one of the deleted blocks
            let potentialRoot = descendent;
            while (potentialRoot.parentBlockId != undefined && !(potentialRoot.id in deletedBlockIds)) {
                potentialRoot = this.data.blocks[potentialRoot.parentBlockId];
            }
            dBidToRootId[descendent.id] = potentialRoot.location;
        }
        return dBidToRootId;
    }

    async setBlockParent(blockId: string, parentBlockId: string | undefined, skipResize: boolean = false): Promise<void> {
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

        // Verify we don't have a circular reference by traversing up the hierarchy
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

        // Get all the decendants (and depths) of the given blockId
        let originalDescendents = await this.getBlockDescendents([blockId], this.getBlockChildLookup());
        let originalDepths      = await this.getBlockDepths(Array.from(originalDescendents));

        // Update the hierarchy
        this.data.blocks[blockId].parentBlockId = parentBlockId;

        // Determine the new depth of each descendant, and update its size appropriately
        if (!skipResize) {
            const rootLoc = this.data.blocks[blockId].location;
            const newDescendents = await this.getBlockDescendents([blockId], this.getBlockChildLookup());
            const newDepths      = await this.getBlockDepths(Array.from(newDescendents));
            await this.adjustBlockSizes(originalDepths, newDepths, rootLoc);
        }

        // The data's dirty!
        this.scheduleSave();
    }

    /**
     * We only track each block's parentId, which is very inconvenient for finding descendents. This function
     * builds up and returns a list of each block's children for convenience and (hopefully) efficiency.
     */
    getBlockChildLookup(): TypedMap<string[]> {
        let blockChildren: TypedMap<string[]> = {}; // Parent Id --> Children Ids
        Object.values(this.data.blocks).forEach(b => {
            if (b.parentBlockId) {
                blockChildren[b.parentBlockId] ??= [];
                blockChildren[b.parentBlockId].push(b.id);
            }
        });
        return blockChildren;
    }

    async getBlockDescendents(parentIds: string[], childLookup: TypedMap<string[]>): Promise<Set<Block>> {
        // Short-circuit if able
        if (parentIds.length === 0) {
            return new Set<Block>();
        }

        // Fetch and return the Blocks
        let descendents = new Set<Block>();
        let blocksToCheck = [...parentIds]; // Copying to prevent modifying the passed-in parameter on the caller.
        for (let blockId of blocksToCheck) {
            descendents.add(this.data.blocks[blockId]);
            childLookup[blockId]?.forEach(b => blocksToCheck.push(b));
        }
        return descendents;
    }

    async getBlockDepths(blocks: Block[], depthFromBlockId?: string): Promise<TypedMap<number>> {
        return blocks.reduce((acc, block) => {
            acc[block.id] = ScaleUtils.getDepth(block, this.data.blocks, depthFromBlockId);
            return acc;
        }, {} as TypedMap<number>);
    }

    async adjustBlockSizes(originalDepths: TypedMap<number>, newDepths: TypedMap<number>, rootLoc: { x: number, y: number } | undefined): Promise<void> {
        // Build up a list of blockIdsAndPositions to update
        let blockIdsAndPositions: BlockIdAndPosition[] = Object.keys(newDepths).map(blockId => {
            let block = this.data.blocks[blockId];
            return {
                blockId: block.id,
                location: ScaleUtils.updateBounds(block.location, originalDepths[block.id], newDepths[block.id], rootLoc),
            };
        });

        // Do the update!
        await this.setBlockPositions(blockIdsAndPositions);
    }

    async setBlockContent(blockId: string, content: BlockContent): Promise<void> {
        if (!verifyBlockContent(content)) {
            throw new T.ConstError(4,
                `Block content was invalid. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'setBlockContent', 2),
                "Error in setBlockContent: Invalid block content was provided.");
        }

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

    /**
     * We provide classificationIds rather than just calling Object.keys(classifications) because the order of the IDs determine
     * their order on the UI, which is important to maintain.
     */
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
        // left over. We can clean those up some other time if they're a problem.
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

    async saveView({ clientId, viewConfig }: T.SaveViewRequest): Promise<T.SaveViewResponse> {
        if (!verifyViewConfig(viewConfig)) {
            throw new T.ConstError(3,
                `Invalid view config was provided. ${T.GENERIC_RESTART}`,
                T.ConstError.getLineId('BoardDataPersistence', 'saveView', 1),
                `Error in saveView: provided view config was invalid.`);
        }

        this.data.views[viewConfig.id] = viewConfig;

        this.scheduleSave();

        return {
            clientId,
            baseViewConfig: {
                id: viewConfig.id,
                name: viewConfig.name,
                type: viewConfig.type,
                filter: viewConfig.filter,
            },
        };
    }

    async deleteView({ clientId, viewId }: T.DeleteViewRequest): Promise<T.DeleteViewResponse> {
        delete this.data.views[viewId];

        this.scheduleSave();

        return {
            clientId,
            viewId,
        };
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