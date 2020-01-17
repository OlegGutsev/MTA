"use strict";
const { BusinessPartner } = require('@sap/cloud-sdk-vdm-business-partner-service');
const express = require("express");
const cloudServices = require(global.__base + "utils/cloudServices");

async function getAllBusinessPartners() {

    const oOnPremiseSystem = await cloudServices.getOnPremiseSystemById("S4G");
    const oDestination = global.DEBUG_MODE ? oOnPremiseSystem : {destinationName: "S4G" };

    return BusinessPartner.requestBuilder()
        .getAll()
        .execute(oDestination);
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