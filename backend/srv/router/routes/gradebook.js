/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");

const dbClass = require(global.__base + "utils/dbClass");


function _prepareObject(oGradeBook, req) {
    oGradeBook.changedBy = "DebugUser";
    return oGradeBook;
}


module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");
        logger.info('user get request');
        let tracer = req.loggingContext.getTracer(__filename);
        tracer.entering("/gradebook", req, res);

        try {
            const db = new dbClass(req.db);
            const oGradeBook = _prepareObject(req.body, req);

            const sSql = "SELECT * FROM \"GRADEBOOK\" ";
            const aGradeBooks = await db.executeUpdate(sSql, []);

            tracer.exiting("/gradebook", aGradeBooks);
            res.type("application/json").status(201).send(JSON.stringify({aGradeBooks}));
        } catch (e) {
            tracer.catching("/gradebook", e);
            next(e);
        }
    });

    app.post("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oGradeBook = _prepareObject(req.body, req);
            oGradeBook.grdid = await db.getNextval("grdid");

            const sSql = "INSERT INTO \"GRADEBOOK\" VALUES(?,?,?,?)";
            const aValues = [ oGradeBook.grdid, oGradeBook.studid, oGradeBook.stdate, oGradeBook.course ];

            console.log(aValues);
            console.log(sSql);
            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oGradeBook));
        } catch (e) {
            next(e);
        }
    });

    app.put("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oGradeBook = _prepareObject(req.body, req);
            const sSql = "UPDATE \"ADDRESS\" SET \"STUDID\" = ? , \"STDATE\" = ?, \"COURSE\" = ? WHERE \"GRDID\" = ?";
            const aValues = [ oGradeBook.studid, oGradeBook.stdate, oGradeBook.course, oGradeBook.grdid ];

            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(200).send(JSON.stringify(oGradeBook));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
