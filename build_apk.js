import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("🚀 Starting APK Build Process...");

try {
  // 1. Build the web assets
  console.log("📦 Building web assets (vite build)...");
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Sync to Capacitor
  console.log("🔄 Syncing with Capacitor (npx cap sync android)...");
  execSync('npx cap sync android', { stdio: 'inherit' });

  // 3. Build APKs with Gradle
  console.log("⚙️ Compiling APKs via Gradle...");
  const androidDir = path.join(process.cwd(), 'android');
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  
  // Building both Debug and Release APKs
  execSync(`${gradlew} assembleDebug assembleRelease`, { cwd: androidDir, stdio: 'inherit' });

  // 4. Copying files to root /apk folder
  console.log("📂 Copying generated APKs to /apk folder...");
  const apkDir = path.join(process.cwd(), 'apk');
  if (!fs.existsSync(apkDir)) {
    fs.mkdirSync(apkDir, { recursive: true });
  }

  const debugApkSource = path.join(androidDir, 'app/build/outputs/apk/debug/app-debug.apk');
  const releaseApkSource = path.join(androidDir, 'app/build/outputs/apk/release/app-release-unsigned.apk'); // Release is usually unsigned unless strictly configured

  // Depending on signing config, it could be app-release.apk
  const releaseSignedApkSource = path.join(androidDir, 'app/build/outputs/apk/release/app-release.apk');

  if (fs.existsSync(debugApkSource)) {
    fs.copyFileSync(debugApkSource, path.join(apkDir, 'app-debug.apk'));
    console.log("✅ Copied Debug APK to /apk/app-debug.apk");
  }

  if (fs.existsSync(releaseSignedApkSource)) {
    fs.copyFileSync(releaseSignedApkSource, path.join(apkDir, 'app-release.apk'));
    console.log("✅ Copied Release APK to /apk/app-release.apk");
  } else if (fs.existsSync(releaseApkSource)) {
    fs.copyFileSync(releaseApkSource, path.join(apkDir, 'app-release-unsigned.apk'));
    console.log("✅ Copied Unsigned Release APK to /apk/app-release-unsigned.apk");
  }

  console.log("🎉 All APKs successfully built and copied!");

} catch (error) {
  console.error("❌ Build process failed:", error.message);
  process.exit(1);
}
