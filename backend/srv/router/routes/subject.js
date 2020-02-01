/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");

const dbClass = require(global.__base + "utils/dbClass");
const dbModelClass = require(global.__base + "model/dbModelClass");

const SUBJECT = "SUBJECT";


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
            oSubject.sbjid = await db.getNextval("sbjid");
            const dbModel = new dbModelClass(db, SUBJECT, oSubject);

            await dbModel.insertSubject();
            res.type("application/json").status(201).send(JSON.stringify(oSubject));
        } catch (e) {
            next(e);
        }
    });

    app.put("/:sbjid", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const oSubject = _prepareObject(req.body, req);
            const dbModel = new dbModelClass(db, SUBJECT, oSubject);

            await dbModel.updateSubject();
            const aResult = await dbModel.getSubjectById(oSubject.sbjid);

            res.type("application/json").status(200).send(JSON.stringify(aResult[0]));
        } catch (e) {
            next(e);
        }
    });

    app.delete('/:sbjid', async (req, res, next) => {
        try {
            const db = new dbClass(req.db);
            const oSubjectId = req.params.sbjid;
            const dbModel = new dbModelClass(db, SUBJECT, [oSubjectId]);

            await dbModel.deleteSubject();
            const aSubjects = await dbModel.getAllData();

            res.type("application/json").status(200).send(JSON.stringify(aSubjects));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
