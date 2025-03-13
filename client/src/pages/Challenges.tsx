import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: string;
  requirements: {
    habitCategory?: string;
    targetStreak?: number;
    completionCount?: number;
  };
  reward: {
    experiencePoints: number;
    badge?: string;
    streakBonus?: number;
  };
  startDate: string;
  endDate: string;
  participants: {
    user: {
      _id: string;
      username: string;
      level: number;
    };
    progress: number;
    completed: boolean;
  }[];
}

interface LeaderboardPlayer {
  _id: string;
  username: string;
  level: number;
  experience: number;
  badges: number;
  streakPoints: number;
}

const Challenges: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchChallenges();
      fetchLeaderboard();
    }
  }, [token]);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get<Challenge[]>('http://localhost:5000/api/challenges/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to load challenges. Please try again later.');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get<LeaderboardPlayer[]>('http://localhost:5000/api/achievements/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard. Please try again later.');
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      await axios.post(
        `http://localhost:5000/api/challenges/${challengeId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchChallenges();
      setSuccess('Successfully joined the challenge!');
      setError('');
    } catch (error) {
      console.error('Error joining challenge:', error);
      setError('Failed to join challenge. Please try again.');
    }
  };

  const updateProgress = async (challengeId: string, progress: number) => {
    try {
      await axios.post(
        `http://localhost:5000/api/challenges/${challengeId}/progress`,
        { progress },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchChallenges();
      setSuccess('Progress updated successfully!');
      setError('');
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to update progress. Please try again.');
    }
  };

  const isParticipating = (challenge: Challenge) => {
    if (!user) return false;
    return challenge.participants.some(p => p.user._id === user.id);
  };

  const getProgress = (challenge: Challenge) => {
    if (!user) return 0;
    const participant = challenge.participants.find(p => p.user._id === user.id);
    return participant?.progress ?? 0;
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Please log in to view challenges
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
      <Typography variant="h4" gutterBottom>
        Challenges & Leaderboard
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Active Challenges" />
        <Tab label="Leaderboard" />
      </Tabs>

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

      <AnimatePresence mode="wait">
        {activeTab === 0 ? (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Grid container spacing={3}>
              {challenges.map((challenge) => (
                <Grid item xs={12} md={6} key={challenge._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrophyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">{challenge.title}</Typography>
                      </Box>
                      <Typography color="textSecondary" paragraph>
                        {challenge.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          icon={<StarIcon />}
                          label={`${challenge.reward.experiencePoints} XP`}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        {challenge.reward.badge && (
                          <Chip
                            label={`Badge: ${challenge.reward.badge}`}
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>
                      {isParticipating(challenge) && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Progress: {getProgress(challenge)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getProgress(challenge)}
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      {!isParticipating(challenge) ? (
                        <Button
                          variant="contained"
                          onClick={() => joinChallenge(challenge._id)}
                          startIcon={<GroupIcon />}
                        >
                          Join Challenge
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={() => updateProgress(challenge._id, getProgress(challenge) + 10)}
                          disabled={getProgress(challenge) >= 100}
                        >
                          Update Progress
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        ) : (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Paper elevation={2}>
              <List>
                {leaderboard.map((player, index) => (
                  <ListItem
                    key={player._id}
                    sx={{
                      bgcolor: player.username === user.username ? 'action.selected' : 'transparent',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: index < 3 ? 'primary.main' : 'secondary.main',
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={player.username}
                      secondary={`Level ${player.level} • ${player.experience} XP • ${player.badges} Badges`}
                    />
                    <Box>
                      <Typography variant="h6" color="primary">
                        {player.streakPoints} pts
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Challenges;
