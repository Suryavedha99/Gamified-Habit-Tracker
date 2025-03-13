const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['health', 'productivity', 'learning', 'fitness', 'other'],
    default: 'other'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  streak: {
    type: Number,
    default: 0
  },
  completions: [{
    date: Date,
    completed: Boolean
  }],
  reminderTime: {
    type: Date,
    required: false
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate points based on difficulty and streak
habitSchema.methods.calculatePoints = function() {
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2
  };
  
  const streakBonus = Math.floor(this.streak / 7) * 0.1; // 10% bonus for each week of streak
  return Math.round(this.points * difficultyMultiplier[this.difficulty] * (1 + streakBonus));
};

// Update streak based on completion
habitSchema.methods.updateStreak = function(completed) {
  if (completed) {
    this.streak += 1;
  } else {
    this.streak = 0;
  }
  return this.streak;
};

module.exports = mongoose.model('Habit', habitSchema);
