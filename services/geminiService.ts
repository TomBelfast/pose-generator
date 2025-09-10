
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please create a .env file with your Gemini API key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Rate limiting configuration for Gemini 2.5 Flash
const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 8, // Leave some buffer below the 10 RPM limit
  MIN_DELAY_BETWEEN_REQUESTS: 8000, // 8 seconds between requests
};

// Track request timestamps for rate limiting
let requestTimestamps: number[] = [];

// API status monitoring
let apiStatus = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  lastRequestTime: null as number | null,
  rateLimitHits: 0
};

// Helper function to get API status
export const getApiStatus = () => {
  cleanOldTimestamps();
  return {
    ...apiStatus,
    requestsInLastMinute: requestTimestamps.length,
    rateLimitRemaining: Math.max(0, RATE_LIMIT.MAX_REQUESTS_PER_MINUTE - requestTimestamps.length),
    isRateLimited: requestTimestamps.length >= RATE_LIMIT.MAX_REQUESTS_PER_MINUTE
  };
};

// Helper function to clean old timestamps
const cleanOldTimestamps = () => {
  const oneMinuteAgo = Date.now() - 60000;
  requestTimestamps = requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
};

// Helper function to wait for rate limit
const waitForRateLimit = async () => {
  cleanOldTimestamps();
  
  // If we're at the limit, wait
  if (requestTimestamps.length >= RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
    const oldestRequest = Math.min(...requestTimestamps);
    const waitTime = 60000 - (Date.now() - oldestRequest) + 1000; // Add 1 second buffer
    
    if (waitTime > 0) {
      console.log(`🔍 RATE_LIMIT: Waiting ${Math.ceil(waitTime / 1000)}s before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      cleanOldTimestamps();
    }
  }
  
  // Add current request timestamp
  requestTimestamps.push(Date.now());
};

// Retry mechanism with exponential backoff
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a rate limit error
      const isRateLimitError = error instanceof Error && (
        error.message.includes('rate limit') ||
        error.message.includes('quota') ||
        error.message.includes('429') ||
        error.message.includes('too many requests')
      );
      
      if (isRateLimitError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000; // Add jitter
        console.log(`🔍 RETRY: Rate limit hit, retrying in ${Math.ceil(delay / 1000)}s (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's not a rate limit error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError!;
};

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const generateImageFromPose = async (
  base64Image: string,
  mimeType: string,
  posePrompt: string,
  ratio: string = '1:1'
): Promise<string> => {
  // Try different models for swimming prompts
  const model = 'gemini-2.5-flash-image-preview';
  console.log("🔍 DEBUG: Using model:", model);
  
  console.log("🔍 DEBUG: Starting image generation");
  console.log("🔍 DEBUG: API Key exists:", !!API_KEY);
  console.log("🔍 DEBUG: API Key length:", API_KEY?.length || 0);
  console.log("🔍 DEBUG: Model:", model);
  console.log("🔍 DEBUG: Pose prompt:", posePrompt);
  console.log("🔍 DEBUG: Image ratio:", ratio);
  console.log("🔍 DEBUG: Image size:", base64Image.length, "characters");
  console.log("🔍 DEBUG: MIME type:", mimeType);
  
  // Wait for rate limit before making request
  await waitForRateLimit();
  
  // Update API status
  apiStatus.totalRequests++;
  apiStatus.lastRequestTime = Date.now();
  
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  // Try different prompt variations for swimming
  let finalPrompt = posePrompt;
  if (posePrompt.toLowerCase().includes('swimming')) {
    console.log("🔍 DEBUG: Detected swimming prompt, trying alternative formulations");
    // Try a more descriptive swimming prompt
    finalPrompt = "a character in a swimming pose, arms extended forward, body horizontal, as if gliding through water";
  }
  
  const textPart = { text: `Recreate the character in this image in a new image, with the character in the following pose: ${finalPrompt}. Maintain the character's appearance and style. Generate the image with ${ratio} aspect ratio (${ratio === '9:16' ? 'portrait/vertical' : ratio === '16:9' ? 'landscape/horizontal' : 'square'} format).` };
  
  console.log("🔍 DEBUG: Final prompt being sent:", finalPrompt);

  // Use retry mechanism with exponential backoff
  try {
    return await retryWithBackoff(async () => {
    console.log("🔍 DEBUG: Sending request to Gemini API...");
    console.log("🔍 DEBUG: Aspect ratio:", ratio);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        parameters: {
          aspectRatio: ratio
        }
      },
    });

    console.log("🔍 DEBUG: Received response from Gemini API");
    console.log("🔍 DEBUG: Response structure:", {
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length || 0,
      firstCandidate: response.candidates?.[0] ? {
        hasContent: !!response.candidates[0].content,
        hasParts: !!response.candidates[0].content?.parts,
        partsLength: response.candidates[0].content?.parts?.length || 0
      } : null
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      console.log("🔍 DEBUG: Processing part:", {
        hasInlineData: !!part.inlineData,
        hasText: !!part.text,
        partType: part.inlineData ? 'image' : part.text ? 'text' : 'unknown'
      });
      
      if (part.inlineData) {
        console.log("🔍 DEBUG: Found image data, size:", part.inlineData.data.length);
        apiStatus.successfulRequests++;
        return part.inlineData.data;
      }
    }
    
    console.error("🔍 DEBUG: No image data found in response parts");
    throw new Error("No image was generated in the API response.");
    });
  } catch (error) {
    console.error("🔍 DEBUG: Error generating image with Gemini:", error);
    
    // Update API status
    apiStatus.failedRequests++;
    
    // Check if it's a rate limit error
    if (error instanceof Error && (
      error.message.includes('rate limit') || 
      error.message.includes('quota') || 
      error.message.includes('429')
    )) {
      apiStatus.rateLimitHits++;
    }
    
    // Provide user-friendly error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('quota') || error.message.includes('429')) {
        throw new Error("⚠️ Przekroczono limit zapytań API. Spróbuj ponownie za chwilę. (Rate limit exceeded)");
      } else if (error.message.includes('API key') || error.message.includes('authentication')) {
        throw new Error("❌ Błąd autoryzacji API. Sprawdź klucz API. (Authentication error)");
      } else if (error.message.includes('No image was generated')) {
        throw new Error("🖼️ Nie udało się wygenerować obrazu. Spróbuj z inną pozycją. (Image generation failed)");
      } else {
        throw new Error(`❌ Błąd generacji obrazu: ${error.message}`);
      }
    }
    
    throw new Error("❌ Nieznany błąd podczas generowania obrazu. (Unknown error)");
  }
};
