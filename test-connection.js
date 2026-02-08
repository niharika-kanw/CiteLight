const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  token: "3URnNwNLFf5PUBXWZjSa7PTch3iTsSWAL2Tk3gIw", // Using direct key for test script to avoid env loading issues in simple script
});

async function testConnection() {
  try {
    console.log("Testing connection to Cohere API...");
    const response = await cohere.chat({
      message: "Hello, are you working?",
    });
    console.log("Success! Response from Cohere:");
    console.log(response.text);
  } catch (error) {
    console.error("Error connecting to Cohere API:", error);
  }
}

testConnection();
