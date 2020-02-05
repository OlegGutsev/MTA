"use strict";

const dbClass = require(global.__base + "utils/dbClass");
const hdbext = require("@sap/hdbext");
//const COMMON = require(global.__base + "utils/common");

const ENTITY = [ { STUDENT:   "Student" },
                 { ADDRESS:   "Address" },
                 { GRADEBOOK: "GradeBook" },
                 { SUBJECT:   "Subject"} ];

const getLangClause = sLang => [{ref: ["lang"]}, "=", {val: sLang}];

module.exports = function () {
    this.before("READ", req => {
        req.log.debug(`BEFORE_READ ${req.target["@Common.Label"]}`);

     //   COMMON.checkOdataAuth(req, "himta.view");
    });

    this.on("CREATE", ENTITY.STUDENT, async (Student) => {

        COMMON.checkOdataAuth(req, "himta.edit");
        req.log.debug(`ON CREATE ${req.target["@Common.Label"]}`);

        const {
            data
        } = Student;
        if (data.length < 1) {
            return null;
        }

        var client = await dbClass.createConnection();
        let db = new dbClass(client);

        if (!data.STUDID) {
            data.STUDID = await db.getNextval("studid");
        }

        const sSql = `INSERT INTO "STUDENT" VALUES(?,?,?,?)`
        const aValues = [Student.studid, Student.name,  Student.surnm, Student.age];

        req.log.debug(aValues);
        req.log.debug(sSql);
        await db.executeUpdate(sSql, aValues);

        return data;
    });


    this.after("READ", "Student", (entity) => {
        if (entity.length > 0) {
            // entity.forEach(item => item.mandt = "");
            //entity.forEach(item => item.name = "");
        }
    });

    this.after("READ", "Address", (entity) => {
        if (entity.length > 0) {
            // entity.forEach(item => item.mandt = "");
            //entity.forEach(item => item.name = "");
        }
    });

    this.after("READ", "Subject", (entity) => {
        if (entity.length > 0) {
            // entity.forEach(item => item.mandt = "");
            //entity.forEach(item => item.name = "");
        }
    });

    this.after("READ", "GradeBook", (entity) => {
        if (entity.length > 0) {
            // entity.forEach(item => item.mandt = "");
            //entity.forEach(item => item.name = "");
        }
    });

};
