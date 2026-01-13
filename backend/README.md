# IELTS Vocabulary Learning Platform - Backend

A professional NestJS backend API for learning 3000 IELTS vocabulary words with AI-powered contextual learning and spaced repetition.

## Features

- 🔐 **JWT Authentication**: Secure user registration and login
- 📚 **Smart Vocabulary Management**: Daily new words (50/day) and spaced repetition review
- 🤖 **AI Integration**: Gemini API for contextual examples, quizzes, and explanations
- 📊 **Progress Tracking**: SuperMemo SM-2 algorithm for optimal review scheduling
- 💾 **AI Caching**: Reduces API costs by caching AI-generated content
- 📈 **Analytics Dashboard**: Track learning stats, streaks, and mastery levels

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MySQL with TypeORM
- **Authentication**: JWT + Passport
- **AI**: Google Gemini API
- **Validation**: class-validator

## Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update database credentials
   - Add your Gemini API key (get one at https://makersuite.google.com/app/apikey)

3. **Create database**:
```sql
CREATE DATABASE ielts_vocabulary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Start the server**:
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login

### Vocabulary
- `GET /vocabulary/daily` - Get today's new words (50)
- `GET /vocabulary/review` - Get words due for review
- `GET /vocabulary/search?q=query` - Search vocabulary
- `GET /vocabulary/progress` - Get overall progress stats
- `GET /vocabulary/:id` - Get specific word
- `POST /vocabulary/import` - Import vocabulary from JSON

### AI Features
- `POST /ai/examples` - Generate contextual examples
- `POST /ai/quiz` - Generate quiz questions
- `POST /ai/explain` - Get feedback on usage

### Progress
- `GET /progress/dashboard` - Get learning dashboard
- `POST /progress/record` - Record word review result
- `POST /progress/session` - Record learning session

## Database Schema

- **users**: User accounts
- **vocabularies**: 3000 IELTS words with definitions, IPA, examples
- **user_vocabulary_progress**: Track mastery level, review schedule
- **learning_sessions**: Daily study sessions
- **ai_generated_content**: Cache AI responses

## Spaced Repetition Algorithm

Uses SuperMemo SM-2 with these intervals:
- First review: 1 day
- Second review: 6 days
- Subsequent: interval × easeFactor

Mastery levels: `new` → `learning` → `review` → `mastered`

## Importing Vocabulary

Your 3000-word file should be in JSON format:

```json
[
  {
    "word": "abandon",
    "partOfSpeech": "verb",
    "definition": "to leave someone or something behind",
    "ipaUk": "/əˈbæn.dən/",
    "ipaUs": "/əˈbæn.dən/",
    "examples": ["He abandoned his family.", "The project was abandoned."],
    "synonyms": "desert, forsake",
    "topic": "General",
    "ieltsBand": "6.0"
  }
]
```

Use `POST /vocabulary/import` to upload the file.

## Development Notes

- Database auto-synchronization is enabled in development
- For production, disable `synchronize` and use migrations
- AI responses are cached for 30 days to reduce costs
- CORS is enabled for all origins (restrict in production)

## Next Steps

1. Add your vocabulary file
2. Get a Gemini API key
3. Run the backend
4. Test with Postman or integrate with frontend

---

Built with ❤️ for IELTS learners
