import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CheckCircle as HabitIcon,
  EmojiEvents as ChallengesIcon,
  Person as ProfileIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from 'context/AuthContext';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Habits', icon: <HabitIcon />, path: '/habits' },
    { text: 'Challenges', icon: <ChallengesIcon />, path: '/challenges' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  ];

  const MotionListItem = useMemo(
    () =>
      motion(ListItem as React.ComponentType<any>),
    []
  );

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          left: isOpen ? 240 : 20,
          top: 20,
          zIndex: 1300,
          bgcolor: 'background.paper',
          boxShadow: 1,
          transition: 'left 0.3s',
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="permanent"
        sx={{
          width: isOpen ? 240 : 70,
          transition: 'width 0.3s',
          '& .MuiDrawer-paper': {
            width: isOpen ? 240 : 70,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box sx={{ p: 2, mt: 5 }}>
          {user && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Avatar
                sx={{
                  width: isOpen ? 64 : 40,
                  height: isOpen ? 64 : 40,
                  transition: 'all 0.3s',
                  mb: 1,
                }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography variant="subtitle1" noWrap>
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    Level {user.level}
                  </Typography>
                </motion.div>
              )}
            </Box>
          )}
        </Box>

        <Divider />

        <List>
          {menuItems.map((item) => (
            <MotionListItem
              key={item.text}
              button
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.02, backgroundColor: '#f0f0f0' }}
              whileTap={{ scale: 0.98 }}
              sx={{
                minHeight: 48,
                justifyContent: isOpen ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isOpen ? 3 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {isOpen && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: isOpen ? 1 : 0,
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                />
              )}
            </MotionListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Navigation;
