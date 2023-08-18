// Import necessary modules and routes
require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const routes = require("../routes/chatRoutes");

// Import and use chat routes
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

// Export configured app
module.exports = app;