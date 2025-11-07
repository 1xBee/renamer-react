// ===== services/aiService.js =====

import { fileToBase64, getMimeType, getFileExtension, ensureExtension } from './fileSystemService';

/**
 * Calls the AI API to generate a new filename for a file
 * @param {File} fileObject - The file object to process
 * @param {string} fileName - Original filename
 * @param {string} userPrompt - User's prompt describing what they want
 * @param {string} apiKey - API key for authentication
 * @param {string} model - Model to use (e.g., 'gemini-2.0-flash-exp')
 * @returns {Promise<{newName: string, reasoning : string, rating: number}>}
 */
export const generateFileName = async (fileObject, fileName, userPrompt, apiKey, model) => {
  try {
    const ext = getFileExtension(fileName);
    const base64Data = await fileToBase64(fileObject);
    const mimeType = getMimeType(ext);
    
    // Build the full prompt with clear instructions
    const systemPrefix = "The user wants to rename this file. Their description of what the filename should be:";
    const formatInstructions = `\n\nRespond ONLY with valid JSON in this exact format:
{
  "newName": "filename_without_extension",
  "reasoning": "show reasoning  (5-10 words max)",
  "rating": 1-3
}

Rating scale: 1=uncertain/guess, 2=reasonably confident, 3=very confident
Do not include explanation outside the JSON.`;
    
    const fullPrompt = `${systemPrefix}\n\n"${userPrompt}"${formatInstructions}`;
    
    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: fullPrompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text.trim();
    
    // Parse JSON response
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanText);
    
    // Validate response structure
    if (!result.newName || typeof result.rating !== 'number') {
      throw new Error('Invalid AI response format');
    }
    console.log(result);
    // Clean and ensure extension
    result.newName = result.newName.trim();
    result.newName = ensureExtension(result.newName, ext);
    result.reasoning  = result.reasoning  || '';
    result.rating = Math.min(Math.max(result.rating, 1), 3); // Clamp between 1-3
    
    return result;
    
  } catch (error) {
    // Provide clear error messages
    if (error instanceof SyntaxError) {
      throw new Error('AI returned invalid response format');
    }
    if (error.message.includes('quota') || error.message.includes('limit')) {
      throw new Error('API quota exceeded');
    }
    if (error.message.includes('key')) {
      throw new Error('Invalid API key');
    }
    throw new Error(error.message || 'Failed to generate filename');
  }
};