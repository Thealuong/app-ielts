import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { progressAPI } from '../services/api';

interface DayStatus {
    day: number;
    completedWords: number;
    totalWords: number;
    isCompleted: boolean;
}

interface LearningCalendarProps {
    onSelectDay: (dayNumber: number) => void;
}

export default function LearningCalendar({ onSelectDay }: LearningCalendarProps) {
    const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCalendar();
    }, []);

    const loadCalendar = async () => {
        try {
            const response = await progressAPI.getCalendar();
            setDayStatuses(response.data);
        } catch (error) {
            console.error('Error loading calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDayColor = (status: DayStatus | undefined) => {
        if (!status) return '#E5E7EB'; // Gray - Not loaded
        if (status.isCompleted) return '#10B981'; // Green - Completed
        if (status.completedWords > 0) return '#F59E0B'; // Yellow - In progress
        return '#E5E7EB'; // Gray - Not started
    };

    const getDayIcon = (status: DayStatus | undefined) => {
        if (!status) return '⬜';
        if (status.isCompleted) return '✅';
        if (status.completedWords > 0) return '⏳';
        return '⬜';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📅 My Learning Journey</Text>
            <Text style={styles.subtitle}>60 Days × 50 Words = 3000 IELTS Vocabulary</Text>

            <ScrollView style={styles.scrollView}>
                <View style={styles.grid}>
                    {dayStatuses.map((status) => (
                        <TouchableOpacity
                            key={status.day}
                            style={[
                                styles.dayBox,
                                { backgroundColor: getDayColor(status) },
                            ]}
                            onPress={() => onSelectDay(status.day)}
                        >
                            <Text style={styles.dayNumber}>Day {status.day}</Text>
                            <Text style={styles.dayIcon}>{getDayIcon(status)}</Text>
                            <Text style={styles.dayProgress}>
                                {status.completedWords}/{status.totalWords}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.legendText}>Completed</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.legendText}>In Progress</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendBox, { backgroundColor: '#E5E7EB' }]} />
                        <Text style={styles.legendText}>Not Started</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    scrollView: {
        maxHeight: 400,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dayBox: {
        width: '22%',
        aspectRatio: 1,
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    dayNumber: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    dayIcon: {
        fontSize: 18,
        marginVertical: 2,
    },
    dayProgress: {
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 11,
        color: '#6B7280',
    },
});
