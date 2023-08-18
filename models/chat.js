// Connect to MongoDB using provided URL
const mongoose = require("mongoose");
const dbConnectionURL = process.env.MONGODB_URI;

mongoose.connect(dbConnectionURL)
.then(() => {
    console.log("Successfully connected to MongoDB");
})
.catch(() => {
    console.log("Error connecting to MongoDB");
});

// Define chat schema
const chatSchema = new mongoose.Schema({
    user: String,
    system: String,
});

// Create Chat model from schema
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;