"use strict";
const { BusinessPartner } = require('@sap/cloud-sdk-vdm-business-partner-service');
const express = require("express");
const cloudServices = require(global.__base + "utils/cloudServices");

async function getAllBusinessPartners() {

   // const oOnPremiseSystem = await cloudServices.getOnPremiseSystemById("S4G");
   // const oDestination = global.DEBUG_MODE ? oOnPremiseSystem : {destinationName: "S4G" };

   const
        destinationConfiguration={
            test : "test",
            url: "https://sapes5.sapdevcenter.com/",
            username: "c5274581",
            password: "Jktukalgas1998"
        };

// try {
//     const aData = await ODataRequest(new ODataRequestConfig('get', "/sap/opu/odata/SAP/ZGUT_TEST_MARA/ZGUT_I_CMARATP" , "json"),
//                                     oDestination)
//                     .execute();
//
    return BusinessPartner.requestBuilder()
        .getAll()
        .execute(destinationConfiguration);
}

module.exports = () => {
    const app = express.Router();

    app.get("/", async (req, res, next) => {
        getAllBusinessPartners()
            .then(businessPartners => {
                res.status(200).send(businessPartners);
            })
            .catch(error => {
                res.status(500).send(error.message);
            })
    });

    return app;
};