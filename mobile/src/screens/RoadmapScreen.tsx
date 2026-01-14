import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { vocabularyAPI } from '../services/api';

export default function RoadmapScreen({ navigation }: any) {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const WORDS_PER_DAY = 50;

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            const response = await vocabularyAPI.getTopics();
            const rawTopics = response.data;

            // Calculate Day Schedule
            let cumulativeWords = 0;
            const processedTopics = rawTopics.map((topic: any) => {
                const count = parseInt(topic.count) || 0;

                const startDay = Math.floor(cumulativeWords / WORDS_PER_DAY) + 1;
                cumulativeWords += count;
                const endDay = Math.floor((cumulativeWords - 1) / WORDS_PER_DAY) + 1;

                return {
                    ...topic,
                    startDay,
                    endDay
                };
            });

            setTopics(processedTopics);
        } catch (error) {
            console.error('Error loading topics:', error);
            Alert.alert('Error', 'Failed to load topics');
        } finally {
            setLoading(false);
        }
    };

    const handleTopicPress = (topic: string) => {
        // Navigate to LearnScreen with topic filter
        navigation.navigate('Learn', { topicName: topic });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const learned = parseInt(item.learned) || 0;
        const total = parseInt(item.count) || 0;
        const percentage = total > 0 ? (learned / total) * 100 : 0;

        const dayText = item.startDay === item.endDay
            ? `Day ${item.startDay}`
            : `Day ${item.startDay} - ${item.endDay}`;

        return (
            <TouchableOpacity
                style={styles.topicCard}
                onPress={() => handleTopicPress(item.topic)}
            >
                <View style={[styles.circle, percentage === 100 && { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.stepNumber, percentage === 100 && { color: '#059669' }]}>
                        {percentage === 100 ? '✓' : index + 1}
                    </Text>
                </View>
                <View style={styles.content}>
                    <View style={styles.topicHeader}>
                        <Text style={styles.topicTitle}>{item.topic}</Text>
                        <View style={styles.dayBadge}>
                            <Text style={styles.dayText}>{dayText}</Text>
                        </View>
                    </View>

                    <View style={styles.progressRow}>
                        <Text style={styles.wordCount}>{learned} / {total} words</Text>
                        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
                    </View>
                    <View style={styles.track}>
                        <View style={[styles.bar, { width: `${percentage}%` }]} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📅 60-Day Challenge</Text>
                <Text style={styles.subHeader}>Target: 50 words / day</Text>
            </View>
            <FlatList
                data={topics}
                renderItem={renderItem}
                keyExtractor={(item) => item.topic}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No topics found.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingTop: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    topicCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    content: {
        flex: 1,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    wordCount: {
        fontSize: 12,
        color: '#6B7280',
    },
    arrow: {
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    percentage: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    track: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        backgroundColor: '#4F46E5',
        borderRadius: 3,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    subHeader: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 8,
    },
    topicHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    dayBadge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    dayText: {
        color: '#4338CA',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
