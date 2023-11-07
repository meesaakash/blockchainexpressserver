const express = require("express");
const router =require("./routes/index");
const app = express();

app.use(router);

app.listen(8083, () => console.log("Listening on port 8083..."));

exports.api = app
