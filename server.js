require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB Atlas Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Score Schema
const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create index for faster queries
scoreSchema.index({ score: -1 });

const Score = mongoose.model('Score', scoreSchema);

// ==================== API ROUTES ====================

// Get Top 10 Scores
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .select('name score date -_id');

    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Add New Score
app.post('/api/scores', async (req, res) => {
  try {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
      return res.status(400).json({
        error: 'Invalid data',
      });
    }

    const newScore = new Score({
      name: name.trim(),
      score,
    });

    await newScore.save();

    const topScores = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .select('name score date -_id');

    res.json({
      success: true,
      scores: topScores,
    });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({
      error: 'Failed to save score',
    });
  }
});

// Get Scores of Specific Player
app.get('/api/scores/:name', async (req, res) => {
  try {
    const playerScores = await Score.find({
      name: new RegExp(`^${req.params.name}$`, 'i'),
    })
      .sort({ score: -1 })
      .limit(10)
      .select('score date -_id');

    res.json(playerScores);
  } catch (error) {
    console.error('Error fetching player scores:', error);
    res.status(500).json({
      error: 'Failed to fetch player scores',
    });
  }
});

// Delete All Scores (Testing)
app.delete('/api/scores/reset/all', async (req, res) => {
  try {
    await Score.deleteMany({});
    res.json({
      success: true,
      message: 'All scores deleted',
    });
  } catch (error) {
    console.error('Error deleting scores:', error);
    res.status(500).json({
      error: 'Failed to delete scores',
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb:
      mongoose.connection.readyState === 1
        ? 'Connected'
        : 'Disconnected',
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

// Graceful Shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('\n👋 MongoDB connection closed');
  process.exit(0);
});
