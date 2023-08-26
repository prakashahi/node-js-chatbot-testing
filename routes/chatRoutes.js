// Import necessary modules and models
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const openai = require("../utils/openaiUtils");
const Chat = require("../models/chat");

// Serve index.html
router.get("/", (req, res) => {
    res.sendFile("index.html");
});

// Handle chat API endpoint
router.post("/api/chat", async (req, res) => {
    try {
        // Read initial content from file or handle error
        let fileContent = "";
        const filePath = path.join(__dirname, "../franks.txt");
        try {
            fileContent = fs.readFileSync(filePath, "utf-8");
        } catch (error) {
            console.log("Error reading the file");
        }

        // Set up chat history with system's initial response
        const chatHistory = [{ role: "system", content: fileContent }];

        // Add user's message to chat history
        const { userMessage } = req.body;
        chatHistory.push({ role: "user", content: userMessage });
        // Request AI response
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: chatHistory
        });

        // Handle AI response and save chat log
        if (response.data.error) {
            throw new Error(response.data.error.message.trim());
        }

        const chatResponse = response.data.choices[0].message.content.trim();
        chatHistory.push({ role: "system", content: chatResponse });

        const chatLog = new Chat({ user: userMessage, system: chatResponse });

        try {
            await chatLog.save();
        } catch (error) {
            console.log("Couldn't save chat log to the database");
        }
        
        // Send AI response to client
        res.json({ message: chatResponse });
    } catch (error) {
        res.status(500).json({ message: "An error occurred during processing the request." });
    }
});

module.exports = router;