import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  CheckCircleOutline as UncheckIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';

interface Habit {
  _id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  completed: boolean;
  lastCompletedAt: string | null;
  createdAt: string;
}

interface HabitFormData {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

const Habits: React.FC = () => {
  const { token, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    description: '',
    frequency: 'daily',
  });

  useEffect(() => {
    fetchHabits();
  }, [token]);

  const fetchHabits = async () => {
    if (!token) return;

    try {
      const response = await axios.get<Habit[]>('http://localhost:5000/api/habits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHabits(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError('Failed to load habits. Please try again later.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
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
      
      fetchHabits();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving habit:', err);
      setError('Failed to save habit. Please try again.');
    }
  };

  const handleToggleComplete = async (habit: Habit) => {
    if (!token) return;

    try {
      await axios.post(
        `http://localhost:5000/api/habits/${habit._id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchHabits();
      setSuccess(habit.completed ? 'Habit marked as incomplete' : 'Habit completed! Keep up the good work!');
    } catch (err) {
      console.error('Error toggling habit:', err);
      setError('Failed to update habit status. Please try again.');
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this habit?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/habits/${habitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHabits();
      setSuccess('Habit deleted successfully');
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError('Failed to delete habit. Please try again.');
    }
  };

  const handleOpenDialog = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
      });
    } else {
      setEditingHabit(null);
      setFormData({
        name: '',
        description: '',
        frequency: 'daily',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingHabit(null);
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
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
          onClick={() => window.location.href = '/auth'}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">Your Habits</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add New Habit
            </Button>
          </Paper>
        </motion.div>

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

        {/* Habits Grid */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {habits.map((habit) => (
              <Grid item xs={12} sm={6} md={4} key={habit._id}>
                <motion.div
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          {habit.name}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(habit)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(habit._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        {habit.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ mr: 1 }}
                        >
                          {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ ml: 'auto' }}
                        >
                          Streak: {habit.streak}
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant={habit.completed ? 'contained' : 'outlined'}
                        color={habit.completed ? 'success' : 'primary'}
                        onClick={() => handleToggleComplete(habit)}
                        startIcon={habit.completed ? <CheckIcon /> : <UncheckIcon />}
                      >
                        {habit.completed ? 'Completed' : 'Mark Complete'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {/* Add/Edit Habit Dialog */}
        <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Habit Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  label="Frequency"
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default Habits;
