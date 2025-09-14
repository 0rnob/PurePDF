
import { GoogleGenAI } from "@google/genai";

/**
 * Suggests a filename for a merged PDF based on the names of the source files.
 * @param filenames An array of source PDF filenames.
 * @returns A Promise that resolves with an AI-suggested filename string.
 */
export const suggestFilename = async (filenames: string[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Gemini features are disabled.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Based on the following list of PDF filenames, suggest a single, concise, and descriptive filename for the merged document. 
  The filenames are: ${filenames.join(', ')}.
  Your response should be ONLY the filename, ending in .pdf. For example: "Financial_Report_Q1_2024.pdf".
  Do not add any other text, explanation, or markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text.trim().replace(/`/g, ''); // Clean up potential markdown backticks

    if (text && text.endsWith('.pdf') && !text.includes(' ')) {
      return text;
    } else {
      // Fallback if the response format is unexpected
      console.warn("Gemini response was not in the expected format, using fallback.", text);
      return `merged_document_${Date.now()}.pdf`;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestion from Gemini API.");
  }
};
