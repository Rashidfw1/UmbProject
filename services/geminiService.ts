
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
// Fix: Use relative paths for local module imports.
import { Product } from "../types";

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;
export let isGeminiAvailable = false;

// Conditionally initialize Gemini based on API key availability
if (process.env.API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful and friendly jewelry assistant for an online store called "Jewelry Umbrella". Answer questions about products, styles, and help customers choose. Keep your answers concise and friendly.',
      },
    });
    isGeminiAvailable = true;
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI. AI features may be disabled.", e);
  }
} else {
  console.warn("API_KEY environment variable not set. Gemini AI features will be disabled.");
}

export const streamChatResponse = async (message: string) => {
    if (!chat) {
        // To avoid crashing, we can simulate a friendly error stream
        async function* errorStream(): AsyncGenerator<GenerateContentResponse, any, undefined> {
            yield {
                // Mocking the structure of GenerateContentResponse
                get text() { return "I'm sorry, the chat service is currently unavailable. Please try again later."; },
                candidates: [],
                promptFeedback: undefined,
                functionCalls: [],
                // Fix: Added missing properties to conform to the GenerateContentResponse type.
                data: undefined,
                executableCode: undefined,
                codeExecutionResult: undefined,
            };
        }
        return errorStream();
    }
    const result = await chat.sendMessageStream({ message });
    return result;
}

export const findSimilarProductsByImage = async (base64Image: string, mimeType: string, products: Product[]): Promise<string[]> => {
    if (!ai) {
        console.error("Cannot perform image search: Gemini AI is not initialized.");
        return []; // Return empty array to prevent crash
    }
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };

    // Prepare a simplified list of product info for the AI
    const productCatalog = products.map(p => ({
        id: p.id,
        name_en: p.name.en,
        name_ar: p.name.ar,
        category: p.category,
    }));

    const textPart = {
        text: `From the following product list, find the IDs of products that are visually similar to the jewelry in the image. Return only a JSON array of product IDs, like ["1", "5", "8"]. Product list: ${JSON.stringify(productCatalog)}`
    };
    
    // Fix: Correctly call generateContent with model and contents. Updated model to gemini-2.5-flash.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: 'application/json'
        }
    });

    try {
        // Fix: Correctly extract text from response
        const jsonText = response.text.trim();
        const ids = JSON.parse(jsonText);
        return Array.isArray(ids) ? ids.map(String) : [];
    } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        return [];
    }
}