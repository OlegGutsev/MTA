/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";

const express = require("express");

const dbClass = require(global.__base + "utils/dbClass");


function _prepareObject(oStudent, req) {
		oStudent.changedBy = "DebugUser";
    return oStudent;
}


module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        const logger = req.loggingContext.getLogger("/Application");
        logger.info('user get request');
        let tracer = req.loggingContext.getTracer(__filename);
        tracer.entering("/student", req, res);

        try {
            const db = new dbClass(req.db);
            const oStudent = _prepareObject(req.body, req);

            const sSql = "SELECT * FROM \"STUDENT\" ";
            const aStudents = await db.executeUpdate(sSql, []);

            tracer.exiting("/student", aStudents);
            res.type("application/json").status(201).send(JSON.stringify({aStudents}));
        } catch (e) {
            tracer.catching("/student", e);
            next(e);
        }
    });

    app.post("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oStudent = _prepareObject(req.body, req);
            oStudent.studid = await db.getNextval("studid");

            const sSql = "INSERT INTO \"STUDENT\" VALUES(?,?,?,?)";
						const aValues = [ oStudent.studid, oStudent.name, oStudent.surNm, oStudent.age ];

						console.log(aValues);
						console.log(sSql);
            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(201).send(JSON.stringify(oStudent));
        } catch (e) {
            next(e);
        }
    });

    app.put("/", async (req, res, next) => {
        try {
            const db = new dbClass(req.db);

            const oStudent = _prepareObject(req.body, req);
            const sSql = "UPDATE \"STUDENT\" SET \"NAME\" = ? , \"SURNM\" = ?, \"AGE\" = ? WHERE \"STUDID\" = ?";
						const aValues = [ oStudent.name, oStudent.surNm, oStudent.age, oStudent.studid ];

            await db.executeUpdate(sSql, aValues);

            res.type("application/json").status(200).send(JSON.stringify(oStudent));
        } catch (e) {
            next(e);
        }
    });

    return app;
};
