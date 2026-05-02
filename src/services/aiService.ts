import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are "Healthu", the friendly and professional AI health companion for MedVault.
MedVault is a digital health record system. 
Your goal is to help users manage their health records, understand medical terms, and provide general wellness tips.
Strict Rules:
1. Always state that you are an AI, not a doctor.
2. For emergencies, tell the user to call 911 or their local emergency number immediately.
3. Do not provide specific medical diagnoses.
4. If a user asks about their MedVault data, explain that they can see it in their dashboard or timeline.
5. Be concise, empathetic, and encouraging.
6. Use simple language.`;

export async function chatWithHealthu(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[] = []) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      history: history,
    });

    const result = await chat.sendMessage(message);
    return result.text;
  } catch (error) {
    console.error("Healthu API Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
