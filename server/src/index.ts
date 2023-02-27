
// -- Server Setup --
import express from 'express';
// TODO-const : Do we need session cookies?
// import cookieSession from 'cookie-session';

// -- REST Endpoint Setup --
import * as Rest from './RestHandlers';

(async () => {
    try {
        // TODO-const : Set up property loader

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

        // Session cookies
        // TODO-const : Do we need session cookies?
        // app.use(cookieSession({ ...properties.shared.sessionCookie, sameSite: 'strict' }));


        // ==========================
        // REST Endpoint Registration
        // --------------------------

        app.get ('/example', Rest.example); // Example endpoint


        // ====================
        // Here we go! (Wheee!)
        // --------------------

        // TODO-const : load host:port from properties
        // let server = properties.web.server;
        let server = { host: 'localhost', port: '3000' };
        app.listen(server.port, () => {
            // TODO-const : Logger
            console.log(`Web server listening at http://${server.host}:${server.port}`);
            // logger.info(`Web server listening at http://${server.host}:${server.port}`);
        });

    } catch(err) {
        // TODO-const : Logger
        console.log(err);
        // logger.error(err);
    }
})();