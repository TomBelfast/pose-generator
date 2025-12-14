
import { logger } from "../utils/logger";
import { API_BASE_URL } from "../constants";

// Rate limiting configuration for Client-side queueing
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
      logger.debug(`🔍 RATE_LIMIT: Waiting ${Math.ceil(waitTime / 1000)}s before next request`);
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
        logger.debug(`🔍 RETRY: Rate limit hit, retrying in ${Math.ceil(delay / 1000)}s (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // If it's not a rate limit error or we've exhausted retries, throw
      throw error;
    }
  }

  throw lastError!;
};

export const generateImageFromPose = async (
  base64Image: string,
  mimeType: string,
  posePrompt: string,
  ratio: string = '1:1'
): Promise<string> => {
  // Update API status
  apiStatus.totalRequests++;
  apiStatus.lastRequestTime = Date.now();

  // Use retry mechanism with exponential backoff
  try {
    return await retryWithBackoff(async () => {
      logger.debug("Sending request to Backend API...");
      logger.debug("Aspect ratio:", ratio);

      const response = await fetch(`${API_BASE_URL}/api/generate-pose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image,
          mimeType,
          posePrompt,
          ratio
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.imageData) {
        throw new Error("No image data received from backend");
      }

      logger.debug("Received image data from backend");
      apiStatus.successfulRequests++;
      return data.imageData;
    });
  } catch (error) {
    logger.error("Error generating image:", error);

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
        throw new Error("❌ Błąd autoryzacji API. (Authentication error)");
      } else if (error.message.includes('No image was generated')) {
        throw new Error("🖼️ Nie udało się wygenerować obrazu. Spróbuj z inną pozycją. (Image generation failed)");
      } else {
        throw new Error(`❌ Błąd generacji obrazu: ${error.message}`);
      }
    }

    throw new Error("❌ Nieznany błąd podczas generowania obrazu. (Unknown error)");
  }
};
