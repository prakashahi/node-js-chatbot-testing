// Import and configure OpenAI API
const { Configuration, OpenAIApi } = require("openai");

// Set up and export OpenAI instance
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

module.exports = openai;