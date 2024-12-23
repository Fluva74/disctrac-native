import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

export async function deleteUserCompletely(userId: string) {
  try {
    // Delete Firestore data
    await deleteDoc(doc(FIREBASE_DB, 'players', userId));
    // or if it's a store
    // await deleteDoc(doc(FIREBASE_DB, 'stores', userId));

    // Delete Authentication record
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      await deleteUser(user);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
} 