const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// Get user's achievements and badges
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({
      badges: user.badges,
      achievements: user.achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching achievements', error: error.message });
  }
});

// Get user's progress towards next achievements
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const habits = await Habit.find({ user: req.user.userId });

    const progress = {
      nextLevel: {
        current: user.experience,
        required: user.level * 100,
        percentage: (user.experience / (user.level * 100)) * 100
      },
      streaks: {
        longest: Math.max(...habits.map(h => h.streak)),
        total: user.streakPoints
      },
      nextBadges: []
    };

    // Calculate progress towards next badges
    if (!user.badges.includes('consistent')) {
      const maxStreak = Math.max(...habits.map(h => h.streak));
      progress.nextBadges.push({
        name: 'consistent',
        description: 'Maintain a 30-day streak',
        progress: (maxStreak / 30) * 100,
        current: maxStreak,
        required: 30
      });
    }

    if (!user.badges.includes('achiever')) {
      const totalCompletions = habits.reduce((sum, habit) => 
        sum + habit.completions.filter(c => c.completed).length, 0);
      progress.nextBadges.push({
        name: 'achiever',
        description: 'Complete 100 total habit check-ins',
        progress: (totalCompletions / 100) * 100,
        current: totalCompletions,
        required: 100
      });
    }

    if (!user.badges.includes('master')) {
      const maxStreak = Math.max(...habits.map(h => h.streak));
      progress.nextBadges.push({
        name: 'master',
        description: 'Maintain a 100-day streak',
        progress: (maxStreak / 100) * 100,
        current: maxStreak,
        required: 100
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching achievement progress', error: error.message });
  }
});

// Get global leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select('username level experience badges streakPoints')
      .sort('-experience')
      .limit(10);

    res.json(leaderboard.map(user => ({
      username: user.username,
      level: user.level,
      experience: user.experience,
      badges: user.badges.length,
      streakPoints: user.streakPoints
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

module.exports = router;
