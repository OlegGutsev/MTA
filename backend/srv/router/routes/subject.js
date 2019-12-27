/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");

const dbClass = require(global.__base + "utils/dbClass");


function _prepareObject(oSubject, req) {
    oSubject.changedBy = "DebugUser";
    return oSubject;
}


module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");
        logger.info('user get request');
        let tracer = req.loggingContext.getTracer(__filename);
        tracer.entering("/subject", req, res);

        try {
            const db = new dbClass(req.db);
            const oSubject = _prepareObject(req.body, req);

            const sSql = "SELECT * FROM \"SUBJECT\" ";
            const aSubjects = await db.executeUpdate(sSql, []);

            tracer.exiting("/subject", aSubjects);
            res.type("application/json").status(201).send(JSON.stringify({aSubjects}));
        } catch (e) {
            tracer.catching("/subject", e);
            next(e);
        }
    });

    app.post("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oSubject = _prepareObject(req.body, req);
            oSubject.grdid = await db.getNextval("grdid");

            const sSql = "INSERT INTO \"SUBJECT\" VALUES(?,?,?,?)";
            const aValues = [ oSubject.sbjid, oSubject.grdid, oSubject.name, oSubject.mark ];

            console.log(aValues);
            console.log(sSql);
            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oSubject));
        } catch (e) {
            next(e);
        }
    });

    app.put("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oSubject = _prepareObject(req.body, req);
            const sSql = "UPDATE \"SUBJECT\" SET \"STUDID\" = ? , \"STDATE\" = ?, \"COURSE\" = ? WHERE \"GRDID\" = ?";
            const aValues = [ oSubject.sbjid, oSubject.grdid, oSubject.name, oSubject.mark ];

            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(200).send(JSON.stringify(oSubject));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
