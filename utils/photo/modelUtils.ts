import { Platform, Alert } from 'react-native';
import { Buffer } from 'buffer';
import { axiosInstance } from "@/api/axios";

// Define the expected return type for processModelResponse
export type ModelToRenderType = {
    modelUrl: string | null; // modelUrl is for web (data URI)
    modelData: ArrayBuffer | null; // modelData is for native (ArrayBuffer)
    contentType: string;
    filename: string
};

/**
 * Processes the binary response (ArrayBuffer) from the API into a usable format.
 */
export function processModelResponse(response: any): ModelToRenderType {
    const arrayBuffer = response.data;
    const contentType = response.headers['content-type'];
    const contentDisposition = response.headers['content-disposition'];

    let filename = 'model';
    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
            filename = match[1];
        }
    }

    if (Platform.OS === 'web') {
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const modelUrl = `data:${contentType};base64,${base64Data}`;
        return { modelUrl, modelData: null, contentType, filename };
    } else {
        return { modelUrl: null, modelData: arrayBuffer, contentType, filename };
    }
}

/**
 * Common logic for sending photo data to the API.
 */
async function sendPhotoToApi(
    finalPhotoUri: string,
    location: { latitude: number; longitude: number } | null,
    shouldFilterLocation: boolean
) {
    const formData = new FormData();
    let fileToAppend: any;

    if (Platform.OS === 'web') {
        const response = await fetch(finalPhotoUri);
        const blob = await response.blob();
        fileToAppend = blob;
    } else {
        fileToAppend = {
            uri: finalPhotoUri,
            type: 'image/jpeg',
            name: 'cropped_photo.jpg',
        } as any;
    }

    formData.append('building_image', fileToAppend);

    if (location && shouldFilterLocation) {
        formData.append('location', `${location.latitude},${location.longitude}`);
    }

    const response = await axiosInstance.post("buildings_search/find/", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer', // Request binary data for the model
    });

    if (response.status >= 200 && response.status < 300) {
        return processModelResponse(response);
    } else {
        // Throw an error to be caught by the caller's try/catch
        throw new Error(`API call failed with status: ${response.status}`);
    }
}

/**
 * High-level function to send data *with* location.
 */
export async function sendToApiWithLocation(
    finalPhotoUri: string,
    location: { latitude: number; longitude: number }
): Promise<{ modelToRender: ModelToRenderType, apiResult: any }> {
    const modelToRender = await sendPhotoToApi(finalPhotoUri, location, true);

    return {
        modelToRender,
        apiResult: {
            status: 'Model Downloaded (With Location Filter)',
            httpStatus: 200 // Assuming 200 if it passes sendPhotoToApi
        }
    };
}

/**
 * High-level function to send data *without* location.
 */
export async function sendToApiWithoutLocation(
    finalPhotoUri: string
): Promise<{ modelToRender: ModelToRenderType, apiResult: any }> {
    const modelToRender = await sendPhotoToApi(finalPhotoUri, null, false);

    return {
        modelToRender,
        apiResult: {
            status: 'Model Downloaded (No Location Filter)',
            httpStatus: 200 // Assuming 200 if it passes sendPhotoToApi
        }
    };
}