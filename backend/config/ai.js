import openai from "openai";
import dotenv from "dotenv";
dotenv.config();

const configuration = new openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});


export const openaiClient = new openai.OpenAIApi(configuration);