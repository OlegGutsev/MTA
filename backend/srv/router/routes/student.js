/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");

const dbClass = require(global.__base + "utils/dbClass");
const dbModelClass = require(global.__base + "model/dbModelClass");
const COMMON = require(global.__base + "utils/common");
const STUDENT = "STUDENT";

function _prepareObject(oStudent, req) {
    try {
       //oStudent.changedBy = COMMON.getAjaxUser(req);
        return oStudent;
    } catch (e) {
        console.log(e);
    }
}


module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        try {

            console.log(req);
            COMMON.checkAjaxAuth(req, "himta.view");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('Student get request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/student", req, res);

            const db = new dbClass(req.db);
            const dbModel = new dbModelClass(db, STUDENT, []);
            const aStudents = await dbModel.getAllData();

            tracer.exiting("/student", aStudents);
            res.type("application/json").status(200).send(JSON.stringify(aStudents));
        } catch (e) {
            tracer.catching("/student", e);
            next(e);
        }
    });

    app.post("/", async (req, res, next) => {
        try {
            console.log(req);
           // COMMON.checkAjaxAuth(req, "himta.edit");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('Student post request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/student", req, res);

            const db = new dbClass(req.db);
            const oStudent = _prepareObject(req.body, req);
            oStudent.studid = await db.getNextval("studid");
            const dbModel = new dbModelClass(db, STUDENT, oStudent);

            await dbModel.insertStudent();

            tracer.exiting("/student", oStudent);
            res.type("application/json").status(201).send(JSON.stringify(oStudent));
        } catch (e) {
            tracer.catching("/student", e);
            next(e);
        }
    });

    app.put("/:studid", async (req, res, next) => {
        try {
           // COMMON.checkAjaxAuth(req, "himta.edit");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('Student put request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/student", req, res);

            const db = new dbClass(req.db);
            const oStudent = _prepareObject(req.body, req);
            const dbModel = new dbModelClass(db, STUDENT, oStudent);

            await dbModel.updateStudent();
            const aStudents = await dbModel.getComplexStudentById(oStudent.studid);

            tracer.exiting("/student", aStudents[0]);
            res.type("application/json").status(200).send(aStudents[0]);
        } catch (e) {
            tracer.catching("/student", e);
            next(e);
        }
    });

    app.delete('/:studid', async (req, res, next) => {
        try {
           //COMMON.checkAjaxAuth(req, "himta.edit");

            const logger = req.loggingContext.getLogger("/Application");
            logger.info('Student put request');
            let tracer = req.loggingContext.getTracer(__filename);
            tracer.entering("/student", req, res);

            const db = new dbClass(req.db);
            const oStudentId = req.params.studid;
            const dbModel = new dbModelClass(db, STUDENT, [oStudentId]);

            await dbModel.deleteStudent();
            const aStudents = await dbModel.getAllData();

            tracer.exiting("/student", aStudents);
            res.type("application/json").status(200).send(JSON.stringify(aStudents));
        } catch (e) {
            tracer.catching("/student", e);
            next(e);
        }
    });

    return app;
};
