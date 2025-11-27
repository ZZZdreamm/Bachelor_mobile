import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, ActivityIndicator, Dimensions, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImageManipulator from 'expo-image-manipulator';

import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 80;
const FOOTER_HEIGHT = 150;
const VIEWPORT_HEIGHT = height - HEADER_HEIGHT - FOOTER_HEIGHT;
const VIEWPORT_WIDTH = width;

const INITIAL_SCALE = 1.0;
const MAX_SCALE = 5.0;

interface ImageCropperProps {
    originalUri: string;
    onRetake: () => void;
    onCropComplete: (croppedUri: string) => void;
}

interface ImageDimensions {
    imageWidth: number;
    imageHeight: number;
    minScale: number;
}

const getClampedTranslation = (
    proposedAbsoluteX: number,
    proposedAbsoluteY: number,
    scale: number,
    renderedW: number,
    renderedH: number,
    cropW: number,
    cropH: number
) => {
    'worklet';

    const scaledW = renderedW * scale;
    const scaledH = renderedH * scale;

    const limitX = Math.max(0, (scaledW - cropW) / 2);
    const limitY = Math.max(0, (scaledH - cropH) / 2);

    const newTranslateX = Math.min(Math.max(proposedAbsoluteX, -limitX), limitX);
    const newTranslateY = Math.min(Math.max(proposedAbsoluteY, -limitY), limitY);

    return { translateX: newTranslateX, translateY: newTranslateY };
};


