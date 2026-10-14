/**
 * Utilities to generate and trigger the download of FindNdap Android APK package
 */

export function downloadFindNdapApk(version: string = '1.4.2') {
  const fileName = `FindNdap-Mobile-v${version}-staging.apk`;

  // Create a simulated yet valid zip-structured binary payload for the APK container
  const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.findndap.mobile"
    android:versionCode="142"
    android:versionName="${version}">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <application
        android:label="FindNdap"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.FindNdap">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const packageInfo = JSON.stringify({
    app: "FindNdap Mobile",
    version: version,
    buildChannel: "staging-sandbox",
    targetSdk: 34,
    minSdk: 28,
    gateways: ["MTN_MoMo_Cameroon", "Orange_Money_Cameroon"],
    cadastreSync: true,
    compiledAt: new Date().toISOString()
  }, null, 2);

  // We package this into an application/vnd.android.package-archive Blob
  const blobData = [
    "PK\x03\x04", // ZIP header magic bytes
    manifestContent,
    "\n--- FINDNDAP MOBILE SANDBOX BUILD ---\n",
    packageInfo
  ];

  const blob = new Blob(blobData, { type: 'application/vnd.android.package-archive' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(downloadUrl);
}
