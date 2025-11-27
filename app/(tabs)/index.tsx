import { Link } from 'expo-router';
import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert, Platform, BackHandler} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {

    const handleExitApp = () => {
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
        } else if (Platform.OS === 'ios') {
            console.log("Can't close programatically on IOs");
        } else {
            window.close();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Ionicons name="images-outline" size={48} color="#FFD700" />
                <Text style={styles.title}>Story Build</Text>
            </View>

            <View style={styles.buttonGroup}>
                <Link href="/(tabs)/photo" asChild>
                    <TouchableOpacity style={styles.navButton}>
                        <Ionicons name="camera-outline" size={30} color="#FFFFFF" />
                        <Text style={styles.buttonText}>Capture & Upload (Mode 1)</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            {Platform.OS !== 'ios' && (
                <TouchableOpacity style={styles.exitButton} onPress={handleExitApp}>
                    <Ionicons name="exit-outline" size={24} color="#D9534F" />
                    <Text style={styles.exitButtonText}>Exit App</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E', // Dark background
        padding: 30,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#EFEFF0', // Light text
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#A9A9A9', // Grey subtitle
        marginTop: 5,
    },
    buttonGroup: {
        width: '100%',
        alignItems: 'center',
        gap: 20, // Spacing between buttons
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        paddingVertical: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonPrimary: {
        backgroundColor: '#007AFF', // iOS Blue
    },
    buttonSecondary: {
        backgroundColor: '#34C759', // iOS Green
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50,
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(217, 83, 79, 0.1)', // Light red background
    },
    exitButtonText: {
        color: '#D9534F', // Dark Red text
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
});