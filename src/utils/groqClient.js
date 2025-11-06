import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const getGroqCompletion = async (message) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    return completion.choices[0]?.message?.content || 'No response from AI';
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error('Failed to get AI response');
  }
};

export const getGroqStream = async (message, onChunk, onComplete) => {
  try {
    const stream = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: true,
    });

    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      onChunk(content);
    }
    
    onComplete(fullResponse);
  } catch (error) {
    console.error('Error streaming from Groq API:', error);
    throw new Error('Failed to stream AI response');
  }
};