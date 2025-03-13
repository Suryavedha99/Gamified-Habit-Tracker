# Gamified Habit Tracker

A modern full-stack application that transforms habit tracking into an engaging, game-like experience. Users can manage their daily habits while earning badges, climbing leaderboards, and unlocking rewards.

## Features

- 🔐 User Authentication
- 📝 Habit Management
- 🏆 Gamification Elements (Badges & Rewards)
- 📊 Progress Tracking
- 🎯 Daily, Weekly, and Monthly Challenges
- 📱 Responsive Design

## Tech Stack

- **Frontend**: React, Material-UI, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```
3. Create a .env file in the root directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start the development server:
   ```bash
   npm run dev:full
   ```

## Project Structure

```
gamified-habit-tracker/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
└── package.json
```
