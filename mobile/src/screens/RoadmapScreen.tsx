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

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            const response = await vocabularyAPI.getTopics();
            setTopics(response.data);
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

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity
            style={styles.topicCard}
            onPress={() => handleTopicPress(item.topic)}
        >
            <View style={styles.circle}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.topicTitle}>{item.topic}</Text>
                <Text style={styles.wordCount}>{item.count} words</Text>
            </View>
            <Text style={styles.arrow}>➡️</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>🗺️ Learning Roadmap</Text>
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
});
