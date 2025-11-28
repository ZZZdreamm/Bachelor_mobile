import React, { Suspense } from 'react';
import {View, StyleSheet, ActivityIndicator, Text, Platform} from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import { Box3, Vector3 } from 'three';
import {Camera, DefaultLight, FilamentScene, FilamentView, Model} from "react-native-filament";
import {ArViewerView} from "react-native-ar-viewer";
// NOTE: Ensure your package manager correctly resolves the 'three' import above.
// The THREE.WARNING about multiple imports suggests a potential dependency issue,
// but the R3F error is fixed by the structural change below.

// --- Helper Component to wrap the loaded model (No changes needed here) ---
const ModelRenderer: React.FC<{ modelUri: string }> = ({ modelUri }) => {
    console.log("modelrenderer", modelUri);
    return (
        <FilamentScene>
            {/* 🏞️ A view to draw the 3D content to */}
            <FilamentView style={{ flex: 1 }}>
                {/* 💡 A light source, otherwise the scene will be black */}
                <DefaultLight />

                {/* 📦 A 3D model */}
                <Model
                    source={{uri: modelUri}}
                    // Try increasing the scale significantly, e.g., 10x
                    scale={[0.5, 0.5, 0.5]}
                    // Ensure it's centered
                    position={[0, 0, 0]}
                />

                {/* 📹 A camera through which the scene is observed and projected onto the view */}
                <Camera
                    // Position the camera back along the Z-axis
                    position={[100, 100, 50]}
                    // Target the center of the scene
                    target={[0, 0, 0]}
                />
            </FilamentView>
        </FilamentScene>
    )
};

// 🖼️ Main Loader Component (Now a simple Canvas wrapper)
export const ModelLoader: React.FC<{ modelUri: string }> = ({ modelUri }) => {
    // No more Suspense or useGLTF!
    console.log("modelUri", modelUri);
    return (
        <View style={StyleSheet.absoluteFill}>
            {/*<ArViewerView*/}
            {/*    style={{flex: 1}}*/}
            {/*    model={modelUri}*/}
            {/*/>*/}
            {modelUri && <ModelRenderer modelUri={modelUri} />}
            {/*<Canvas*/}
            {/*    style={StyleSheet.absoluteFill}*/}
            {/*    camera={{ position: [2, 2, 2], fov: 75 }}*/}
            {/*>*/}
            {/*    <ambientLight intensity={0.5} />*/}
            {/*    <directionalLight position={[10, 10, 5]} intensity={1} />*/}
            {/*    <directionalLight position={[-10, -10, -5]} intensity={0.5} />*/}

            {/*    /!* Render only if modelScene is provided *!/*/}
            {/*    {modelUri && <ModelRenderer modelUri={modelUri} />}*/}

            {/*    <OrbitControls enablePan={true} enableZoom={true} />*/}
            {/*</Canvas>*/}
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    fallback: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Overlay background
    },
    fallbackText: {
        color: '#FFF',
        marginTop: 10,
    }
});