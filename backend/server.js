const express = require("express");
const path = require("path");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 10000;;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "You are Lingua AI, a friendly English tutor. Reply naturally in English. Correct important grammar mistakes and briefly explain them.",
      input: message,
    });

    res.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong with the AI request.",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Lingua AI backend running on 0.0.0.0:${port}`);
});
