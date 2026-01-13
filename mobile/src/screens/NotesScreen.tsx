import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { notesAPI } from '../services/api';

export default function NotesScreen({ navigation }: any) {
    const [note, setNote] = useState<any>(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadNote();
    }, [selectedDate]);

    const loadNote = async () => {
        try {
            setLoading(true);
            const dateString = selectedDate.toISOString().split('T')[0];
            const response = await notesAPI.getNoteByDate(dateString);
            setNote(response.data);
            setContent(response.data.content || '');
            setTitle(response.data.title || '');
        } catch (error) {
            console.error('Error loading note:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveNote = async () => {
        try {
            setSaving(true);
            const dateString = selectedDate.toISOString().split('T')[0];
            await notesAPI.updateNote(dateString, content, title);
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setSaving(false);
        }
    };

    // Auto-save after 2 seconds of no typing
    useEffect(() => {
        if (!loading && content !== (note?.content || '')) {
            const timer = setTimeout(() => {
                saveNote();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [content]);

    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        if (newDate <= new Date()) {
            setSelectedDate(newDate);
        }
    };

    const goToToday = () => {
        setSelectedDate(new Date());
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
            {/* Date Navigation Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
                    <Text style={styles.navText}>← Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={goToToday} style={styles.dateButton}>
                    <Text style={styles.dateText}>
                        {selectedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={goToNextDay}
                    style={[
                        styles.navButton,
                        selectedDate.toDateString() === new Date().toDateString() &&
                        styles.navButtonDisabled,
                    ]}
                    disabled={selectedDate.toDateString() === new Date().toDateString()}
                >
                    <Text
                        style={[
                            styles.navText,
                            selectedDate.toDateString() === new Date().toDateString() &&
                            styles.navTextDisabled,
                        ]}
                    >
                        Next →
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Note Editor */}
            <ScrollView style={styles.editorContainer}>
                <TextInput
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Note title..."
                    placeholderTextColor="#9CA3AF"
                />

                <TextInput
                    style={styles.contentInput}
                    value={content}
                    onChangeText={setContent}
                    placeholder="Start writing your notes for today..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                />
            </ScrollView>

            {/* Footer Stats */}
            <View style={styles.footer}>
                <Text style={styles.statsText}>
                    {content.length} characters · {content.split(/\s+/).filter(Boolean).length}{' '}
                    words
                </Text>
                {saving && <Text style={styles.savingText}>💾 Saving...</Text>}
                {!saving && content && (
                    <Text style={styles.savedText}>✅ Saved</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    navButton: {
        padding: 8,
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
    },
    navTextDisabled: {
        color: '#9CA3AF',
    },
    dateButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    editorContainer: {
        flex: 1,
        padding: 16,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
        padding: 0,
    },
    contentInput: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        minHeight: 400,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    statsText: {
        fontSize: 12,
        color: '#6B7280',
    },
    savingText: {
        fontSize: 12,
        color: '#F59E0B',
        fontWeight: '600',
    },
    savedText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
});
