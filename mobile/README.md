# IELTS Vocabulary Mobile App

React Native mobile application for learning 3000 IELTS vocabulary words in 2 months with AI-powered learning.

## Features

- ✅ **User Authentication**: Secure login and registration
- 📚 **Daily Learning**: Learn 50 new words every day
- 🔄 **Spaced Repetition**: Smart review system based on SuperMemo SM-2
- 🤖 **AI Integration**: Contextual examples and quizzes via Gemini API
- 📊 **Progress Tracking**: Dashboard with stats, streaks, and mastery levels
- 🔍 **Search**: Find any word in the vocabulary database
- 📱 **Cross-Platform**: Works on iOS and Android

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **API Client**: Axios
- **Storage**: Expo SecureStore

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`
- Expo Go app on your phone (for testing)

## Installation

1. **Install dependencies**:
```bash
cd mobile
npm install
```

2. **Configure API URL**:
   - Edit `src/services/api.ts`
   - Update `API_URL` to your backend address
   - For Android emulator use: `http://10.0.2.2:3000`
   - For iOS simulator use: `http://localhost:3000`
   - For physical device: Use your computer's IP address

3. **Start the app**:
```bash
npm start
```

4. **Run on device**:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## Project Structure

```
mobile/
├── App.tsx                 # Main app component with navigation
├── src/
│   ├── screens/           # All screen components
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LearnScreen.tsx
│   │   ├── ReviewScreen.tsx
│   │   ├── ProgressScreen.tsx
│   │   └── VocabularyListScreen.tsx
│   └── services/
│       └── api.ts         # API client and endpoints
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Main Screens

### 1. Login/Register
- User authentication
- Secure token storage

### 2. Home Dashboard
- Daily streak counter
- Overall progress stats
- Quick action buttons

### 3. Learn Screen
- Flashcard-style learning
- AI-generated examples
- Quality ratings (Hard/Good/Easy)

### 4. Review Screen
- Spaced repetition reviews
- AI-generated quizzes
- Multiple choice questions

### 5. Progress Screen
- Overall progress visualization
- Recent activity log
- Mastery statistics

### 6. Vocabulary List
- Search functionality
- Browse all words
- Quick reference

## Usage Flow

1. **Register** your account
2. **Login** to start learning
3. **Check Home** for daily goals and stats
4. **Learn** 50 new words with the Learn tab
5. **Review** previous words when they're due
6. **Track Progress** on the Progress tab
7. Keep your **Streak** going every day!

## API Integration

The app connects to your backend API for:
- User authentication (JWT tokens)
- Fetching daily new words
- Getting review words based on spaced repetition
- Recording learning progress
- AI-generated content (examples, quizzes)
- Progress tracking and analytics

## Customization

### Change Daily Word Count
Update in backend `.env`:
```
DAILY_NEW_WORDS=50
```

### Modify Colors
Edit the color codes in screen stylesheets:
- Primary: `#4F46E5` (Indigo)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Error: `#EF4444` (Red)

## Building for Production

### Android APK:
```bash
expo build:android
```

### iOS IPA:
```bash
expo build:ios
```

## Troubleshooting

**Can't connect to backend:**
- Check API_URL in `src/services/api.ts`
- Make sure backend is running
- For Android emulator, use `10.0.2.2` instead of `localhost`

**Authentication errors:**
- Clear app data and re-login
- Check JWT token validity in backend

**Blank screen:**
- Check console for errors
- Restart Expo dev server
- Clear Metro bundler cache: `expo start -c`

## Future Enhancements

- [ ] Offline mode with local storage
- [ ] Audio pronunciation
- [ ] Dark mode theme
- [ ] Social features (study groups)
- [ ] Customizable study schedules
- [ ] Export progress reports

---

Happy learning! 🎓📚
