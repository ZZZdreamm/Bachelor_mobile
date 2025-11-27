import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Link } from 'expo-router';
import { ModelOverlay } from './ModelOverlay';
import { styles } from '@/styles/photo/styles'
import Ionicons from "@expo/vector-icons/Ionicons"; // Assuming styles are moved

interface ReviewPhotoViewProps {
    finalPhotoUri: string;
    location: { latitude: number; longitude: number } | null;
    apiResult: any;
    modelToRender: any; // Should be ModelToRenderType from utils
    loadedModelScene: any;
    isSending: boolean;
    isImageLoading: boolean;
    setIsImageLoading: (isImageLoading: boolean) => void;
    backToCamera: () => void;
    clearModelOverlay: () => void;
    handleSendWithLocation: () => void;
    handleSendWithoutLocation: () => void;
}

export const ReviewPhotoView: React.FC<ReviewPhotoViewProps> = ({
                                                                    finalPhotoUri,
                                                                    location,
                                                                    apiResult,
                                                                    modelToRender,
                                                                    loadedModelScene,
                                                                    isSending,
                                                                    isImageLoading,
                                                                    setIsImageLoading,
                                                                    backToCamera,
                                                                    clearModelOverlay,
                                                                    handleSendWithLocation,
                                                                    handleSendWithoutLocation,
                                                                }) => {
    const isModelReady = apiResult && !!(modelToRender?.modelUrl || modelToRender?.modelData);

    return (
        <View style={styles.container}>
            <View style={styles.topControlBar}>
                <Link href="/(tabs)" asChild>
                    <TouchableOpacity style={styles.backButton} disabled={isSending}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Link>
                <Text style={styles.topBarTitle}>Review Photo</Text>
                {location ? (
                    <View style={styles.locationTagHeader}>
                        <Ionicons name="location-outline" size={18} color="#FFF" />
                        <Text style={styles.locationTextHeader}>
                            {`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.spacer} />
                )}
            </View>

            <View style={styles.previewImageFlexContainer}>
                <Image
                    source={{ uri: finalPhotoUri }}
                    style={styles.previewImageFull}
                    resizeMode="cover"
                    onLoadEnd={() => setIsImageLoading(false)}
                    // Removed onLoadEnd/onError, should be managed in parent or dedicated Image component
                />

                {isModelReady && (
                    <ModelOverlay
                        result={apiResult}
                        modelUri={modelToRender.modelUrl}
                        loadedScene={loadedModelScene}
                        onClearModel={clearModelOverlay}
                    />
                )}

                {(isImageLoading || isSending) && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color={isSending ? '#32CD32' : '#ffffff'} />
                        <Text style={styles.overlayText}>{isSending ? 'Sending Data...' : 'Loading Cropped Image...'}</Text>
                    </View>
                )}
            </View>

            <View style={styles.bottomControlBarThreeButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.retakeButton]}
                    onPress={backToCamera}
                    disabled={isSending}
                >
                    <Ionicons name="close-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.actionButtonText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.sendWithoutLocationButton, isSending && styles.sendButtonDisabled]}
                    onPress={handleSendWithoutLocation}
                    disabled={isSending || isImageLoading || isModelReady}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Ionicons name="cloud-upload-outline" size={24} color="#FFF" />
                    )}
                    <Text style={styles.actionButtonText}>{isSending ? 'Sending...' : 'No Location'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.sendButton, isSending && styles.sendButtonDisabled]}
                    onPress={handleSendWithLocation}
                    disabled={isSending || isImageLoading || isModelReady || !location}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Ionicons name="send-outline" size={24} color="#FFF" />
                    )}
                    <Text style={styles.actionButtonText}>{isSending ? 'Sending...' : 'Send (Loc)'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};