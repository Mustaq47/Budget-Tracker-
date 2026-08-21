import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs/promises';
import path from 'path';

// MUSTAQ: Add your Firebase Admin service account key here
// 1. Go to Firebase Console -> Project Settings -> Service Accounts
// 2. Generate new private key
// 3. Save as serviceAccountKey.json in this directory
import serviceAccount from './serviceAccountKey.json' with { type: "json" };

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = {};
  
  for (const doc of snapshot.docs) {
    data[doc.id] = doc.data();
    
    // Check for known subcollections like 'backups' in users
    if (collectionName === 'users') {
      const backupSnap = await db.collection(`users/${doc.id}/backups`).get();
      if (!backupSnap.empty) {
        data[doc.id].backups = {};
        backupSnap.forEach(b => {
          data[doc.id].backups[b.id] = b.data();
        });
      }
    }
  }
  
  return data;
}

async function main() {
  console.log("Starting extraction...");
  const collections = ['iam_roles', 'support_queries', 'revenue', 'users'];
  
  for (const col of collections) {
    console.log(`Extracting ${col}...`);
    try {
      const data = await exportCollection(col);
      await fs.writeFile(
        path.join(process.cwd(), `db/${col}.json`), 
        JSON.stringify(data, null, 2)
      );
      console.log(`Saved ${col}.json`);
    } catch (e) {
      console.error(`Error extracting ${col}:`, e.message);
    }
  }
  console.log("Done.");
}

main().catch(console.error);
