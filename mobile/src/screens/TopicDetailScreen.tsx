import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const WORDS_PER_DAY = 20;

export default function TopicDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { topicName, totalWords } = route.params;

    const [days, setDays] = useState<any[]>([]);
    const [wordsPerDay, setWordsPerDay] = useState(WORDS_PER_DAY);

    const pacingOptions = [
        { label: 'Chill', value: 15, emoji: '🧘' },
        { label: 'Normal', value: 20, emoji: '🚶' },
        { label: 'Hardcore', value: 50, emoji: '🔥' },
    ];

    useEffect(() => {
        calculateSchedule();
    }, [wordsPerDay]);

    const calculateSchedule = () => {
        const totalDays = Math.ceil(totalWords / wordsPerDay);
        const schedule = [];

        for (let i = 0; i < totalDays; i++) {
            const start = i * wordsPerDay + 1;
            const end = Math.min((i + 1) * wordsPerDay, totalWords);
            schedule.push({
                day: i + 1,
                start,
                end,
                count: end - start + 1,
                status: i === 0 ? 'unlocked' : 'locked' // Ideally fetch real progress
            });
        }
        setDays(schedule);
    };

    const handleDayPress = (day: any) => {
        navigation.navigate('Learn', {
            topicName: topicName,
            offset: day.start - 1, // API is 0-indexed
            limit: day.count,
            dayLabel: `Day ${day.day}`
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>⬅</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{topicName}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>Micro-learning Plan</Text>

                {/* Pacing Controls */}
                <View style={styles.pacingContainer}>
                    {pacingOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.pacingButton,
                                wordsPerDay === option.value && styles.pacingButtonActive
                            ]}
                            onPress={() => setWordsPerDay(option.value)}
                        >
                            <Text style={styles.pacingEmoji}>{option.emoji}</Text>
                            <Text style={[
                                styles.pacingLabel,
                                wordsPerDay === option.value && styles.pacingLabelActive
                            ]}>
                                {option.label}
                            </Text>
                            <Text style={[
                                styles.pacingValue,
                                wordsPerDay === option.value && styles.pacingValueActive
                            ]}>
                                {option.value} words
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.description}>
                    Reviewing {wordsPerDay} words/day. Estimated completion: {days.length} days.
                </Text>

                <View style={styles.grid}>
                    {days.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.dayCard}
                            onPress={() => handleDayPress(item)}
                        >
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayTitle}>DAY {item.day}</Text>
                                {/* <Text style={styles.statusIcon}>{item.status === 'locked' ? '🔒' : '🔓'}</Text> */}
                            </View>
                            <Text style={styles.rangeText}>Words {item.start}-{item.end}</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '0%' }]} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#334155',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        textTransform: 'capitalize',
    },
    content: {
        padding: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 24,
        lineHeight: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dayCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dayTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4F46E5',
    },
    rangeText: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#F1F5F9',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
    },
    pacingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    pacingButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    pacingButtonActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
    },
    pacingEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    pacingLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
    },
    pacingLabelActive: {
        color: '#4F46E5',
    },
    pacingValue: {
        fontSize: 12,
        color: '#94A3B8',
    },
    pacingValueActive: {
        color: '#6366F1',
    },
});
