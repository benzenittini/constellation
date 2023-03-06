
// -- Third-Party Libraries --
import express from 'express';

// -- Internal --
import * as Rest from './RestHandlers';
import { properties, populateProperties } from './PropertyLoader';
import { initializeLogger, logger } from './Logger';
import { createServer } from 'http';
import { initializeSingleton } from './WebsocketManager';
import { initializePersistence } from './Persistence';

(async () => {
    try {

        // ===============
        // Singleton Setup
        // ---------------

        populateProperties(process.argv[2]);
        initializeLogger(properties.log_level, properties.log_dir);
        await initializePersistence(properties.project_data);


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