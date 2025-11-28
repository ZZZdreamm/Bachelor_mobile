import * as Location from 'expo-location';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useState, useRef, ElementRef, useCallback } from 'react';
import { Text, TouchableOpacity, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { GestureHandlerRootView, Gesture } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { GLTFLoader } from "three-stdlib";
import { Link } from 'expo-router';

// Imports from new files
import { CameraViewControls } from '@/components/photo/CameraViewControls';
import { ReviewPhotoView } from '@/components/photo/ReviewPhotoView';
import ImageCropper from "@/components/ImageCropper"; // Assuming this path is correct
import { ModelToRenderType, sendToApiWithLocation, sendToApiWithoutLocation } from '@/utils/photo/modelUtils';
import { styles } from '@/styles/photo/styles'
import Ionicons from "@expo/vector-icons/Ionicons";
import RNFS from 'react-native-fs';
import {Buffer} from "buffer"

const MAX_ZOOM_LEVEL = 0.5;
type CameraViewRef = ElementRef<typeof CameraView> | null;

type LocationType = { latitude: number; longitude: number } | null;

function usePhotoPageLogic() {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
    const cameraRef = useRef<CameraViewRef>(null);
    const [location, setLocation] = useState<LocationType>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const [originalPhotoUri, setOriginalPhotoUri] = useState<string | null>(null);
    const [finalPhotoUri, setFinalPhotoUri] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const [apiResult, setApiResult] = useState<any>(null);
    const [modelToRender, setModelToRender] = useState<ModelToRenderType | null>(null);
    const [loadedModelScene, setLoadedModelScene] = useState<any>(null);

    // Zoom State
    const currentZoom = useSharedValue(0);
    const startZoom = useSharedValue(0);
    const [zoomState, setZoomState] = useState(0);

    const updateZoomState = useCallback((newZoom: number) => {
        setZoomState(newZoom);
    }, []);

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            startZoom.value = currentZoom.value;
        })
        .onUpdate((event) => {
            let newZoom = startZoom.value + (event.scale - 1) * MAX_ZOOM_LEVEL;
            newZoom = Math.max(0, Math.min(MAX_ZOOM_LEVEL, newZoom));
            currentZoom.value = newZoom;
            runOnJS(updateZoomState)(newZoom);
        });

    const toggleCameraFacing = useCallback(() => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }, []);

    const backToCamera = useCallback(() => {
        setOriginalPhotoUri(null);
        setFinalPhotoUri(null);
        setIsImageLoading(false);
        setLocation(null);
        setApiResult(null);
        setModelToRender(null);
        setLoadedModelScene(null);
        currentZoom.value = 0;
        startZoom.value = 0;
        setZoomState(0);
    }, [currentZoom, startZoom]);

    const handleCropComplete = useCallback((croppedUri: string) => {
        setFinalPhotoUri(croppedUri);
        setIsImageLoading(true); // Start loading the cropped image preview
    }, []);

    const takePicture = useCallback(async () => {
        if (!cameraRef.current) return;
        try {
            if (!locationPermission?.granted) {
                Alert.alert('Permission Denied', 'Location permission is required to capture the photo.');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            setLocation({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });

            const photo = await cameraRef.current.takePictureAsync({ quality: 0.95 });
            if (!photo) return;

            setOriginalPhotoUri(photo.uri);
            setFinalPhotoUri(null);
            currentZoom.value = 0;
            startZoom.value = 0;
            setZoomState(0);

        } catch (error) {
            console.error('Error taking picture or getting location:', error);
            Alert.alert('Error', 'Failed to take picture or get location.');
        }
    }, [locationPermission, currentZoom, startZoom]);

    const clearModelOverlay = useCallback(() => {
        setApiResult(null);
        setModelToRender(null);
        setLoadedModelScene(null);
    }, []);

    const loadModelData = useCallback(async (modelData: ModelToRenderType) => {
        setLoadedModelScene(null); // Clear previous scene and show loading indicator
        const loader = new GLTFLoader();

        const success = (gltf: any) => setLoadedModelScene(gltf.scene);
        const progress = (xhr: any) => console.log('Model loading progress:', (xhr.loaded / xhr.total) * 100 + '%');
        const error = (e: any) => {
            console.error('GLTF loading/parsing error:', e);
            Alert.alert('Model Error', 'Failed to parse the 3D model data.');
            setLoadedModelScene(null);
        };

        if (Platform.OS === 'web' && modelData.modelUrl) {
            loader.load(modelData.modelUrl, success, progress, error);
        } else if (modelData.modelData) {
            try {
                // 1. Convert ArrayBuffer to Base64 String
                // react-native-fs requires the content to be a Base64 string for writing.
                const buffer = Buffer.from(modelData.modelData);
                const base64Data = buffer.toString('base64');

                // 2. Define the temporary file path
                const tempFilePath = `${RNFS.DocumentDirectoryPath}/test4-${modelData.filename}`;
                const fileURI = `file://${tempFilePath}`;

                const exists = await RNFS.exists(fileURI);
                if (!exists) {
                    // const result = await RNFS.downloadFile({
                    //     fromUrl: "https://github.com/KhronosGroup/glTF-Sample-Models/blob/main/2.0/2CylinderEngine/glTF-Embedded/2CylinderEngine.gltf",
                    //     toFile: tempFilePath
                    // }).promise;

                    // 3. Write the file to local storage (react-native-fs)
                    await RNFS.writeFile(tempFilePath, base64Data, 'base64');
                    // console.log(`Model successfully saved to: ${fileURI}`);
                    //
                    setLoadedModelScene(fileURI); // Use the URI as the 'scene' data
                } else {
                    console.log("EXISTS")
                    setLoadedModelScene(fileURI);
                }

            } catch (e) {
                console.error('File saving/loading error:', e);
                Alert.alert('Model Error', 'Failed to save or load the 3D model file on device.');
                setLoadedModelScene(null);
            }
        }
    }, []);

    const handleSendApiCall = useCallback(async (apiCall: typeof sendToApiWithLocation | typeof sendToApiWithoutLocation) => {
        if (!finalPhotoUri || (apiCall === sendToApiWithLocation && !location)) {
            Alert.alert('Error', 'Cropped photo or required location data is missing.');
            return;
        }

        try {
            setIsSending(true);
            setApiResult(null);
            setModelToRender(null);
            setLoadedModelScene(null);

            let result: { modelToRender: ModelToRenderType, apiResult: any };
            if (apiCall === sendToApiWithLocation) {
                result = await sendToApiWithLocation(finalPhotoUri, location!);
            } else {
                result = await sendToApiWithoutLocation(finalPhotoUri);
            }

            setModelToRender(result.modelToRender);
            setApiResult(result.apiResult);
            await loadModelData(result.modelToRender);

        } catch (error: any) {
            console.error('API error:', error);
            if (error.response) {
                Alert.alert('API Error', `Status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                Alert.alert('Network Error', 'No response received from the server.');
            } else {
                Alert.alert('Error', error.message || 'An unknown error occurred during the request.');
            }
        } finally {
            setIsSending(false);
        }
    }, [finalPhotoUri, location, loadModelData]);


    const handleSendWithLocation = useCallback(() => {
        if (!location) {
            Alert.alert('Missing Location', 'Cannot send with location as coordinates were not captured.');
            return;
        }
        handleSendApiCall(sendToApiWithLocation);
    }, [location, handleSendApiCall]);

    const handleSendWithoutLocation = useCallback(() => {
        handleSendApiCall(sendToApiWithoutLocation);
    }, [handleSendApiCall]);

    return {
        // Permissions
        cameraPermission, requestCameraPermission,
        locationPermission, requestLocationPermission,
        // Camera & Location
        cameraRef, location, facing,
        toggleCameraFacing, takePicture,
        // Photo & Crop
        originalPhotoUri, finalPhotoUri, handleCropComplete, backToCamera,
        isSending, isImageLoading, setIsImageLoading,
        // Zoom
        zoomState, pinchGesture,
        // Model
        apiResult, modelToRender, loadedModelScene, clearModelOverlay,
        // API Calls
        handleSendWithLocation, handleSendWithoutLocation
    };
}
// --- END: Extracted Logic and Handlers ---


function PhotoPageContent() {
    const {
        cameraPermission, requestCameraPermission, locationPermission, requestLocationPermission,
        cameraRef, location, facing, toggleCameraFacing, takePicture,
        originalPhotoUri, finalPhotoUri, handleCropComplete, backToCamera,
        isSending, isImageLoading, setIsImageLoading,
        zoomState, pinchGesture,
        apiResult, modelToRender, loadedModelScene, clearModelOverlay,
        handleSendWithLocation, handleSendWithoutLocation
    } = usePhotoPageLogic();

    // 1. Initial Loading State
    if (!cameraPermission || !locationPermission) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Checking system permissions...</Text>
                <Text style={styles.loadingSubText}>Please wait for a moment.</Text>
            </View>
        );
    }

    // 2. Permissions Denied State (Moved into a small rendering function or component)
    if (!cameraPermission.granted || !locationPermission.granted) {
        return (
            <View style={[styles.container, styles.permissionsContainer]}>
                <Ionicons name="alert-circle-outline" size={60} color="#FF6347" />
                <Text style={styles.permissionsTitle}>Access Required</Text>
                <Text style={styles.permissionsText}>
                    We need **Camera** and **Location** permissions to capture images with accurate coordinates.
                </Text>
                <View style={styles.permissionsButtons}>
                    {!cameraPermission.granted && (
                        <TouchableOpacity style={styles.permissionsButton} onPress={requestCameraPermission}>
                            <Ionicons name="camera-outline" size={20} color="#FFF" />
                            <Text style={styles.permissionsButtonText}>Grant Camera</Text>
                        </TouchableOpacity>
                    )}
                    {!locationPermission.granted && (
                        <TouchableOpacity style={styles.permissionsButton} onPress={requestLocationPermission}>
                            <Ionicons name="locate-outline" size={20} color="#FFF" />
                            <Text style={styles.permissionsButtonText}>Grant Location</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Link href="/(tabs)" asChild>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Go Back</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        );
    }

    // 3. Cropping State
    if (originalPhotoUri && !finalPhotoUri) {
        return (
            <ImageCropper
                originalUri={originalPhotoUri}
                onRetake={backToCamera}
                onCropComplete={handleCropComplete}
            />
        );
    }

    // 4. Review/Send State (Uses new component)
    if (finalPhotoUri) {
        return (
            <ReviewPhotoView
                finalPhotoUri={finalPhotoUri}
                location={location}
                apiResult={apiResult}
                modelToRender={modelToRender}
                loadedModelScene={loadedModelScene}
                isSending={isSending}
                isImageLoading={isImageLoading}
                setIsImageLoading={setIsImageLoading}
                backToCamera={backToCamera}
                clearModelOverlay={clearModelOverlay}
                handleSendWithLocation={handleSendWithLocation}
                handleSendWithoutLocation={handleSendWithoutLocation}
            />
        );
    }

    // 5. Camera Active State (Uses new component)
    return (
        <CameraViewControls
            cameraRef={cameraRef}
            facing={facing}
            zoomState={zoomState}
            pinchGesture={pinchGesture}
            takePicture={takePicture}
            toggleCameraFacing={toggleCameraFacing}
            maxZoomLevel={MAX_ZOOM_LEVEL}
        />
    );
}

export default function PhotoPage() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PhotoPageContent />
        </GestureHandlerRootView>
    );
}
