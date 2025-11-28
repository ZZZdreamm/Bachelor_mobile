import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ModelLoader } from "@/components/ModelLoader"; // Assuming this is correct
import { ModelStyles } from '@/styles/photo/styles'

interface ModelOverlayProps {
    result: any;
    modelUri: string | null;
    loadedScene: any; // Use the correct type for the loaded 3D scene
    onClearModel: () => void;
}

export const ModelOverlay: React.FC<ModelOverlayProps> = ({ result, modelUri, loadedScene, onClearModel }) => {
    const isLoading = !loadedScene;
    const displayModelUri = modelUri ? modelUri.split('/').pop() : 'N/A';
    const displayData = result ? JSON.stringify(result, null, 2) : 'No Data';

    return (
        <View style={ModelStyles.container}>
        <View style={ModelStyles.statusBox}>
        <Ionicons name="cube-outline" size={24} color="#32CD32" />
    <Text style={ModelStyles.statusText}>3D Model Match Found</Text>
    </View>

    <View style={ModelStyles.modelViewer}>
        {isLoading ? (
                <ActivityIndicator size="large" color="#32CD32" />
) : (
        <ModelLoader modelUri={loadedScene} />
)}
    </View>

    <View style={ModelStyles.detailsBox}>
    <Text style={ModelStyles.modelDetailsTitle}>Model Details:</Text>
    <Text style={ModelStyles.modelDetails}>
        File URL: **{displayModelUri}**
    </Text>
    <Text style={ModelStyles.modelDetails}>
        Response Data:
        </Text>
        <Text style={ModelStyles.responseText}>
        {displayData}
        </Text>
        </View>

        <TouchableOpacity style={ModelStyles.clearButton} onPress={onClearModel}>
    <Ionicons name="backspace-outline" size={20} color="#FFF" />
    <Text style={ModelStyles.clearButtonText}>Clear Overlay / Retake</Text>
    </TouchableOpacity>
    </View>
);
};