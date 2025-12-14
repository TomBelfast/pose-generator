import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4999;
const isDev = process.env.NODE_ENV !== 'production';

// Helper for safe error handling
const handleError = (res, error, message = 'Internal server error') => {
  console.error(message, error);
  res.status(500).json({
    success: false,
    error: isDev ? error.message : message
  });
};

// Middleware
app.use(cors());
app.use(express.json());

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
    const { count = 1 } = req.body;

    console.log('🔍 API: Increment count request:', { clerkId, count });

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

    console.log('🔍 API: Count incremented successfully:', {
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

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
