import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Card,
  CardContent,
  Badge,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from 'context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Grid container spacing={3}>
        {/* User Progress Section */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Your Progress
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Level {user?.level}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(user?.experience ?? 0) % 100}
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {(user?.experience ?? 0) % 100}/100 XP to next level
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* Badges Section */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Your Badges
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {user?.badges?.map((badge, index) => (
                  <Grid item key={index}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="standard"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Card sx={{ width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CardContent>
                            <Typography variant="body2" align="center">
                              {badge}
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Badge>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Recent Activity
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Placeholder for recent activities */}
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'background.default' }}>
                    <CardContent>
                      <Typography variant="body1">
                        Welcome to your habit tracking journey! Start by adding some habits to track.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default Dashboard;
