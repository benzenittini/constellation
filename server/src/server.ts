
// -- Third-Party Libraries --
import express from 'express';

// -- Internal --
import * as Rest from './RestHandlers';
import { properties, populateProperties } from './PropertyLoader';
import { initializeLogger, logger } from './Logger';
import { createServer } from 'http';
import { initializeSingleton } from './WebsocketManager';

(async () => {
    try {
        // Set up the property loader and logger
        populateProperties(process.argv[2]);
        initializeLogger(properties.log_level, properties.log_dir);
        Rest.initializePersistence(properties.project_data);

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

        // HTTP server setup
        const app = express();
        app.use(express.json());

        // Websocket setup
        const httpServer = createServer(app);
        initializeSingleton(httpServer);


        // ==========================
        // REST Endpoint Registration
        // --------------------------

        app.post  ('/user',    Rest.postUser);   // User joining this project
        app.delete('/user',    Rest.deleteUser); // User leaving this project
        app.get   ('/project', Rest.getProject); // Fetching a project's name, id, and boards
        app.post  ('/board',   Rest.postBoard);  // Creating a new board


        // ====================
        // Here we go! (Wheee!)
        // --------------------

        httpServer.listen(properties.server_port, () => {
            logger.info(`Web server listening at http://${properties.server_host}:${properties.server_port}`);
        });

    } catch(err) {
        logger.error(err);
    }
})();