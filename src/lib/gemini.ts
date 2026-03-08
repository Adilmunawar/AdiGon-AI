// This file is deprecated. All Gemini calls now go through the gemini-chat edge function.
// Keeping this file to avoid breaking imports elsewhere, but it should be migrated.

import { geminiService } from '@/services/geminiService';

export const runChat = async (
  prompt: string, 
  history: { role: string, parts: { text: string }[] }[], 
  file?: File,
  userSettings?: { responseLength?: string; codeDetailLevel?: string; aiCreativity?: number }
) => {
  try {
    let fileData = null;
    if (file && file.type.startsWith("image/")) {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
      });
      fileData = { file, base64 };
    }

    return await geminiService.generateResponse(prompt, undefined, fileData);
  } catch (error) {
    console.error("Error running chat:", error);
    return "I encountered an error. Please try again.";
  }
};
