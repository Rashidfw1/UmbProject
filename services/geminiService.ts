
import { GoogleGenAI, Chat } from "@google/genai";
// Fix: Use relative paths for local module imports.
import { Product } from "../types";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: 'You are a helpful and friendly jewelry assistant for an online store called "Jewelry Umbrella". Answer questions about products, styles, and help customers choose. Keep your answers concise and friendly.',
  },
});

export const streamChatResponse = async (message: string) => {
    const result = await chat.sendMessageStream({ message });
    return result;
}

export const findSimilarProductsByImage = async (base64Image: string, mimeType: string, products: Product[]) => {
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
        return Array.isArray(ids) ? ids : [];
    } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        return [];
    }
}