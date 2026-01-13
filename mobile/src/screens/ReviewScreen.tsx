import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { vocabularyAPI, progressAPI, aiAPI } from '../services/api';

export default function ReviewScreen() {
    const [words, setWords] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [quiz, setQuiz] = useState<any>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviewWords();
    }, []);

    const loadReviewWords = async () => {
        try {
            const response = await vocabularyAPI.getReviewWords();
            setWords(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading review words:', error);
            Alert.alert('Error', 'Failed to load review words');
            setLoading(false);
        }
    };

    const loadQuiz = async (word: any) => {
        try {
            const response = await aiAPI.generateQuiz(word.word, word.definition);
            setQuiz(response.data);
        } catch (error) {
            console.error('Error loading quiz:', error);
        }
    };

    const handleAnswer = async (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        setShowAnswer(true);

        const isCorrect = answerIndex === quiz.correctIndex;
        const quality = isCorrect ? 5 : 2;

        setTimeout(() => handleNext(quality), 1500);
    };

    const handleNext = async (quality: number) => {
        const currentWord = words[currentIndex];

        try {
            await progressAPI.recordProgress(currentWord.id, quality);

            if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setShowAnswer(false);
                setQuiz(null);
                setSelectedAnswer(null);
            } else {
                Alert.alert('Review Complete!', 'Great job reviewing!', [
                    { text: 'OK', onPress: () => setCurrentIndex(0) },
                ]);
            }
        } catch (error) {
            console.error('Error recording progress:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (words.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyIcon}>🎉</Text>
                <Text style={styles.emptyTitle}>No Reviews Due!</Text>
                <Text style={styles.emptySubtitle}>Check back later</Text>
            </View>
        );
    }

    const currentWord = words[currentIndex];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Review</Text>
                <Text style={styles.progress}>
                    {currentIndex + 1} / {words.length}
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${((currentIndex + 1) / words.length) * 100}%` },
                    ]}
                />
            </View>

            <ScrollView style={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.word}>{currentWord.word}</Text>
                    <Text style={styles.pos}>{currentWord.partOfSpeech}</Text>

                    {/* Quiz Section */}
                    {quiz ? (
                        <View style={styles.quizContainer}>
                            <Text style={styles.question}>{quiz.question}</Text>

                            <View style={styles.options}>
                                {quiz.options.map((option: string, index: number) => {
                                    const isSelected = selectedAnswer === index;
                                    const isCorrect = index === quiz.correctIndex;
                                    const showCorrect = showAnswer && isCorrect;
                                    const showWrong = showAnswer && isSelected && !isCorrect;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.option,
                                                showCorrect && styles.optionCorrect,
                                                showWrong && styles.optionWrong,
                                            ]}
                                            onPress={() => handleAnswer(index)}
                                            disabled={showAnswer}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    (showCorrect || showWrong) && { color: '#FFFFFF' },
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                            {showCorrect && <Text style={styles.checkmark}>✓</Text>}
                                            {showWrong && <Text style={styles.checkmark}>✗</Text>}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.definition}>{currentWord.definition}</Text>

                            <TouchableOpacity
                                style={styles.startQuizButton}
                                onPress={() => loadQuiz(currentWord)}
                            >
                                <Text style={styles.startQuizText}>🎯 Start Quiz</Text>
                            </TouchableOpacity>

                            <View style={styles.buttons}>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#EF4444' }]}
                                    onPress={() => handleNext(1)}
                                >
                                    <Text style={styles.buttonText}>Forgot 😓</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#F59E0B' }]}
                                    onPress={() => handleNext(3)}
                                >
                                    <Text style={styles.buttonText}>Remember 😊</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#10B981' }]}
                                    onPress={() => handleNext(5)}
                                >
                                    <Text style={styles.buttonText}>Easy 😎</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    progress: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 24,
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 2,
    },
    scrollContent: {
        flex: 1,
        padding: 24,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 32,
        minHeight: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    word: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    pos: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 24,
    },
    definition: {
        fontSize: 18,
        color: '#374151',
        lineHeight: 28,
        textAlign: 'center',
        marginBottom: 32,
    },
    quizContainer: {
        marginTop: 16,
    },
    question: {
        fontSize: 18,
        color: '#111827',
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    options: {
        gap: 12,
    },
    option: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCorrect: {
        backgroundColor: '#10B981',
        borderColor: '#059669',
    },
    optionWrong: {
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    },
    checkmark: {
        position: 'absolute',
        right: 16,
        top: 16,
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    startQuizButton: {
        backgroundColor: '#EEF2FF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    startQuizText: {
        color: '#4F46E5',
        fontSize: 16,
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
});
