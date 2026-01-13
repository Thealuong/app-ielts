import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { vocabularyAPI } from '../services/api';

export default function VocabularyListScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [words, setWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            searchWords();
        } else {
            setWords([]);
        }
    }, [searchQuery]);

    const searchWords = async () => {
        setLoading(true);
        try {
            const response = await vocabularyAPI.search(searchQuery);
            setWords(response.data);
        } catch (error) {
            console.error('Error searching words:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderWord = ({ item }: any) => (
        <View style={styles.wordCard}>
            <View style={styles.wordHeader}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.pos}>{item.partOfSpeech}</Text>
            </View>
            {item.ipaUk && (
                <Text style={styles.pronunciation}>{item.ipaUk}</Text>
            )}
            <Text style={styles.definition}>{item.definition}</Text>
            {item.exampleSentences && item.exampleSentences.length > 0 && (
                <Text style={styles.example}>
                    Example: {item.exampleSentences[0]}
                </Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search Vocabulary</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for words..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : words.length > 0 ? (
                <FlatList
                    data={words}
                    renderItem={renderWord}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            ) : searchQuery.length >= 2 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No words found</Text>
                </View>
            ) : (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyText}>Type to search vocabulary</Text>
                </View>
            )}
        </View>
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
    searchContainer: {
        padding: 24,
        paddingTop: 0,
    },
    searchInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    list: {
        padding: 24,
        paddingTop: 0,
    },
    wordCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    wordHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    word: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginRight: 12,
    },
    pos: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    pronunciation: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    definition: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 8,
    },
    example: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});
