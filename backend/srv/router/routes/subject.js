/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");

const dbClass = require(global.__base + "utils/dbClass");
const dbModelClass = require(global.__base + "model/dbModelClass");
const COMMON = require(global.__base + "utils/common");
const SUBJECT = "SUBJECT";


function _prepareObject(oSubject, req) {
    try {
        oSubject.changedBy = COMMON.getAjaxUser(req);
        return oSubject;
    } catch (e) {
        console.log(e);
    }
}


module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        try {
            COMMON.checkAjaxAuth(req, "himta.view");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('subject get request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/subject", req, res);

            const db = new dbClass(req.db);
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
            COMMON.checkAjaxAuth(req, "himta.edit");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('subject post request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/subject", req, res);

            const db = new dbClass(req.db);
            const oSubject = _prepareObject(req.body, req);
            oSubject.sbjid = await db.getNextval("sbjid");
            const dbModel = new dbModelClass(db, SUBJECT, oSubject);

            await dbModel.insertSubject();

            tracer.exiting("/subject", oSubject);
            res.type("application/json").status(201).send(JSON.stringify(oSubject));
        } catch (e) {
            tracer.catching("/subject", e);
            next(e);
        }
    });

    app.put("/:sbjid", async (req, res, next) => {
        try {
            COMMON.checkAjaxAuth(req, "himta.edit");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('subject put request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/subject", req, res);

            const db = new dbClass(req.db);
            const oSubject = _prepareObject(req.body, req);
            const dbModel = new dbModelClass(db, SUBJECT, oSubject);

            await dbModel.updateSubject();
            const aResult = await dbModel.getSubjectById(oSubject.sbjid);

            tracer.exiting("/subject", aResult[0]);
            res.type("application/json").status(200).send(JSON.stringify(aResult[0]));
        } catch (e) {
            tracer.catching("/subject", e);
            next(e);
        }
    });

    app.delete('/:sbjid', async (req, res, next) => {
        try {
            COMMON.checkAjaxAuth(req, "himta.edit");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('subject post request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/subject", req, res);

            const db = new dbClass(req.db);
            const oSubjectId = req.params.sbjid;
            const dbModel = new dbModelClass(db, SUBJECT, [oSubjectId]);

            await dbModel.deleteSubject();
            const aSubjects = await dbModel.getAllData();

            tracer.exiting("/subject", aSubjects);
            res.type("application/json").status(200).send(JSON.stringify(aSubjects));
        } catch (e) {
            tracer.catching("/subject", e);
            next(e);
        }
    });

    return app;
};
