const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all habits for a user
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.userId });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habits', error: error.message });
  }
});

// Create a new habit
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, frequency, reminderTime, difficulty } = req.body;
    
    const habit = new Habit({
      user: req.user.userId,
      title,
      description,
      category,
      frequency,
      reminderTime,
      difficulty,
      points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating habit', error: error.message });
  }
});

// Mark habit as complete for today
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const todayCompletion = habit.completions.find(c => 
      new Date(c.date).setHours(0, 0, 0, 0) === today.getTime()
    );

    if (!todayCompletion) {
      habit.completions.push({ date: today, completed: true });
      habit.streak = habit.updateStreak(true);
      await habit.save();

      // Update user experience and check for level up
      const points = habit.calculatePoints();
      const user = await User.findById(req.user.userId);
      user.experience += points;
      user.streakPoints += 1;

      // Level up logic (every 100 experience points)
      if (user.experience >= user.level * 100) {
        user.level += 1;
        // Add achievement for leveling up
        user.achievements.push({
          name: `Reached Level ${user.level}`,
          unlockedAt: new Date()
        });
      }

      // Check for streak-based badges
      if (habit.streak >= 30 && !user.badges.includes('consistent')) {
        user.badges.push('consistent');
      }
      if (habit.streak >= 100 && !user.badges.includes('master')) {
        user.badges.push('master');
      }

      await user.save();

      res.json({
        habit,
        pointsEarned: points,
        newLevel: user.level,
        newExperience: user.experience
      });
    } else {
      res.status(400).json({ message: 'Habit already completed today' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error completing habit', error: error.message });
  }
});

// Update a habit
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'category', 'frequency', 'reminderTime', 'difficulty', 'active'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    updates.forEach(update => habit[update] = req.body[update]);
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error updating habit', error: error.message });
  }
});

// Delete a habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting habit', error: error.message });
  }
});

// Get habit statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const totalCompletions = habit.completions.filter(c => c.completed).length;
    const completionRate = totalCompletions / habit.completions.length || 0;

    res.json({
      streak: habit.streak,
      totalCompletions,
      completionRate: Math.round(completionRate * 100),
      points: habit.calculatePoints()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habit stats', error: error.message });
  }
});

module.exports = router;
