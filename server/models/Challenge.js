const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  requirements: {
    habitCategory: {
      type: String,
      enum: ['health', 'productivity', 'learning', 'fitness', 'other']
    },
    targetStreak: Number,
    completionCount: Number
  },
  reward: {
    experiencePoints: Number,
    badge: String,
    streakBonus: Number
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: Number,
    completed: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  active: {
    type: Boolean,
    default: true
  }
});

// Method to check if a challenge is currently active
challengeSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Method to calculate user progress
challengeSchema.methods.calculateProgress = function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));
  return participant ? participant.progress : 0;
};

// Static method to get active challenges
challengeSchema.statics.getActiveChallenges = function() {
  const now = new Date();
  return this.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
    active: true
  });
};

module.exports = mongoose.model('Challenge', challengeSchema);
