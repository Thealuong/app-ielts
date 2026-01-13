import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Storage wrapper for web/mobile compatibility
export const storage = {
    async getItem(key: string): Promise<string | null> {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    },
    async setItem(key: string, value: string): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    async deleteItem(key: string): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    },
};

// Create axios instance with auth interceptor
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const token = await storage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    register: (email: string, password: string, name: string) =>
        api.post('/auth/register', { email, password, name }),
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
};

// Vocabulary APIs
export const vocabularyAPI = {
    getDailyWords: () => api.get('/vocabulary/daily'),
    getReviewWords: () => api.get('/vocabulary/review'),
    getDayWords: (dayNumber: number) => api.get(`/vocabulary/day/${dayNumber}`),
    search: (query: string) => api.get('/vocabulary/search', { params: { q: query } }),
    getById: (id: number) => api.get(`/vocabulary/${id}`),
};

// Progress APIs
export const progressAPI = {
    getDashboard: () => api.get('/progress/dashboard'),
    getCalendar: () => api.get('/progress/calendar'),
    recordProgress: (vocabularyId: number, quality: number) =>
        api.post('/progress/record', { vocabularyId, quality }),
    recordSession: (data: {
        newWordsCount: number;
        reviewedWordsCount: number;
        accuracyRate: number;
        durationMinutes: number;
    }) => api.post('/progress/session', data),
};

// AI APIs
export const aiAPI = {
    generateExamples: (word: string, definition: string, partOfSpeech: string) =>
        api.post('/ai/examples', { word, definition, partOfSpeech }),

    generatePractice: (word: string, definition: string, partOfSpeech: string) =>
        api.post('/ai/practice', { word, definition, partOfSpeech }),
    generateQuiz: (vocabularyId: number) =>
        api.post('/ai/quiz', { vocabularyId }),
    explainUsage: (word: string, context: string) =>
        api.post('/ai/explain', { word, context }),
};

// Notes APIs
export const notesAPI = {
    getTodayNote: () => api.get('/notes/today'),
    getNoteByDate: (date: string) => api.get(`/notes/date/${date}`),
    getNoteDates: () => api.get('/notes/list'),
    updateNote: (date: string, content: string, title?: string) =>
        api.put(`/notes/date/${date}`, { content, title }),
    deleteNote: (date: string) => api.delete(`/notes/date/${date}`),
};

export default api;
