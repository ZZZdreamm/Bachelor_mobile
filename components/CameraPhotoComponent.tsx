import React, { useState } from 'react';
import { View, Button, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import axios, { AxiosResponse } from 'axios';
import { PermissionsAndroid } from 'react-native';

interface PhotoData {
  uri: string;
  base64: string;
}

const CameraPhotoComponent = () => {
  const [photo, setPhoto] = useState<any>(null);

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Web-specific camera access using getUserMedia
  const takePhotoWeb = async (): Promise<void> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Alert.alert('Error', 'Camera access is not supported in this browser');
      console.error('navigator.mediaDevices or getUserMedia is undefined');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Create a canvas to capture the photo
      const canvas = document.createElement('canvas');
      canvas.width = 640; // Adjust as needed
      canvas.height = 480; // Adjust as needed
      const context = canvas.getContext('2d');

      if (!context) {
        Alert.alert('Error', 'Failed to get canvas context');
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      // Wait for video to be ready
      await new Promise(resolve => {
        video.onloadedmetadata = () => resolve(null);
      });

      // Capture the photo
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg');
      const uri = base64; // Use base64 as URI for web

      // Stop the camera stream
      stream.getTracks().forEach(track => track.stop());

      const photoData: PhotoData = { uri, base64 };
      setPhoto(photoData);
    } catch (error: unknown) {
      console.error('Web camera error:', error);
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  // Native camera access using react-native-image-picker
  const takePhotoNative = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required to take photos');
      return;
    }

    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
    };

    try {
      ImagePicker.launchCamera(options, (response: ImagePicker.ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorCode, response.errorMessage);
          Alert.alert('Error', response.errorMessage || 'An error occurred');
        } else if (response.assets && response.assets.length > 0) {
          const photoData: PhotoData = {
            uri: response.assets[0].uri || '',
            base64: response.assets[0].base64 || '',
          };
          setPhoto(photoData);
        } else {
          console.error('No assets returned from ImagePicker');
          Alert.alert('Error', 'No photo data received');
        }
      });
    } catch (error: unknown) {
      console.error('Camera launch error:', error);
      Alert.alert('Error', 'Failed to launch camera');
    }
  };

  // Decide which camera method to use based on platform
  const takePhoto = async (): Promise<void> => {
    if (Platform.OS === 'web') {
      await takePhotoWeb();
    } else {
      await takePhotoNative();
    }
  };

  // Send photo to server
  const sendPhoto = async (): Promise<void> => {
    if (!photo) {
      Alert.alert('No Photo', 'Please take a photo first');
      return;
    }

    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        // Convert base64 to blob for web
        const byteString = atob(photo.base64.split(',')[1]);
        const mimeString = photo.base64.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        formData.append('photo', blob, 'photo.jpg');
      } else {
        formData.append('photo', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any); // TypeScript workaround for FormData typing
      }

      const response: AxiosResponse = await axios.post('https://mywebsite.com/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Photo sent successfully');
      setPhoto(null);
    } catch (error: unknown) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to send photo');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Take Photo" onPress={takePhoto} />
      {photo && (
        <>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: 200, height: 200, marginVertical: 20 }}
          />
          <Button title="Send Photo" onPress={sendPhoto} />
        </>
      )}
    </View>
  );
};

export default CameraPhotoComponent;