
import { expect } from 'chai';

import { verifyViewConfig } from '../../src/datatypes';


describe('ViewDataTypes', function() {

    // ==================
    // verifyViewConfig()
    // ------------------

    describe('#verifyViewConfig()', function() {
        [
            // Fully-populated
            { expected: true,  data: { id: 'asdf', name: 'view', type: 'FILTER', filter: { filters: [], conjunction: 'AND' } } },
            { expected: true,  data: { id: 'asdf', name: 'view', type: 'FILTER', filter: { filters: [], conjunction: 'OR' } } },
            // Required values removed
            { expected: false, data: {             name: 'view', type: 'FILTER', filter: { filters: [], conjunction: 'OR' } } },
            { expected: false, data: { id: 'asdf',               type: 'FILTER', filter: { filters: [], conjunction: 'OR' } } },
            { expected: false, data: { id: 'asdf', name: 'view',                 filter: { filters: [], conjunction: 'OR' } } },
            { expected: false, data: { id: 'asdf', name: 'view', type: 'FILTER'                                             } },
            // Invalid value types
            { expected: false, data: { id: 1,      name: 'view', type: 'FILTER', filter: { filters: [], conjunction: 'OR' } } },
            { expected: false, data: { id: 'asdf', name: 1,      type: 'FILTER', filter: { filters: [], conjunction: 'OR' } } },
            { expected: false, data: { id: 'asdf', name: 'view', type: 1,        filter: { filters: [], conjunction: 'OR' } } },
            { expected: false, data: { id: 'asdf', name: 'view', type: 'BAD',    filter: { filters: [], conjunction: 'OR' } } },
            // -- Kanban-Specific --
            { expected: true,  data: { id: 'asdf', name: 'view', type: 'KANBAN', filter: { filters: [], conjunction: 'AND' }, groupingFieldId: 'qwer' } },
            { expected: false, data: { id: 'asdf', name: 'view', type: 'KANBAN', filter: { filters: [], conjunction: 'AND' }, groupingFieldId: 1 } },
            { expected: false, data: { id: 'asdf', name: 'view', type: 'KANBAN', filter: { filters: [], conjunction: 'AND' } } },
        ].forEach(({ data, expected }) => {
            it(`should correctly identify a ViewConfig datatype.`, function() {
                expect(verifyViewConfig(data)).to.equal(expected);
            });
        });
    });

});