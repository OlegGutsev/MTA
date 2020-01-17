"use strict";

module.exports = (app, server) => {
    app.use("/student", require("./routes/student")());
    app.use("/address", require("./routes/address")());
    app.use("/dest", require("./routes/dest")());
    app.use("/subject", require("./routes/subject")());
    app.use("/gradebook", require("./routes/gradebook")());
    app.use("/partners", require("./routes/businessPartners")());
};
