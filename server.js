const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/dinoRunner', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Score Schema
const scoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Create index for faster queries
scoreSchema.index({ score: -1 });

const Score = mongoose.model('Score', scoreSchema);

// API Routes

// Get top 10 high scores
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

// Add new score
app.post('/api/scores', async (req, res) => {
    try {
        const { name, score } = req.body;
        
        if (!name || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid data' });
        }

        const newScore = new Score({
            name: name.trim(),
            score: score
        });

        await newScore.save();
        
        // Return updated top 10
        const topScores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .select('name score date -_id');
        
        res.json({ 
            success: true, 
            scores: topScores 
        });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// Get all scores for a specific player
app.get('/api/scores/:name', async (req, res) => {
    try {
        const playerScores = await Score.find({ 
            name: new RegExp(`^${req.params.name}$`, 'i') 
        })
        .sort({ score: -1 })
        .limit(10)
        .select('score date -_id');
        
        res.json(playerScores);
    } catch (error) {
        console.error('Error fetching player scores:', error);
        res.status(500).json({ error: 'Failed to fetch player scores' });
    }
});

// Delete all scores (optional - for testing)
app.delete('/api/scores/reset/all', async (req, res) => {
    try {
        await Score.deleteMany({});
        res.json({ success: true, message: 'All scores deleted' });
    } catch (error) {
        console.error('Error deleting scores:', error);
        res.status(500).json({ error: 'Failed to delete scores' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB: mongodb://localhost:27017/dinoRunner`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
    process.exit(0);
});