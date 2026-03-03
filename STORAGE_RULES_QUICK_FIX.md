# 🔥 Firebase Storage Rules - Quick Fix

## Problem: Upload stuck at "Uploading Image..."

Image upload হচ্ছে না কারণ Firebase Storage এর permission নেই।

## Solution (2 Minutes):

### Step 1: Firebase Console Open করুন

1. যান: https://console.firebase.google.com
2. আপনার project select করুন: `next-firebase-dummy`

### Step 2: Storage Rules Update করুন

1. Left sidebar থেকে **"Build"** → **"Storage"** ক্লিক করুন
2. উপরে **"Rules"** tab ক্লিক করুন
3. নিচের code টা copy করে paste করুন:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read images (public access)
    match /{allPaths=**} {
      allow read: if true;
    }

    // Allow authenticated users to upload to products folder
    match /products/{imageId} {
      allow write: if request.auth != null;
    }
  }
}
```

4. **"Publish"** button ক্লিক করুন
5. Confirm করুন

### Step 3: Test করুন

1. Admin panel এ ফিরে যান
2. Page refresh করুন (F5)
3. নতুন image upload করে দেখুন

## Alternative (Development Only - NOT RECOMMENDED FOR PRODUCTION):

যদি শুধু test করতে চান, তাহলে এই rules use করুন (সবাই upload করতে পারবে):

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: এটা production এ use করবেন না! শুধু development test এর জন্য।

## Check if Storage is Enabled:

যদি Storage একদমই enable না থাকে:

1. Firebase Console → Storage
2. **"Get Started"** button দেখলে ক্লিক করুন
3. Default rules দিয়ে setup করুন
4. তারপর উপরের rules paste করুন

---

## Debug Console Output:

Browser console (F12) এ এই messages দেখবেন:

- ✅ Success: "Uploading to: products/..."
- ✅ Success: "Upload successful, getting URL..."
- ✅ Success: "Download URL: https://..."
- ❌ Error: "Upload error: FirebaseError: ..."

Error দেখলে সেটা copy করে আমাকে দেখান।
