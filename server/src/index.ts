
// -- Third-Party Libraries --
import express from 'express';

// -- Internal --
import * as Rest from './RestHandlers';
import { properties, populateProperties } from './PropertyLoader';

(async () => {
    try {
        // Set up the property loader
        populateProperties(process.argv[2]);

        // ========================
        // Datastore Initialization
        // ------------------------

        // TODO-const : set up datastore
        // if (process.env.NODE_ENV === 'production') {
        //     if (properties.web.persistence.type === 'postgres') {
        //         DataInterface.initializeForWebServer(new WebDataPostgres(properties.web.persistence.connectionInfo), stripeData);
        //     } else if (properties.web.persistence.type === 'file') {
        //         DataInterface.initializeForWebServer(new WebDataInMemory(properties.web.persistence.location), stripeData);
        //     } else {
        //         throw new TopError('1.0.0', Severity.FATAL,
        //             `Unrecognized persistence type: ${properties.web.persistence.type}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        // } else if (process.env.NODE_ENV !== 'production') {
        //     if (properties.web.persistence.type === 'postgres') {
        //         DataInterface.initializeForWebServer(new WebDataPostgres(properties.web.persistence.connectionInfo), stripeData);
        //     } else if (properties.web.persistence.type === 'memory') {
        //         DataInterface.initializeForWebServer(new WebDataInMemory(), stripeData);
        //     } else if (properties.web.persistence.type === 'file') {
        //         DataInterface.initializeForWebServer(new WebDataInMemory(properties.web.persistence.location), stripeData);
        //     } else {
        //         throw new TopError('1.0.0', Severity.FATAL,
        //             `Unrecognized persistence type: ${(properties.web.persistence as any).type}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     if (properties.web.persistence.loadTestData) {
        //         DatabaseBootstrapper.initializeWebServer();
        //     }
        // }


        // ============
        // Server Setup
        // ------------

        // Express
        const app = express();

        // Required for receiving JSON bodies
        app.use(express.json());


        // ==========================
        // REST Endpoint Registration
        // --------------------------

        app.get ('/example', Rest.example); // Example endpoint


        // ====================
        // Here we go! (Wheee!)
        // --------------------

        app.listen(properties.server_port, () => {
            // TODO-const : Logger
            console.log(`Web server listening at http://${properties.server_host}:${properties.server_port}`);
            // logger.info(`Web server listening at http://${server.host}:${server.port}`);
        });

    } catch(err) {
        // TODO-const : Logger
        console.log(err);
        // logger.error(err);
    }
})();