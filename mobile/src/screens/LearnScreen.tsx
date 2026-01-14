import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { vocabularyAPI, progressAPI, aiAPI, notesAPI } from '../services/api';
import QuickNote from '../components/QuickNote';
import TranslatableText from '../components/TranslatableText';

export default function LearnScreen({ route, navigation }: any) {
    const { dayNumber, topicName, offset, limit, dayLabel } = route?.params || {};
    const [words, setWords] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDefinition, setShowDefinition] = useState(false);
    const [learningContent, setLearningContent] = useState<any[]>([]); // New structured content
    const [loading, setLoading] = useState(true);
    const [loadingAI, setLoadingAI] = useState(false);

    // Quick note state
    const [showNoteCard, setShowNoteCard] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Practice state
    const [isPracticeMode, setIsPracticeMode] = useState(false);
    const [practiceLevel, setPracticeLevel] = useState(0); // 0 to 4
    const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
    const [practiceInput, setPracticeInput] = useState('');
    const [practiceFeedback, setPracticeFeedback] = useState<'neutral' | 'correct' | 'incorrect'>('neutral');
    const [loadingPractice, setLoadingPractice] = useState(false);
    const [currentExample, setCurrentExample] = useState<string>('');
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);

    const [isPracticeComplete, setIsPracticeComplete] = useState(false);

    useEffect(() => {
        loadWords();
    }, [dayNumber, topicName, offset, limit]);

    useEffect(() => {
        if (dayLabel) {
            navigation.setOptions({ title: dayLabel });
        }
    }, [dayLabel]);

    const loadWords = async () => {
        setLoading(true);
        try {
            let response;
            if (topicName) {
                response = await vocabularyAPI.getByTopic(topicName, offset, limit);
            } else if (dayNumber) {
                response = await vocabularyAPI.getDayWords(dayNumber);
            } else {
                response = await vocabularyAPI.getDailyWords();
            }
            setWords(response.data);
            setCurrentIndex(0); // Reset index
        } catch (error) {
            console.error('Error loading words:', error);
            Alert.alert('Error', 'Failed to load vocabulary');
        } finally {
            setLoading(false);
        }
    };


    const loadAIExamples = async (word: any) => {
        setLoadingAI(true);
        try {
            const response = await aiAPI.generateExamples(
                word.word,
                word.definition,
                word.partOfSpeech
            );

            // Handle new response structure
            if (response.data.content && Array.isArray(response.data.content)) {
                setLearningContent(response.data.content);
            }
        } catch (error) {
            console.error('Error loading AI examples:', error);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleNext = async (quality: number) => {
        const currentWord = words[currentIndex];

        // 0 means Practice Mode
        if (quality === 0) {
            setIsPracticeMode(true);
            setPracticeLevel(0);
            setIsPracticeComplete(false);
            setPracticeQuestions([]);
            setLoadingPractice(true);

            try {
                // Fetch 5-level practice set
                const response = await aiAPI.generatePractice(
                    currentWord.word,
                    currentWord.definition,
                    currentWord.partOfSpeech,
                    topicName // Pass the topic context
                );

                if (response.data.questions && Array.isArray(response.data.questions)) {
                    setPracticeQuestions(response.data.questions);
                } else {
                    setPracticeQuestions([
                        { type: 'fill_no_hint', question: `Type the word "${currentWord.word}"`, answer: currentWord.word }
                    ]);
                }
            } catch (error) {
                console.error("Practice Load Error", error);
                Alert.alert("Error", "Could not load practice set. Using simple mode.");
                setPracticeQuestions([
                    { type: 'fill_no_hint', question: `Type the word "${currentWord.word}"`, answer: currentWord.word }
                ]);
            } finally {
                setLoadingPractice(false);
                setPracticeInput('');
                setPracticeFeedback('neutral');
            }
            return;
        }

        // Optimistic update - Move next immediately
        if (!currentWord.id) {
            console.error("Missing Word ID");
        } else {
            progressAPI.recordProgress(currentWord.id, quality)
                .then(() => console.log("Progress recorded"))
                .catch(err => console.error("Progress save failed", err));
        }

        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowDefinition(false);
            setLearningContent([]); // Reset AI content
            setIsPracticeMode(false); // Reset practice mode
            setIsPracticeComplete(false);
        } else {
            Alert.alert('Great Job!', "You've completed today's lesson!", [
                { text: 'OK', onPress: () => { setCurrentIndex(0); setIsPracticeMode(false); setIsPracticeComplete(false); } },
            ]);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowDefinition(false);
            setLearningContent([]);
            setIsPracticeMode(false);
            setIsPracticeComplete(false);
        }
    };


    const handleNextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowDefinition(false);
            setLearningContent([]);
            setIsPracticeMode(false);
            setIsPracticeComplete(false);
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
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>No New Words Today!</Text>
                <Text style={styles.emptySubtitle}>You've completed your daily goal</Text>
            </View>
        );
    }

    const currentWord = words[currentIndex];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                        <Text style={{ fontSize: 24 }}>🔙</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{topicName ? topicName : 'Learn Words'}</Text>
                    <View style={{ width: 30 }} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={handlePrevious} style={{ padding: 8, marginRight: 4 }}>
                            <Text style={{ fontSize: 28, color: currentIndex > 0 ? '#4F46E5' : '#E5E7EB' }}>⬅</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleNextWord} style={{ padding: 8 }}>
                            <Text style={{ fontSize: 28, color: currentIndex < words.length - 1 ? '#4F46E5' : '#E5E7EB' }}>➡</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.progress}>
                        {currentIndex + 1} / {words.length}
                    </Text>
                </View>
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

            {/* Flashcard */}
            <ScrollView style={styles.scrollContent}>
                <TouchableOpacity
                    style={styles.flashcard}
                    onPress={() => setShowDefinition(!showDefinition)}
                    activeOpacity={0.9}
                >
                    <Text style={styles.word}>{currentWord.word}</Text>
                    <Text style={styles.pos}>{currentWord.partOfSpeech}</Text>

                    {currentWord.ipaUk && (
                        <Text style={styles.pronunciation}>UK: {currentWord.ipaUk}</Text>
                    )}

                    {showDefinition && (
                        <>
                            <View style={styles.divider} />

                            {/* Definition */}
                            <TranslatableText
                                text={currentWord.definition}
                                style={styles.definition}
                                type="definition"
                                context={currentWord.word}
                            />

                            {currentWord.exampleSentences && currentWord.exampleSentences.length > 0 && (
                                <View style={styles.examples}>
                                    <Text style={styles.sectionTitle}>Examples:</Text>
                                    {currentWord.exampleSentences.map((ex: string, i: number) => (
                                        <View key={i} style={{ marginBottom: 12 }}>
                                            <TranslatableText
                                                text={`• ${ex}`}
                                                style={styles.example}
                                                type="example"
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* DB Collocations (Legacy) */}
                            {currentWord.collocations && currentWord.collocations.length > 0 && (
                                <View style={styles.collocationBox}>
                                    <View style={styles.divider} />
                                    <Text style={styles.collocationTitle}>💡 Basic Collocations:</Text>
                                    <View style={styles.collocationList}>
                                        {currentWord.collocations.map((col: string, i: number) => (
                                            <View key={i} style={styles.chip}>
                                                <Text style={styles.chipText}>{col}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* AI Structured Content */}
                            {learningContent.length > 0 && (
                                <View style={styles.aiSection}>
                                    <Text style={styles.sectionTitle}>✨ Usage Patterns & Examples:</Text>
                                    {learningContent.map((item, i) => (
                                        <View key={i} style={styles.learningCard}>
                                            <Text style={styles.patternText}>🔹 {item.pattern}</Text>
                                            {item.meaning && <Text style={styles.meaningText}>({item.meaning})</Text>}
                                            <TranslatableText
                                                text={`📌 ${item.example}`}
                                                style={styles.exampleText}
                                                type="example"
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}

                            {!loadingAI && learningContent.length === 0 && (
                                <TouchableOpacity
                                    style={styles.aiButton}
                                    onPress={() => loadAIExamples(currentWord)}
                                >
                                    <Text style={styles.aiButtonText}>
                                        🤖 Generate Smart Examples
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {loadingAI && (
                                <ActivityIndicator size="small" color="#4F46E5" style={{ marginTop: 16 }} />
                            )}
                        </>
                    )}

                    {!showDefinition && (
                        <Text style={styles.tapHint}>👆 Tap to see definition</Text>
                    )}
                </TouchableOpacity>

                {/* Practice Mode UI */}
                {isPracticeMode && (
                    <View style={styles.practiceContainer}>
                        {loadingPractice ? (
                            <ActivityIndicator size="large" color="#4F46E5" />
                        ) : isPracticeComplete ? (
                            // COMPLETION UI
                            <View style={{ alignItems: 'center', padding: 20 }}>
                                <Text style={{ fontSize: 48 }}>🎉</Text>
                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#10B981', marginTop: 10 }}>Excellent!</Text>
                                <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 5, marginBottom: 20 }}>
                                    You have mastered this word.
                                </Text>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: '#4F46E5', width: '100%' }]}
                                    onPress={() => handleNext(5)}
                                >
                                    <Text style={styles.buttonText}>Next Word ➡</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ marginTop: 15 }}
                                    onPress={() => {
                                        setPracticeLevel(0);
                                        setIsPracticeComplete(false);
                                        setPracticeFeedback('neutral');
                                    }}
                                >
                                    <Text style={{ color: '#6B7280' }}>Reference / Practice Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : practiceQuestions.length > 0 ? (
                            <>
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>Level {practiceLevel + 1} / 5</Text>
                                </View>

                                <Text style={styles.practiceTitle}>
                                    {practiceQuestions[practiceLevel].type.includes('mcq') ? '🤔 Select Answer' : '✍️ Type Answer'}
                                </Text>
                                <Text style={styles.practiceInstruction}>
                                    {practiceQuestions[practiceLevel].question}
                                </Text>

                                {/* MCQ UI */}
                                {practiceQuestions[practiceLevel].type.includes('mcq') && (
                                    <View style={styles.mcqContainer}>
                                        {practiceQuestions[practiceLevel].options.map((option: string, index: number) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.mcqButton,
                                                    practiceFeedback === 'correct' && index === practiceQuestions[practiceLevel].correctIndex && styles.mcqCorrect,
                                                    practiceFeedback === 'incorrect' && index !== practiceQuestions[practiceLevel].correctIndex && styles.mcqIncorrectDisabled,
                                                ]}
                                                onPress={async () => {
                                                    if (index === practiceQuestions[practiceLevel].correctIndex) {
                                                        setAiExplanation(null); // Clear previous explanation
                                                        setPracticeFeedback('correct');
                                                        setTimeout(() => {
                                                            if (practiceLevel < 4) {
                                                                setPracticeLevel(p => p + 1);
                                                                setPracticeFeedback('neutral');
                                                                setPracticeInput('');
                                                            } else {
                                                                setIsPracticeComplete(true);
                                                            }
                                                        }, 500);
                                                    } else {
                                                        setPracticeFeedback('incorrect');
                                                        setAiExplanation("🤖 Đang phân tích lỗi sai...");
                                                        try {
                                                            const response = await aiAPI.explainError(
                                                                practiceQuestions[practiceLevel].question,
                                                                option,
                                                                practiceQuestions[practiceLevel].options[practiceQuestions[practiceLevel].correctIndex],
                                                                currentWord.word
                                                            );
                                                            setAiExplanation(response.data.feedback);
                                                        } catch (e) {
                                                            setAiExplanation("Rất tiếc, AI đang bận.");
                                                        }
                                                    }
                                                }}
                                            >
                                                <Text style={styles.mcqText}>{option}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Typing UI */}
                                {!practiceQuestions[practiceLevel].type.includes('mcq') && (
                                    <>
                                        <TextInput
                                            style={[
                                                styles.practiceInput,
                                                practiceFeedback === 'correct' && styles.inputCorrect,
                                                practiceFeedback === 'incorrect' && styles.inputIncorrect,
                                            ]}
                                            value={practiceInput}
                                            onChangeText={setPracticeInput}
                                            placeholder="Type answer..."
                                            placeholderTextColor="#9CA3AF"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />

                                        {practiceQuestions[practiceLevel].hint && (
                                            <Text style={{ color: '#6B7280', marginBottom: 10, fontStyle: 'italic' }}>💡 {practiceQuestions[practiceLevel].hint}</Text>
                                        )}

                                        <TouchableOpacity
                                            style={styles.checkButton}
                                            onPress={async () => {
                                                const correctAnswer = practiceQuestions[practiceLevel].answer;
                                                if (practiceInput.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                                                    setAiExplanation(null);
                                                    setPracticeFeedback('correct');
                                                    setTimeout(() => {
                                                        if (practiceLevel < 4) {
                                                            setPracticeLevel(p => p + 1);
                                                            setPracticeFeedback('neutral');
                                                            setPracticeInput('');
                                                        } else {
                                                            setIsPracticeComplete(true);
                                                        }
                                                    }, 500);
                                                } else {
                                                    setPracticeFeedback('incorrect');
                                                    setAiExplanation("🤖 Đang phân tích lỗi sai...");
                                                    try {
                                                        const response = await aiAPI.explainError(
                                                            practiceQuestions[practiceLevel].question,
                                                            practiceInput,
                                                            correctAnswer,
                                                            currentWord.word
                                                        );
                                                        setAiExplanation(response.data.feedback);
                                                    } catch (e) {
                                                        setAiExplanation("Rất tiếc, AI đang bận.");
                                                    }
                                                }
                                            }}
                                        >
                                            <Text style={styles.checkButtonText}>Check Answer</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {aiExplanation && (
                                    <View style={styles.aiExplanationBox}>
                                        <Text style={styles.aiExplanationTitle}>💡 Giải thích AI:</Text>
                                        <Text style={styles.aiExplanationText}>{aiExplanation}</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <Text>Failed to load questions.</Text>
                        )}
                    </View>
                )}

                {/* Response Buttons */}
                {showDefinition && !isPracticeMode && (
                    <View>
                        <TouchableOpacity
                            style={styles.practiceButton}
                            onPress={() => handleNext(0)} // 0 triggers practice mode
                        >
                            <Text style={styles.practiceButtonText}>✍️ Practice This Word</Text>
                        </TouchableOpacity>

                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#EF4444' }]}
                                onPress={() => handleNext(1)}
                            >
                                <Text style={styles.buttonText}>Hard 😰</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#F59E0B' }]}
                                onPress={() => handleNext(3)}
                            >
                                <Text style={styles.buttonText}>Good 😊</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: '#10B981' }]}
                                onPress={() => handleNext(5)}
                            >
                                <Text style={styles.buttonText}>Easy 😎</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Quick Note Floating Button & Card */}
            <QuickNote
                isVisible={showNoteCard}
                onToggle={() => setShowNoteCard(!showNoteCard)}
            />
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
    collocationBox: {
        marginTop: 10,
    },
    collocationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4B5563',
        marginBottom: 8,
    },
    learningCard: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#6366F1',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    patternText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    meaningText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    exampleText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
    },
    aiSection: {
        marginTop: 16,
    },
    collocationList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        marginRight: 6,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipText: {
        fontSize: 12,
        color: '#4B5563',
    },
    practiceButton: {
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#818CF8',
    },
    practiceButtonText: {
        color: '#4F46E5',
        fontWeight: 'bold',
        fontSize: 16,
    },
    practiceContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginVertical: 16,
        borderWidth: 2,
        borderColor: '#E0E7FF',
    },
    practiceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4F46E5',
        marginBottom: 12,
        textAlign: 'center',
    },
    practiceInstruction: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    practiceSentence: {
        fontSize: 16,
        lineHeight: 24,
        color: '#111827',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    practiceInput: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    inputCorrect: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    inputIncorrect: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    checkButton: {
        backgroundColor: '#4F46E5',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    levelBadge: {
        alignSelf: 'center',
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    levelText: {
        color: '#4F46E5',
        fontWeight: 'bold',
        fontSize: 12,
    },
    mcqContainer: {
        gap: 8,
    },
    mcqButton: {
        backgroundColor: '#F3F4F6',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    mcqCorrect: {
        backgroundColor: '#D1FAE5',
        borderColor: '#10B981',
    },
    mcqIncorrectDisabled: {
        opacity: 0.5,
    },
    mcqText: {
        fontSize: 15,
        color: '#1F2937',
    },
    feedbackSuccess: {
        color: '#10B981',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    feedbackError: {
        color: '#EF4444',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
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
        backgroundColor: '#4F46E5',
        borderRadius: 2,
    },
    scrollContent: {
        flex: 1,
        padding: 24,
    },
    flashcard: {
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
    },
    pos: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    pronunciation: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 24,
    },
    definition: {
        fontSize: 18,
        color: '#374151',
        lineHeight: 28,
    },
    examples: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    example: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 6,
    },
    section: {
        marginTop: 16,
    },
    text: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
    },

    aiButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        alignItems: 'center',
    },
    aiButtonText: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    tapHint: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 40,
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
    aiExplanationBox: {
        marginTop: 16,
        backgroundColor: '#FFFBEB', // Light yellow for attention
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    aiExplanationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#B45309',
        marginBottom: 4,
    },
    aiExplanationText: {
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
});
