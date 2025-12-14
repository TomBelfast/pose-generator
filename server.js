import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI, Modality } from "@google/genai";
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/serverLogger.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4999;
const isDev = process.env.NODE_ENV !== 'production';

// Initialize Gemini
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  logger.error("VITE_GEMINI_API_KEY is not set in environment variables!");
}
const ai = new GoogleGenAI({ apiKey });

// Helper for safe error handling
const handleError = (res, error, message = 'Internal server error') => {
  logger.error(message, error);
  res.status(500).json({
    success: false,
    error: isDev ? error.message : message
  });
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for images

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Helper: Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return xss(str.trim());
};

// Rate limiting
// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs (increased for dev/usage)
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const incrementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Increased limit for increment endpoint
  message: {
    success: false,
    error: 'Too many increment requests, please try again later.'
  }
});

// Validation helpers
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidClerkId = (id) => {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
};

// Helper function to check if user needs daily reset
async function checkAndResetDailyLimit(user) {
  const today = new Date();
  const lastReset = new Date(user.lastResetDate);

  // Check if it's a new day (different date)
  if (today.toDateString() !== lastReset.toDateString()) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyImageCount: 0,
        lastResetDate: today
      }
    });
    return { ...user, dailyImageCount: 0, lastResetDate: today };
  }

  return user;
}

// Get user limit status
app.get('/api/user-limit/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;

    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return res.json({
        success: true,
        user: null,
        limit: 20,
        remaining: 20,
        resetAt: null
      });
    }

    // Check if daily limit needs reset
    user = await checkAndResetDailyLimit(user);

    const remaining = Math.max(0, 20 - user.dailyImageCount);
    const resetAt = new Date(user.lastResetDate);
    resetAt.setDate(resetAt.getDate() + 1);
    resetAt.setHours(0, 0, 0, 0);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        dailyImageCount: user.dailyImageCount
      },
      limit: 20,
      remaining,
      resetAt: resetAt.toISOString()
    });
  } catch (error) {
    handleError(res, error, 'Error getting user limit');
  }
});

// Helper to create image part
const fileToGenerativePart = (base64, mimeType) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

// Generate image endpoint
app.post('/api/generate-pose', async (req, res) => {
  try {
    let { base64Image, mimeType, posePrompt, ratio = '1:1' } = req.body;

    if (!base64Image || !mimeType || !posePrompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // Input Validation & Sanitization
    posePrompt = sanitizeString(posePrompt);

    if (posePrompt.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Pose prompt too long (max 500 characters)'
      });
    }

    // Basic Base64 Validation
    const base64Size = Buffer.from(base64Image, 'base64').length;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (base64Size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'Image too large (max 10MB)'
      });
    }

    logger.debug("Generating image with prompt:", posePrompt);

    // Prompt logic
    let finalPrompt = posePrompt;
    if (posePrompt.toLowerCase().includes('swimming')) {
      logger.debug("Detected swimming prompt, trying alternative formulations");
      finalPrompt = "a character in a swimming pose, arms extended forward, body horizontal, as if gliding through water";
    }

    const model = 'gemini-2.5-flash-image-preview';
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const textPart = { text: `Recreate the character in this image in a new image, with the character in the following pose: ${finalPrompt}. Maintain the character's appearance and style. Generate the image with ${ratio} aspect ratio (${ratio === '9:16' ? 'portrait/vertical' : ratio === '16:9' ? 'landscape/horizontal' : 'square'} format).` };

    // Call Gemini API
    let response;
    try {
      response = await ai.models.generateContent({
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

      // Debug: Log response structure
      logger.debug("API Response received");
      logger.debug("Candidates length:", response.candidates?.length);
      logger.debug("First candidate parts:", response.candidates?.[0]?.content?.parts?.length);

      // Check for errors in response
      if (response.error) {
        logger.error("Gemini API returned error:", response.error);
        return res.status(500).json({
          success: false,
          error: JSON.stringify(response.error)
        });
      }

    } catch (apiError) {
      logger.error("Gemini API call failed:", apiError.message);
      logger.error("Full error:", apiError);
      return res.status(500).json({
        success: false,
        error: apiError.message || 'Failed to generate image'
      });
    }

    // Process response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        logger.debug("Found image data in response");
        return res.json({
          success: true,
          imageData: part.inlineData.data
        });
      }
    }

    logger.error("No image data found in response parts");
    res.status(500).json({
      success: false,
      error: 'No image generated'
    });

  } catch (error) {
    if (error.message && (error.message.includes('rate limit') || error.message.includes('429'))) {
      return res.status(429).json({
        success: false,
        error: 'Gemini API rate limit exceeded'
      });
    }
    handleError(res, error, 'Error generating image');
  }
});

// Create or update user
app.post('/api/user', async (req, res) => {
  try {
    const { clerkId, email } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({
        success: false,
        error: 'clerkId and email are required'
      });
    }

    if (!isValidClerkId(clerkId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid clerkId format'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (email.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Email too long'
      });
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email },
      create: {
        clerkId,
        email,
        dailyImageCount: 0,
        lastResetDate: new Date()
      }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        dailyImageCount: user.dailyImageCount
      }
    });
  } catch (error) {
    handleError(res, error, 'Error creating/updating user');
  }
});

// Increment image count
app.post('/api/increment-count/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    let { count = 1 } = req.body;

    // Validation for count
    count = parseInt(count, 10);
    if (isNaN(count) || count < 1 || count > 20) {
      return res.status(400).json({
        success: false,
        error: 'Count must be a number between 1 and 20'
      });
    }

    logger.debug('🔍 API: Increment count request:', { clerkId, count });

    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if daily limit needs reset
    user = await checkAndResetDailyLimit(user);

    // Check if user has reached daily limit
    if (user.dailyImageCount + count > 20) {
      return res.status(429).json({
        success: false,
        error: 'Daily limit exceeded',
        limit: 20,
        current: user.dailyImageCount,
        remaining: Math.max(0, 20 - user.dailyImageCount)
      });
    }

    // Increment count
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyImageCount: user.dailyImageCount + count
      }
    });

    const remaining = Math.max(0, 20 - updatedUser.dailyImageCount);

    logger.debug('🔍 API: Count incremented successfully:', {
      limit: 20,
      current: updatedUser.dailyImageCount,
      remaining
    });

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        dailyImageCount: updatedUser.dailyImageCount
      },
      limit: 20,
      remaining
    });
  } catch (error) {
    handleError(res, error, 'Error incrementing count');
  }
});

// Health check - must be before catch-all route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all non-API routes
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  const isDev = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 API server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
