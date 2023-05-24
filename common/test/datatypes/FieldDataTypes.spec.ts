
import { expect } from 'chai';

import { DataType, FieldType, fieldTypeHasPVs, getAllFieldTypes, getCompatibleFieldTypes, getFieldDataType } from '../../src/datatypes';


describe('FieldDataTypes', function() {

    // =========================
    // getCompatibleFieldTypes()
    // -------------------------

    describe('#getCompatibleFieldTypes()', function() {
        [
            // Text Fields
            { input: FieldType.TEXTBOX,     expected: [FieldType.TEXTBOX, FieldType.TEXT_EDITOR] },
            { input: FieldType.TEXT_EDITOR, expected: [FieldType.TEXTBOX, FieldType.TEXT_EDITOR] },
            // Single-Select Fields
            { input: FieldType.DROPDOWN,      expected: [FieldType.DROPDOWN, FieldType.RADIO_BUTTONS] },
            { input: FieldType.RADIO_BUTTONS, expected: [FieldType.DROPDOWN, FieldType.RADIO_BUTTONS] },
            // Multi-Select Fields
            { input: FieldType.CHECKBOXES, expected: [FieldType.CHECKBOXES] },
            // Temporal Fields
            { input: FieldType.DATE,     expected: [FieldType.DATE, FieldType.TIME, FieldType.DATETIME] },
            { input: FieldType.TIME,     expected: [FieldType.DATE, FieldType.TIME, FieldType.DATETIME] },
            { input: FieldType.DATETIME, expected: [FieldType.DATE, FieldType.TIME, FieldType.DATETIME] },
        ].forEach(({ input, expected }) => {
            it(`"${input}" should be compatible with ${JSON.stringify(expected)}.`, function() {
                expect(getCompatibleFieldTypes(input)).to.deep.equal(expected);
            });
        });
    });


    // ==================
    // getFieldDataType()
    // ------------------

    describe('#getFieldDataType()', function() {
        [
            // Text Fields
            { input: FieldType.TEXTBOX,     expected: DataType.TEXT },
            { input: FieldType.TEXT_EDITOR, expected: DataType.TEXT },
            // Single-Select Fields
            { input: FieldType.DROPDOWN,      expected: DataType.SINGLE_SELECT },
            { input: FieldType.RADIO_BUTTONS, expected: DataType.SINGLE_SELECT },
            // Multi-Select Fields
            { input: FieldType.CHECKBOXES, expected: DataType.MULTI_SELECT },
            // Temporal Fields
            { input: FieldType.DATE,     expected: DataType.TEMPORAL },
            { input: FieldType.TIME,     expected: DataType.TEMPORAL },
            { input: FieldType.DATETIME, expected: DataType.TEMPORAL },
        ].forEach(({ input, expected }) => {
            it(`"${input}" should be of type "${expected}".`, function() {
                expect(getFieldDataType(input)).to.equal(expected);
            });
        });
    });


    // ==================
    // getAllFieldTypes()
    // ------------------

    describe('#getAllFieldTypes()', function() {
        for (let ft of Object.values(FieldType)) {
            it(`should include "${ft}" in its response.`, function() {
                expect(getAllFieldTypes()).to.include(ft);
            });
        }
    });


    // =================
    // fieldTypeHasPVs()
    // -----------------

    describe('#fieldTypeHasPVs()', function() {
        [
            // Text Fields
            { input: FieldType.TEXTBOX,     expected: false },
            { input: FieldType.TEXT_EDITOR, expected: false },
            // Single-Select Fields
            { input: FieldType.DROPDOWN,      expected: true },
            { input: FieldType.RADIO_BUTTONS, expected: true },
            // Multi-Select Fields
            { input: FieldType.CHECKBOXES, expected: true },
            // Temporal Fields
            { input: FieldType.DATE,     expected: false },
            { input: FieldType.TIME,     expected: false },
            { input: FieldType.DATETIME, expected: false },
        ].forEach(({ input, expected }) => {
            it(`"${input}" should ${expected ? '' : 'NOT '}have possible values.`, function() {
                expect(fieldTypeHasPVs(input)).to.equal(expected);
            });
        });
    });


    // ===============
    // getFieldValue()
    // ---------------
    // TODO


    // ===============================
    // verifyPossibleValueDefinition()
    // -------------------------------
    // TODO


    // =======================
    // verifyFieldDefinition()
    // -----------------------
    // TODO


    // ================================
    // verifyClassificationDefinition()
    // --------------------------------
    // TODO

});