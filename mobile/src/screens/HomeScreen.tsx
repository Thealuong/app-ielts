import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';

import { progressAPI } from '../services/api';
import LearningCalendar from '../components/LearningCalendar';

export default function HomeScreen({ navigation }: any) {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await progressAPI.getDashboard();
            setDashboard(response.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, Learner! 👋</Text>
                    <Text style={styles.subtitle}>Ready to learn today?</Text>
                </View>
            </View>

            {/* Streak Card */}
            <View style={styles.card}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakNumber}>{dashboard?.stats?.streak || 0}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
                    <Text style={styles.statNumber}>{dashboard?.stats?.total || 0}</Text>
                    <Text style={styles.statLabel}>Total Progress</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.statNumber}>{dashboard?.stats?.mastered || 0}</Text>
                    <Text style={styles.statLabel}>Mastered</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={styles.statNumber}>{dashboard?.stats?.learning || 0}</Text>
                    <Text style={styles.statLabel}>Learning</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
                    <Text style={styles.statNumber}>{dashboard?.stats?.dueToday || 0}</Text>
                    <Text style={styles.statLabel}>Due Today</Text>
                </View>
            </View>

            {/* Learning Calendar */}
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                <LearningCalendar
                    onSelectDay={(dayNumber) => navigation.navigate('Learn', { dayNumber })}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4F46E5' }]}
                    onPress={() => navigation.navigate('Learn')}
                >
                    <Text style={styles.actionIcon}>📚</Text>
                    <Text style={styles.actionTitle}>Learn New Words</Text>
                    <Text style={styles.actionSubtitle}>50 words today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                    onPress={() => navigation.navigate('Review')}
                >
                    <Text style={styles.actionIcon}>🔄</Text>
                    <Text style={styles.actionTitle}>Review</Text>
                    <Text style={styles.actionSubtitle}>
                        {dashboard?.stats?.dueToday || 0} words due
                    </Text>
                </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 24,
        paddingTop: 60,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        margin: 24,
        marginTop: 0,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    streakIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    streakNumber: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#111827',
    },
    streakLabel: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
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
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
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
    actions: {
        padding: 24,
        paddingTop: 0,
        gap: 16,
    },
    actionButton: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    actionSubtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        marginTop: 4,
    },
});
