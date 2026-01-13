import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { notesAPI } from '../services/api';

interface QuickNoteProps {
    isVisible: boolean;
    onToggle: () => void;
}

export default function QuickNote({ isVisible, onToggle }: QuickNoteProps) {
    const [noteContent, setNoteContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [slideAnim] = useState(new Animated.Value(300)); // Start off-screen

    useEffect(() => {
        loadTodayNote();
    }, []);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : 300,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isVisible]);

    const loadTodayNote = async () => {
        try {
            const response = await notesAPI.getTodayNote();
            setNoteContent(response.data.content || '');
        } catch (error) {
            console.error('Error loading note:', error);
        }
    };

    const saveNote = async () => {
        try {
            setIsSaving(true);
            const today = new Date().toISOString().split('T')[0];
            await notesAPI.updateNote(today, noteContent);
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save after 2 seconds of no typing
    useEffect(() => {
        if (noteContent) {
            const timer = setTimeout(() => {
                saveNote();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [noteContent]);

    return (
        <>
            {/* Floating Note Button */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={onToggle}
            >
                <Text style={styles.floatingButtonText}>
                    {isVisible ? '✕' : '📝'}
                </Text>
            </TouchableOpacity>

            {/* Note Card */}
            {isVisible && (
                <Animated.View
                    style={[
                        styles.noteCard,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.noteHeader}>
                        <Text style={styles.noteTitle}>✏️ Quick Note</Text>
                        {isSaving && <Text style={styles.savingText}>💾 Saving...</Text>}
                        {!isSaving && noteContent && (
                            <Text style={styles.savedText}>✅ Saved</Text>
                        )}
                    </View>

                    <TextInput
                        style={styles.noteInput}
                        value={noteContent}
                        onChangeText={setNoteContent}
                        placeholder="Jot down your thoughts while learning..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <Text style={styles.noteHint}>
                        Notes are saved automatically to today's notebook
                    </Text>
                </Animated.View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 1000,
    },
    floatingButtonText: {
        fontSize: 24,
    },
    noteCard: {
        position: 'absolute',
        bottom: 170,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 999,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
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
    noteInput: {
        fontSize: 14,
        color: '#374151',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        marginBottom: 8,
    },
    noteHint: {
        fontSize: 11,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});
