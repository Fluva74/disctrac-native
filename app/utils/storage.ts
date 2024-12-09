import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_APP } from '../../FirebaseConfig';
import * as ImageManipulator from 'expo-image-manipulator';

const storage = getStorage(FIREBASE_APP);

export async function uploadProfileImage(uri: string, userId: string): Promise<string> {
  try {
    // Compress image before upload
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500 } }],
      { 
        compress: 0.5,
        format: ImageManipulator.SaveFormat.JPEG 
      }
    );

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const path = `avatars/${userId}/${timestamp}.jpg`;
    const storageRef = ref(storage, path);

    // Convert image to blob
    const response = await fetch(compressedImage.uri);
    const blob = await response.blob();

    // Upload with metadata
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        userId,
        uploadedAt: timestamp.toString()
      }
    };

    // Upload file
    const snapshot = await uploadBytes(storageRef, blob, metadata);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return downloadUrl;
  } catch (error: any) {
    console.error('Upload error:', {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack,
      storageConfig: storage.app.options
    });
    throw error;
  }
} 