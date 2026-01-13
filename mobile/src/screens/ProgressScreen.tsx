import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { progressAPI } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await progressAPI.getDashboard();
            setDashboard(response.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!dashboard) {
        return <View style={styles.container} />;
    }

    const { stats, recentSessions } = dashboard;
    const totalWords = 3000; // Update this based on your actual vocabulary count
    const progressPercent = ((stats.total / totalWords) * 100).toFixed(1);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Progress</Text>
            </View>

            {/* Overall Progress */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Overall Progress</Text>
                <View style={styles.progressCircle}>
                    <Text style={styles.progressPercent}>{progressPercent}%</Text>
                    <Text style={styles.progressLabel}>
                        {stats.total} / {totalWords} words
                    </Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.statIcon}>🏆</Text>
                    <Text style={styles.statNumber}>{stats.mastered}</Text>
                    <Text style={styles.statLabel}>Mastered</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={styles.statIcon}>📖</Text>
                    <Text style={styles.statNumber}>{stats.learning}</Text>
                    <Text style={styles.statLabel}>Learning</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#E0E7FF' }]}>
                    <Text style={styles.statIcon}>🔄</Text>
                    <Text style={styles.statNumber}>{stats.review}</Text>
                    <Text style={styles.statLabel}>In Review</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={styles.statNumber}>{stats.streak}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
            </View>

            {/* Recent Sessions */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Activity</Text>
                {recentSessions && recentSessions.length > 0 ? (
                    recentSessions.map((session: any, index: number) => (
                        <View key={index} style={styles.sessionItem}>
                            <View style={styles.sessionDate}>
                                <Text style={styles.sessionDay}>
                                    {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                    })}
                                </Text>
                                <Text style={styles.sessionDateText}>
                                    {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </Text>
                            </View>
                            <View style={styles.sessionDetails}>
                                <Text style={styles.sessionText}>
                                    📚 {session.newWordsCount} new words
                                </Text>
                                <Text style={styles.sessionText}>
                                    🔄 {session.reviewedWordsCount} reviewed
                                </Text>
                                <Text style={styles.sessionText}>
                                    ✅ {(session.accuracyRate * 100).toFixed(0)}% accuracy
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No recent activity yet. Start learning!</Text>
                )}
            </View>

            {/* Motivation */}
            <View style={[styles.card, { backgroundColor: '#EEF2FF' }]}>
                <Text style={styles.motivationText}>
                    🎯 Keep going! You're {progressPercent}% of the way to mastering 3000 words!
                </Text>
                {stats.streak > 0 && (
                    <Text style={styles.motivationSubtext}>
                        You've been consistent for {stats.streak} days! 🔥
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        margin: 24,
        marginTop: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    progressCircle: {
        alignItems: 'center',
        padding: 32,
    },
    progressPercent: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    progressLabel: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 24,
        paddingTop: 0,
        gap: 16,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },
    sessionItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sessionDate: {
        width: 60,
        alignItems: 'center',
        marginRight: 16,
    },
    sessionDay: {
        fontSize: 12,
        color: '#6B7280',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    sessionDateText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '600',
        marginTop: 4,
    },
    sessionDetails: {
        flex: 1,
        gap: 4,
    },
    sessionText: {
        fontSize: 14,
        color: '#374151',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingVertical: 16,
    },
    motivationText: {
        fontSize: 16,
        color: '#4F46E5',
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 24,
    },
    motivationSubtext: {
        fontSize: 14,
        color: '#6366F1',
        textAlign: 'center',
        marginTop: 8,
    },
});
