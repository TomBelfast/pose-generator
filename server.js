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

// Middleware
app.use(cors());
app.use(express.json());

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
        limit: 10,
        remaining: 10,
        resetAt: null
      });
    }
    
    // Check if daily limit needs reset
    user = await checkAndResetDailyLimit(user);
    
    const remaining = Math.max(0, 10 - user.dailyImageCount);
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
      limit: 10,
      remaining,
      resetAt: resetAt.toISOString()
    });
  } catch (error) {
    console.error('Error getting user limit:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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
    console.error('Error creating/updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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
    if (user.dailyImageCount + count > 10) {
      return res.status(429).json({
        success: false,
        error: 'Daily limit exceeded',
        limit: 10,
        current: user.dailyImageCount,
        remaining: Math.max(0, 10 - user.dailyImageCount)
      });
    }
    
    // Increment count
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyImageCount: user.dailyImageCount + count
      }
    });
    
    const remaining = Math.max(0, 10 - updatedUser.dailyImageCount);
    
    console.log('🔍 API: Count incremented successfully:', { 
      limit: 10, 
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
      limit: 10,
      remaining
    });
  } catch (error) {
    console.error('Error incrementing count:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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
