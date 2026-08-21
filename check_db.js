import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDatabaseConnection() {
  console.log("Checking Firebase Admin Connection...");

  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`
❌ ERROR: Missing Service Account Key!

To run terminal scripts and bypass Firestore Security Rules, you need a Service Account:
1. Go to Firebase Console -> Project Settings -> Service Accounts
2. Click "Generate new private key"
3. Save the downloaded file to the root of this project as "serviceAccountKey.json"
4. Run this script again: node check_db.js
    `);
    process.exit(1);
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    console.log("Firebase Admin initialized. Testing Firestore read...");

    // Try to read the users collection (admin operation)
    const snapshot = await db.collection("users").limit(1).get();

    if (snapshot.empty) {
      console.log("✅ Connection Successful! (The users collection is empty).");
    } else {
      console.log(`✅ Connection Successful! Found ${snapshot.size} user(s) in the query limit.`);
    }

  } catch (error) {
    console.error("❌ Firestore Connection Error:", error.message);
    if (error.code) {
      console.error("Error Code:", error.code);
    }
  }
}

checkDatabaseConnection();
