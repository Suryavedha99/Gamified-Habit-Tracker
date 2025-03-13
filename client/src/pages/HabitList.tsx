import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Box,
  Chip,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Habit {
  _id: string;
  title: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  streak: number;
  difficulty: HabitDifficulty;
  completions: { date: string; completed: boolean }[];
}

type HabitCategory = 'health' | 'productivity' | 'learning' | 'fitness' | 'other';
type HabitFrequency = 'daily' | 'weekly' | 'monthly';
type HabitDifficulty = 'easy' | 'medium' | 'hard';

interface FormData {
  title: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  difficulty: HabitDifficulty;
}

const HabitList: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [open, setOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'other',
    frequency: 'daily',
    difficulty: 'medium',
  });

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [token]);

  const fetchHabits = async () => {
    try {
      const response = await axios.get<Habit[]>('http://localhost:5000/api/habits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError('Failed to load habits. Please try again later.');
    }
  };

  const handleOpen = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        title: habit.title,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        difficulty: habit.difficulty,
      });
    } else {
      setEditingHabit(null);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        frequency: 'daily',
        difficulty: 'medium',
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingHabit(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      if (editingHabit) {
        await axios.put(
          `http://localhost:5000/api/habits/${editingHabit._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Habit updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/habits', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('New habit created successfully!');
      }
      await fetchHabits();
      handleClose();
    } catch (error) {
      console.error('Error saving habit:', error);
      setError('Failed to save habit. Please try again.');
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/habits/${habitId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchHabits();
      setSuccess('Habit marked as complete!');
    } catch (error) {
      console.error('Error completing habit:', error);
      setError('Failed to complete habit. Please try again.');
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/habits/${habitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchHabits();
      setSuccess('Habit deleted successfully');
    } catch (error) {
      console.error('Error deleting habit:', error);
      setError('Failed to delete habit. Please try again.');
    }
  };

  const getCategoryColor = (category: HabitCategory): string => {
    const colors: Record<HabitCategory, string> = {
      health: '#4caf50',
      productivity: '#2196f3',
      learning: '#9c27b0',
      fitness: '#f44336',
      other: '#ff9800',
    };
    return colors[category];
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Please log in to manage your habits
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/auth')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Your Habits</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Habit
        </Button>
      </Box>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Grid container spacing={3}>
        <AnimatePresence>
          {habits.map((habit) => (
            <Grid item xs={12} sm={6} md={4} key={habit._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
              >
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {habit.title}
                      </Typography>
                      <Chip
                        label={habit.category}
                        size="small"
                        sx={{ bgcolor: `${getCategoryColor(habit.category)}20`, color: getCategoryColor(habit.category) }}
                      />
                    </Box>
                    <Typography color="textSecondary" gutterBottom>
                      {habit.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Streak: {habit.streak} days
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(habit.streak % 7) * (100 / 7)}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      onClick={() => handleComplete(habit._id)}
                      color="primary"
                      title="Mark as complete"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpen(habit)}
                      color="info"
                      title="Edit habit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(habit._id)}
                      color="error"
                      title="Delete habit"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingHabit ? 'Edit Habit' : 'Create New Habit'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={!!error && !formData.title.trim()}
            helperText={error && !formData.title.trim() ? 'Title is required' : ''}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => setFormData({ ...formData, category: e.target.value as HabitCategory })}
            >
              <MenuItem value="health">Health</MenuItem>
              <MenuItem value="productivity">Productivity</MenuItem>
              <MenuItem value="learning">Learning</MenuItem>
              <MenuItem value="fitness">Fitness</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Frequency</InputLabel>
            <Select
              value={formData.frequency}
              label="Frequency"
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as HabitFrequency })}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={formData.difficulty}
              label="Difficulty"
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as HabitDifficulty })}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingHabit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HabitList;
