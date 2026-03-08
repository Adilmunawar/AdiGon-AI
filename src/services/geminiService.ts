
import { supabase } from '@/integrations/supabase/client';

class GeminiService {
  async generateResponse(
    prompt: string,
    systemPrompt: string = "You are AdiGon AI, a helpful and creative assistant.",
    fileData?: any,
    modelId: string = "gemini-2.5-flash-preview-05-20"
  ): Promise<string> {
    const body: any = { prompt, systemPrompt, model: modelId, stream: false };

    if (fileData?.base64) {
      body.fileData = { base64: fileData.base64, mimeType: fileData.file?.type || 'image/png' };
    }

    const { data, error } = await supabase.functions.invoke('gemini-chat', { body });

    if (error) throw new Error(error.message || 'Failed to generate response');
    if (data?.error) throw new Error(data.error);
    return data?.text || '';
  }

  async generateStreamingResponse(
    prompt: string,
    systemPrompt: string = "You are AdiGon AI, a helpful and creative assistant.",
    onChunk: (chunk: string, fullText: string) => void,
    fileData?: any,
    modelId: string = "gemini-2.5-flash-preview-05-20"
  ): Promise<string> {
    const body: any = { prompt, systemPrompt, model: modelId, stream: true };

    if (fileData?.base64) {
      body.fileData = { base64: fileData.base64, mimeType: fileData.file?.type || 'image/png' };
    }

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Streaming request failed');
    }

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullResponse += text;
            onChunk(text, fullResponse);
          }
        } catch {
          // partial JSON, wait for more data
        }
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      for (let raw of buffer.split('\n')) {
        if (!raw || !raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullResponse += text;
            onChunk(text, fullResponse);
          }
        } catch { /* ignore */ }
      }
    }

    return fullResponse;
  }
}

export const geminiService = new GeminiService();
