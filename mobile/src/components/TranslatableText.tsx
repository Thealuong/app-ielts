import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { aiAPI } from '../services/api';

interface TranslatableTextProps {
    text: string;
    style?: any;
    context?: string;
    type?: 'definition' | 'example';
}

export default function TranslatableText({ text, style, context, type }: TranslatableTextProps) {
    const [translation, setTranslation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTranslate = async () => {
        if (translation) return; // Already translated

        setLoading(true);
        try {
            const response = await aiAPI.translate(text, context || '');
            setTranslation(response.data.translation);
        } catch (error) {
            console.error('Translate error:', error);
            setTranslation('Lỗi dịch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Text style={[style, { flex: 1 }]}>{text}</Text>

                <TouchableOpacity
                    onPress={handleTranslate}
                    style={styles.translateButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={{ fontSize: 16 }}>🇻🇳</Text>
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={{ marginTop: 4 }}>
                    <ActivityIndicator size="small" color="#4F46E5" />
                </View>
            )}

            {translation && (
                <View style={styles.translationBox}>
                    <Text style={styles.translationText}>{translation}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    translateButton: {
        marginLeft: 8,
        padding: 4,
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
    },
    translationBox: {
        marginTop: 6,
        padding: 8,
        backgroundColor: '#F0FDFA', // Light Teal/Cyan 
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#14B8A6',
    },
    translationText: {
        fontSize: 14,
        color: '#0F766E',
        fontStyle: 'italic',
    }
});
