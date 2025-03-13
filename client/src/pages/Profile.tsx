import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Whatshot as StreakIcon,
  Star as StarIcon,
  ExitToApp as LogoutIcon,
  EmojiFlags as BadgeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';

interface Achievement {
  name: string;
  description: string;
  unlockedAt: string;
}

interface Progress {
  nextLevel: {
    current: number;
    required: number;
    percentage: number;
  };
  streaks: {
    longest: number;
    total: number;
  };
  nextBadges: Array<{
    name: string;
    description: string;
    progress: number;
    current: number;
    required: number;
  }>;
  recentAchievements: Achievement[];
}

const Profile: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchProgress();
    }
  }, [token]);

  const fetchProgress = async () => {
    if (!token) return;

    try {
      const response = await axios.get<Progress>('http://localhost:5000/api/achievements/progress', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching progress:', error);
      setError('Failed to load progress data. Please try again later.');
    }
  };

  const handleLogout = () => {
    try {
      logout();
      setSuccess('Successfully logged out');
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout. Please try again.');
    }
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
          Please log in to view your profile
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
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

        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ position: 'absolute', right: 16, top: 16 }}
            >
              Logout
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h4">{user.username}</Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Level {user.level} • {user.badges?.length ?? 0} Badges
                </Typography>
              </Box>
            </Box>
            {progress && (
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Progress to Level {user.level + 1}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress.nextLevel.percentage}
                  sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                  {progress.nextLevel.current} / {progress.nextLevel.required} XP
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>

        <Grid container spacing={3}>
          {/* Stats Section */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistics
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TrophyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Total Experience"
                        secondary={`${user.experience ?? 0} XP`}
                      />
                    </ListItem>
                    {progress && (
                      <>
                        <ListItem>
                          <ListItemIcon>
                            <StreakIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Longest Streak"
                            secondary={`${progress.streaks.longest} days`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <StarIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Total Streaks"
                            secondary={`${progress.streaks.total} streaks`}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Next Badges Section */}
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Next Badges
                  </Typography>
                  {progress?.nextBadges.length === 0 ? (
                    <Typography color="textSecondary">
                      You've unlocked all available badges!
                    </Typography>
                  ) : (
                    <List>
                      {progress?.nextBadges.map((badge, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <BadgeIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={badge.name}
                            secondary={
                              <>
                                <Typography variant="body2" color="textSecondary">
                                  {badge.description}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(badge.current / badge.required) * 100}
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {badge.current} / {badge.required}
                                  </Typography>
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Recent Achievements */}
          {progress?.recentAchievements && progress.recentAchievements.length > 0 && (
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Achievements
                    </Typography>
                    <List>
                      {progress.recentAchievements.map((achievement, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <TrophyIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={achievement.name}
                            secondary={
                              <>
                                <Typography variant="body2" color="textSecondary">
                                  {achievement.description}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default Profile;
