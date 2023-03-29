
// -- Third-Party Libraries --
import express from 'express';
import fs from 'fs';
import * as http from 'http';
import * as https from 'https';

// -- Internal --
import * as Rest from './RestHandlers';
import { properties, populateProperties } from './PropertyLoader';
import { initializeLogger, logger } from './Logger';
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

        const useTLS = (properties.server_cert !== undefined && properties.server_key !== undefined)

        // HTTP server setup
        const app = express();
        app.use(express.json());

        // Websocket setup
        const httpServer = useTLS
            ? https.createServer({
                key: fs.readFileSync(properties.server_key!, 'utf-8'),
                cert: fs.readFileSync(properties.server_cert!, 'utf-8'),
            }, app)
            : http.createServer(app);
        initializeSingleton(httpServer);


        // ==========================
        // REST Endpoint Registration
        // --------------------------

        // -- User --
        app.post  ('/user', Rest.postUser);     // User joining this project
        app.delete('/user', Rest.deleteUser);   // User leaving this project
        // -- Project --
        app.get   ('/project',           Rest.getProject);          // Fetching a project's name, id, and boards
        app.get   ('/project/templates', Rest.getProjectTemplates); // Fetches all of a project's board templates.
        // -- Board --
        app.post  ('/board',     Rest.postBoard);    // Creating a new board
        app.put   ('/board',     Rest.putBoard);     // Importing existing board data into new board
        app.delete('/board/:id', Rest.deleteBoard);  // Deletes a board by id
        app.put   ('/board/:id', Rest.putBoardById); // Update a board's config (ex: name)


        // ====================
        // Here we go! (Wheee!)
        // --------------------

        httpServer.listen(properties.server_port, () => {
            logger.info(`Web server listening at ${useTLS ? 'https' : 'http'}://${properties.server_host}:${properties.server_port}`);
        });

    } catch(err) {
        logger.error(err);
    }
})();