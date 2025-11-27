import React, { ElementRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { GestureDetector } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import { styles } from '@/styles/photo/styles'
import Ionicons from "@expo/vector-icons/Ionicons";

type CameraViewRef = ElementRef<typeof CameraView> | null;

interface CameraViewControlsProps {
    cameraRef: React.RefObject<CameraViewRef>;
    facing: CameraType;
    zoomState: number;
    pinchGesture: any; // Type from react-native-gesture-handler
    takePicture: () => Promise<void>;
    toggleCameraFacing: () => void;
    maxZoomLevel: number;
}

export const CameraViewControls: React.FC<CameraViewControlsProps> = ({
                                                                          cameraRef,
                                                                          facing,
                                                                          zoomState,
                                                                          pinchGesture,
                                                                          takePicture,
                                                                          toggleCameraFacing,
                                                                          maxZoomLevel
                                                                      }) => {
    return (
        <View style={styles.container}>
            <View style={styles.topControlBar}>
                <Link href="/(tabs)" asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Link>
                <Text style={styles.topBarTitle}>Capture Site</Text>
                <View style={styles.spacer} />
            </View>

            <GestureDetector gesture={pinchGesture}>
                <CameraView
                    style={styles.cameraPreview}
                    facing={facing}
                    ref={cameraRef}
                    zoom={zoomState}
                />
            </GestureDetector>

            <View style={styles.zoomTextOverlay}>
                <Text style={styles.zoomText}>
                    Zoom: {(1 + zoomState * (1 / maxZoomLevel) * 5).toFixed(1)}x
                </Text>
            </View>

            <View style={styles.bottomControlBar}>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                    <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <View style={styles.captureInnerCircle} />
                </TouchableOpacity>
                <View style={styles.spacer} />
            </View>
        </View>
    );
};