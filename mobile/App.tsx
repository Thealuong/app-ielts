import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import VocabularyListScreen from './src/screens/VocabularyListScreen';
import NotesScreen from './src/screens/NotesScreen';
import RoadmapScreen from './src/screens/RoadmapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#4F46E5',
                tabBarInactiveTintColor: '#6B7280',
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Learn"
                component={LearnScreen}
                options={{
                    tabBarLabel: 'Learn',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📚</Text>,
                }}
            />
            <Tab.Screen
                name="Review"
                component={ReviewScreen}
                options={{
                    tabBarLabel: 'Review',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🔄</Text>,
                }}
            />
            <Tab.Screen
                name="Notes"
                component={NotesScreen}
                options={{
                    tabBarLabel: 'Notes',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📝</Text>,
                }}
            />
            <Tab.Screen
                name="Progress"
                component={ProgressScreen}
                options={{
                    tabBarLabel: 'Progress',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <>
            <StatusBar style="auto" />
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen name="VocabularyList" component={VocabularyListScreen} />
                    <Stack.Screen name="Roadmap" component={RoadmapScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
