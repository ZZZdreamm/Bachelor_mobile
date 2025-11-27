import React, { Suspense } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls } from '@react-three/drei/native';
import { Box3, Vector3 } from 'three';
// NOTE: Ensure your package manager correctly resolves the 'three' import above.
// The THREE.WARNING about multiple imports suggests a potential dependency issue,
// but the R3F error is fixed by the structural change below.

// --- Helper Component to wrap the loaded model (No changes needed here) ---
const ModelRenderer: React.FC<{ modelScene: any }> = ({ modelScene }) => {

    // Center the model in the scene using the imported Box3 and Vector3
    const box = new Box3().setFromObject(modelScene);
    const center = box.getCenter(new Vector3());
    modelScene.position.sub(center);

    return (
        <primitive object={modelScene} scale={1} />
    );
};

// 🖼️ Main Loader Component (Now a simple Canvas wrapper)
export const ModelLoader: React.FC<{ modelScene: any }> = ({ modelScene }) => {
    // No more Suspense or useGLTF!

    return (
        <View style={StyleSheet.absoluteFill}>
            <Canvas
                style={StyleSheet.absoluteFill}
                camera={{ position: [2, 2, 2], fov: 75 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} />

                {/* Render only if modelScene is provided */}
                {modelScene && <ModelRenderer modelScene={modelScene} />}

                <OrbitControls enablePan={true} enableZoom={true} />
            </Canvas>
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