export default function ImageCropper({ originalUri, onRetake, onCropComplete }: ImageCropperProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);

    const [imageDims, setImageDims] = useState<ImageDimensions | null>(null);

    const [cropFrameVisualDims, setCropFrameVisualDims] = useState({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

    const scale = useSharedValue(INITIAL_SCALE);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const savedScale = useSharedValue(INITIAL_SCALE);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const sharedRenderedW = useSharedValue(VIEWPORT_WIDTH);
    const sharedRenderedH = useSharedValue(VIEWPORT_HEIGHT);
    const sharedCropW = useSharedValue(VIEWPORT_WIDTH);
    const sharedCropH = useSharedValue(VIEWPORT_HEIGHT);


    useEffect(() => {
        if (!originalUri) return;

        setIsImageLoading(true);

        Image.getSize(originalUri, (originalW, originalH) => {

            const imageAspect = originalW / originalH;
            const viewportAspect = VIEWPORT_WIDTH / VIEWPORT_HEIGHT;

            let renderedW_calc, renderedH_calc;
            if (imageAspect > viewportAspect) {
                renderedW_calc = VIEWPORT_WIDTH;
                renderedH_calc = VIEWPORT_WIDTH / imageAspect;
            } else {
                renderedH_calc = VIEWPORT_HEIGHT;
                renderedW_calc = VIEWPORT_HEIGHT * imageAspect;
            }

            const minScale = 1.0;

            setCropFrameVisualDims({ width: renderedW_calc, height: renderedH_calc });
            setImageDims({ imageWidth: originalW, imageHeight: originalH, minScale });

            scale.value = minScale;
            translateX.value = 0;
            translateY.value = 0;
            savedScale.value = minScale;
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;

            sharedRenderedW.value = renderedW_calc;
            sharedRenderedH.value = renderedH_calc;
            sharedCropW.value = renderedW_calc;
            sharedCropH.value = renderedH_calc;

            setIsImageLoading(false);

        }, (error) => {
            console.error('Image.getSize error:', error);
            Alert.alert('Load Error', 'Failed to retrieve image dimensions.');
            setIsImageLoading(false);
            onRetake();
        });
    }, [originalUri]);


    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            'worklet';

            const proposedAbsoluteX = savedTranslateX.value + event.translationX;
            const proposedAbsoluteY = savedTranslateY.value + event.translationY;

            const { translateX: newTranslateX, translateY: newTranslateY } = getClampedTranslation(
                proposedAbsoluteX,
                proposedAbsoluteY,
                scale.value,
                sharedRenderedW.value,
                sharedRenderedH.value,
                sharedCropW.value,
                sharedCropH.value
            );

            translateX.value = newTranslateX;
            translateY.value = newTranslateY;
        })
        .onEnd(() => {
            'worklet';
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            'worklet';

            let newScale = savedScale.value * event.scale;
            const minScale = 1.0;

            newScale = Math.min(Math.max(newScale, minScale), MAX_SCALE);

            scale.value = newScale;

            const { translateX: newTranslateX, translateY: newTranslateY } = getClampedTranslation(
                translateX.value,
                translateY.value,
                newScale,
                sharedRenderedW.value,
                sharedRenderedH.value,
                sharedCropW.value,
                sharedCropH.value
            );
            translateX.value = newTranslateX;
            translateY.value = newTranslateY;
        })
        .onEnd(() => {
            'worklet';
            savedScale.value = scale.value;
        });

    const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });


    const handleCrop = useCallback(async () => {
        if (!imageDims || sharedRenderedW.value === 0) return;

        try {
            const finalScale = scale.value;
            const finalTranslateX = translateX.value;
            const finalTranslateY = translateY.value;

            setIsProcessing(true);

            const current = imageDims;
            const renderedW_val = sharedRenderedW.value;
            const renderedH_val = sharedRenderedH.value;
            const finalCropW = sharedCropW.value;
            const finalCropH = sharedCropH.value;

            const originalToRenderedRatio = current.imageWidth / renderedW_val;

            const cropW_Scaled = finalCropW / finalScale * originalToRenderedRatio;
            const cropH_Scaled = finalCropH / finalScale * originalToRenderedRatio;

            const offsetX_px = finalTranslateX * originalToRenderedRatio / finalScale;
            const offsetY_px = finalTranslateY * originalToRenderedRatio / finalScale;

            const originX = (current.imageWidth / 2) - (cropW_Scaled / 2) - offsetX_px;
            const originY = (current.imageHeight / 2) - (cropH_Scaled / 2) - offsetY_px;

            const cropData = {
                originX: Math.round(Math.max(0, originX)),
                originY: Math.round(Math.max(0, originY)),
                width: Math.round(Math.min(cropW_Scaled, current.imageWidth - Math.max(0, originX))),
                height: Math.round(Math.min(cropH_Scaled, current.imageHeight - Math.max(0, originY))),
            };

            if (cropData.width <= 0 || cropData.height <= 0) {
                throw new Error(`Invalid crop dimensions calculated: W:${cropData.width}, H:${cropData.height}`);
            }

            const manipResult = await ImageManipulator.manipulateAsync(
                originalUri,
                [{ crop: cropData }],
                { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
            );

            if (manipResult.uri) {
                onCropComplete(manipResult.uri);
            } else {
                Alert.alert('Error', 'Image manipulation failed.');
                onRetake();
            }

        } catch (error) {
            console.error('Cropping error:', error);
            Alert.alert('Error', `Failed to crop image: ${error instanceof Error ? error.message : 'Unknown error'}`);
            onRetake();
        } finally {
            setIsProcessing(false);
        }
    }, [originalUri, imageDims, onCropComplete, onRetake, sharedRenderedW, sharedRenderedH, sharedCropW, sharedCropH, scale, translateX, translateY]);


    const viewportStyle = {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
        marginTop: HEADER_HEIGHT,
        marginBottom: FOOTER_HEIGHT,
    };

    const cropWindowInnerStyle = {
        width: cropFrameVisualDims.width,
        height: cropFrameVisualDims.height,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'transparent',
    };

    return (
        <View style={styles.container}>
            <GestureDetector gesture={combinedGesture}>
                <View style={[styles.imageViewport, viewportStyle]}>
                    <AnimatedImage
                        source={{ uri: originalUri }}
                        style={[styles.baseImage, imageAnimatedStyle]}
                        resizeMode="contain"
                        onLoad={() => setIsImageLoading(false)}
                    />
                </View>
            </GestureDetector>

            <View style={[styles.cropWindowOuter, viewportStyle]} pointerEvents="none">
                <View style={cropWindowInnerStyle} />
            </View>

            {(isImageLoading || isProcessing || !imageDims) && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.overlayText}>
                        {isProcessing ? 'Processing Image...' : 'Loading Image...'}
                    </Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.retakeButton]}
                    onPress={onRetake}
                    disabled={isProcessing}
                >
                    <Ionicons name="close-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.actionButtonText}>Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.cropButton, isProcessing && styles.disabledButton]}
                    onPress={handleCrop}
                    disabled={isProcessing || isImageLoading || !imageDims}
                >
                    <Ionicons name="crop-outline" size={24} color="#FFF" />
                    <Text style={styles.actionButtonText}>
                        {isProcessing ? 'Cropping...' : 'Confirm Crop'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageViewport: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    baseImage: {
        width: '100%',
        height: '100%',
    },
    cropWindowOuter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 11,
    },
    overlayText: {
        color: '#FFF',
        marginTop: 10,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        justifyContent: 'space-between',
        zIndex: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        minWidth: '45%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    retakeButton: {
        backgroundColor: '#FF6347',
    },
    cropButton: {
        backgroundColor: '#007AFF',
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 122, 255, 0.5)',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
});