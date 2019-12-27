"use strict";

module.exports = (app, server) => {
    app.use("/student", require("./routes/student")());
    app.use("/address", require("./routes/address")());
    app.use("/dest", require("./routes/dest")());
};
