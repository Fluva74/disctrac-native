import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FIREBASE_APP } from '../../FirebaseConfig';
import * as ImageManipulator from 'expo-image-manipulator';

const storage = getStorage(FIREBASE_APP);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function uploadProfileImage(uri: string, userId: string): Promise<string> {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      // Validate inputs
      if (!uri || !userId) {
        throw new Error('Missing required parameters');
      }

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const path = `avatars/${userId}/${timestamp}.jpg`;
      const storageRef = ref(storage, path);

      // Compress image before upload
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 500 } }],
        { 
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      // Convert image to blob
      const response = await fetch(compressedImage.uri);
      const blob = await response.blob();

      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Invalid image data');
      }

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
      attempts++;
      
      console.error('Upload error:', {
        attempt: attempts,
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack,
        storageConfig: storage.app.options
      });

      if (attempts === MAX_RETRIES) {
        throw new Error(`Failed to upload image after ${MAX_RETRIES} attempts: ${error.message}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  throw new Error('Upload failed');
} 