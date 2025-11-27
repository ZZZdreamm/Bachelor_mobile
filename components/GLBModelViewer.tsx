import React, { FunctionComponent, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

// Define the props the component expects
interface GlbViewerProps {
    /** The raw binary data of the .glb file. */
    glbArrayBuffer: ArrayBuffer | null;
}

const GlbModelViewer: FunctionComponent<GlbViewerProps> = ({ glbArrayBuffer }) => {
    // 1. STATE & ENGINE INITIALIZATION
    const engine = useEngine();
    const [scene, setScene] = useState<BABYLON.Scene | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. SCENE SETUP AND MODEL LOADING EFFECT
    useEffect(() => {
        if (engine && !scene) {
            // Engine is ready, create the scene
            const newScene = new BABYLON.Scene(engine);
            setScene(newScene);

            // Setup basic camera and lighting
            const camera = new BABYLON.ArcRotateCamera(
                'camera',
                Math.PI / 2,
                Math.PI / 2,
                4,
                BABYLON.Vector3.Zero(),
                newScene
            );
            camera.attachControl(true);
            new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), newScene);

            // Set the state to ready for loading
            setLoading(false);
        }
    }, [engine, scene]);

    // 3. MODEL PROCESSING AND LOADING EFFECT
    useEffect(() => {
        // Only run if the scene is initialized and we have new ArrayBuffer data
        if (scene && glbArrayBuffer) {
            setLoading(true);
            setError(null);

            // Function to load the GLB data
            const loadModel = async () => {
                try {
                    // Check if the ArrayBuffer has data
                    if (glbArrayBuffer.byteLength === 0) {
                        throw new Error("Received an empty ArrayBuffer.");
                    }

                    // Remove previous models if any
                    scene.meshes.filter(m => m.name.startsWith('__root__')).forEach(m => m.dispose());

                    // Import the mesh directly from the ArrayBuffer
                    const uint8View = new Uint8Array(glbArrayBuffer);
                    await BABYLON.ImportMeshAsync(
                        uint8View,
                        scene,
                    );

                    // Center the camera on the new model (optional but good practice)
                    scene.createDefaultCameraOrLight(true, true, true);
                    (scene.activeCamera as BABYLON.ArcRotateCamera).target = new BABYLON.Vector3(0, 0, 0);
                    (scene.activeCamera as BABYLON.ArcRotateCamera).alpha = Math.PI / 2;
                    (scene.activeCamera as BABYLON.ArcRotateCamera).beta = Math.PI / 2;
                    (scene.activeCamera as BABYLON.ArcRotateCamera).radius = 4;


                    setLoading(false);
                    console.log('Model loaded successfully from ArrayBuffer.');
                } catch (e) {
                    console.error('Error loading GLB:', e);
                    setError(`Failed to load model: ${e.message}`);
                    setLoading(false);
                }
            };

            loadModel();
        }
    }, [scene, glbArrayBuffer]); // Re-runs when the scene or the GLB data changes

    // 4. RENDERING
    return (
        <View style={styles.container}>
            {/* Display loading or error messages */}
            {loading && <Text style={styles.overlayText}>Loading model...</Text>}
            {error && <Text style={[styles.overlayText, styles.errorText]}>{error}</Text>}

            {/* The Babylon Renderer */}
            {scene && scene.activeCamera && (
                <EngineView
                    camera={scene.activeCamera}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {/* Fallback while the engine/scene are initializing */}
            {!scene && <Text style={styles.overlayText}>Initializing 3D Engine...</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlayText: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#fff',
        zIndex: 10,
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        fontWeight: 'bold',
    }
});

export default GlbModelViewer;