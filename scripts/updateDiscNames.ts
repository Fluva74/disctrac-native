import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from '../serviceAccountKey.json';

// Initialize admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: 'disctrac-9911c'
});

const db = getFirestore();

async function updateDiscNames() {
  const discsRef = db.collection('discs');
  const snapshot = await discsRef.get();

  const updates = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    if (data.name && !data.nameLower) {
      await doc.ref.update({
        nameLower: data.name.toLowerCase()
      });
      console.log(`Updated ${data.name}`);
    }
  });

  await Promise.all(updates);
  console.log('All discs updated');
}

updateDiscNames().catch(console.error); 