import React from 'react';
import {View, StyleSheet} from 'react-native';

import {Camera, DefaultLight, FilamentScene, FilamentView, Model} from "react-native-filament";

const ModelRenderer: React.FC<{ modelUri: string }> = ({ modelUri }) => {

    return (
        <FilamentScene>
            <FilamentView style={{ flex: 1 }}>
                <DefaultLight />
                <Model
                    source={{uri: modelUri}}
                    scale={[0.5, 0.5, 0.5]}
                    position={[0, 0, 0]}
                />
                <Camera
                    position={[100, 100, 50]}
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