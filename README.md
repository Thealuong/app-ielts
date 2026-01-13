# IELTS Vocabulary Learning Platform

Full-stack application to master 3000 IELTS vocabulary words in 2 months using AI-powered contextual learning and scientific spaced repetition.

## 🎯 Project Overview

This platform helps you:
- Learn **50 new words per day** (3000 words in 60 days)
- Practice with **AI-generated contextual examples**
- Review using **spaced repetition algorithm (SuperMemo SM-2)**
- Track progress with **detailed analytics**
- Build a **daily learning streak**

## 🏗️ Architecture

```
App ielts/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── auth/    # JWT authentication
│   │   ├── vocabulary/  # Word management
│   │   ├── progress/    # Spaced repetition & tracking
│   │   └── ai/          # Gemini API integration
│   └── sample-vocabulary.json
│
└── mobile/          # React Native app
    ├── src/
    │   ├── screens/ # UI screens
    │   └── services/ # API client
    └── App.tsx
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add:
# - Database credentials
# - Gemini API key (https://makersuite.google.com/app/apikey)

# Create database
# In MySQL: CREATE DATABASE ielts_vocabulary;

# Start server
npm run start:dev
```

Backend runs on: `http://localhost:3000`

### 2. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npm start

# Then:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Or scan QR code with Expo Go app
```

### 3. Import Vocabulary

1. Prepare your 3000-word vocabulary file in JSON format (see `backend/sample-vocabulary.json`)
2. Start the backend
3. Use POST `/vocabulary/import` endpoint

Example JSON format:
```json
[
  {
    "word": "abandon",
    "partOfSpeech": "verb",
    "definition": "to leave someone or something",
    "ipaUk": "/əˈbæn.dən/",
    "examples": ["He abandoned his family."],
    "synonyms": "desert, forsake",
    "ieltsBand": "6.0"
  }
]
```

## 💡 Key Features

### Backend (NestJS + MySQL)
- ✅ JWT Authentication
- ✅ RESTful API
- ✅ MySQL database with TypeORM
- ✅ Gemini AI integration with caching
- ✅ SuperMemo SM-2 spaced repetition
- ✅ Progress tracking & analytics

### Frontend (React Native + Expo)
- ✅ Cross-platform (iOS & Android)
- ✅ Beautiful modern UI
- ✅ Flashcard learning interface
- ✅ AI-generated examples & quizzes
- ✅ Progress dashboard
- ✅ Streak tracking
- ✅ Vocabulary search

### AI Features (Google Gemini)
- Context-based example sentences
- IELTS-style quiz generation
- Usage feedback and corrections
- Synonym/antonym explanations

## 📚 Learning Method

### Spaced Repetition Schedule
1. **First review**: 1 day after learning
2. **Second review**: 6 days later
3. **Subsequent reviews**: Based on your performance

### Mastery Levels
- 🆕 **New**: First time seeing the word
- 📖 **Learning**: Seen 1-2 times
- 🔄 **Review**: Being reinforced
- 🏆 **Mastered**: Fully learned

### Daily Routine
1. Learn 50 new words (30-40 minutes)
2. Review words due today (10-15 minutes)
3. Track your streak and progress

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS, TypeScript |
| **Database** | MySQL, TypeORM |
| **AI** | Google Gemini API |
| **Frontend** | React Native, Expo |
| **Auth** | JWT, Passport |
| **Navigation** | React Navigation |

## 📱 Mobile Screens

1. **Home** - Dashboard with stats and quick actions
2. **Learn** - Flashcard interface for new words
3. **Review** - Spaced repetition quizzes
4. **Progress** - Analytics and activity log

## 🔑 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login

### Vocabulary
- `GET /vocabulary/daily` - Get today's new words
- `GET /vocabulary/review` - Get words due for review
- `GET /vocabulary/search?q=query` - Search words

### AI
- `POST /ai/examples` - Generate contextual examples
- `POST /ai/quiz` - Generate quiz questions
- `POST /ai/explain` - Get usage feedback

### Progress
- `GET /progress/dashboard` - Get statistics
- `POST /progress/record` - Record word review

## 📊 Database Schema

**Users** → **User_Vocabulary_Progress** ← **Vocabularies**
- Tracks mastery level for each user-word pair
- Calculates next review date
- Stores performance metrics

## 🎓 Learning Strategy

To complete 3000 words in 2 months:
- **50 words/day** for 60 days
- Each word reviewed **5+ times** (spaced intervals)
- AI provides **contextual understanding**, not rote memorization
- **Streaks** motivate consistency

## 🔧 Configuration

### Backend Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=ielts_vocabulary

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# AI
GEMINI_API_KEY=your-gemini-api-key

# Learning
DAILY_NEW_WORDS=50
```

### Mobile API Configuration
Edit `mobile/src/services/api.ts`:
```typescript
const API_URL = 'http://localhost:3000'; // Change for production
```

## 📖 Documentation

- [Backend README](./backend/README.md) - API documentation
- [Mobile README](./mobile/README.md) - App setup guide

## 🚧 Future Enhancements

- [ ] Offline mode for mobile app
- [ ] Audio pronunciation
- [ ] Flashcard deck export
- [ ] Social learning features
- [ ] Weekly progress reports
- [ ] Dark mode theme

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ for IELTS learners**

Start your journey to IELTS success today! 🎯📚
