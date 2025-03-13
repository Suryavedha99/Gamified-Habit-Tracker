const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all active challenges
router.get('/active', auth, async (req, res) => {
  try {
    const challenges = await Challenge.getActiveChallenges();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching challenges', error: error.message });
  }
});

// Get user's enrolled challenges
router.get('/enrolled', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.user': req.user.userId,
      active: true
    });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled challenges', error: error.message });
  }
});

// Join a challenge
router.post('/:id/join', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.isActive()) {
      return res.status(400).json({ message: 'Challenge is not active' });
    }

    // Check if user is already participating
    const isParticipating = challenge.participants.some(p => 
      p.user.toString() === req.user.userId
    );

    if (isParticipating) {
      return res.status(400).json({ message: 'Already participating in this challenge' });
    }

    challenge.participants.push({
      user: req.user.userId,
      progress: 0,
      completed: false
    });

    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Error joining challenge', error: error.message });
  }
});

// Update challenge progress
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const participant = challenge.participants.find(p => 
      p.user.toString() === req.user.userId
    );

    if (!participant) {
      return res.status(400).json({ message: 'Not participating in this challenge' });
    }

    participant.progress = progress;

    // Check if challenge is completed
    if (progress >= 100 && !participant.completed) {
      participant.completed = true;
      
      // Award rewards to user
      const user = await User.findById(req.user.userId);
      user.experience += challenge.reward.experiencePoints;
      
      if (challenge.reward.badge && !user.badges.includes(challenge.reward.badge)) {
        user.badges.push(challenge.reward.badge);
      }

      if (challenge.reward.streakBonus) {
        user.streakPoints += challenge.reward.streakBonus;
      }

      // Add achievement
      user.achievements.push({
        name: `Completed ${challenge.title}`,
        unlockedAt: new Date()
      });

      await user.save();
    }

    await challenge.save();
    res.json({
      challenge,
      completed: participant.completed,
      progress: participant.progress
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error: error.message });
  }
});

// Get challenge leaderboard
router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.user', 'username level');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const leaderboard = challenge.participants
      .sort((a, b) => b.progress - a.progress)
      .map(p => ({
        username: p.user.username,
        level: p.user.level,
        progress: p.progress,
        completed: p.completed
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

module.exports = router;
