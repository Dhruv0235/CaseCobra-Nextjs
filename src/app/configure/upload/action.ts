"use server";

import { GoogleGenAI, Modality } from "@google/genai";

export async function generateImage(textContents: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
  });

  const contents = `Hi, can you create a ${textContents} with a vertical rectangular dimensions with dimensions of 1080x1920?`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-preview-image-generation",
    contents: contents,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  //@ts-ignore
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      // Return the base64 string directly instead of converting to Buffer
      //@ts-ignore
      return imageData;
    }
  }

  throw new Error("No image generated");
}
