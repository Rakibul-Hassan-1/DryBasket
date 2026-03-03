# 🔐 Updated Firestore Rules - Verification Support

Firebase Console → Firestore Database → Rules এ এই code paste করুন:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: সবাই পড়তে পারে
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders: Authenticated users তৈরি করতে পারে, verification এর জন্য সবাই পড়তে পারে
    match /orders/{orderId} {
      // Anyone can read (for verification)
      allow read: if true;
      // Only owner can read (more strict)
      // allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.email == 'admin@drybasket.com');

      // Only authenticated users can create
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.email == 'admin@drybasket.com');
    }

    // Admin সবকিছু করতে পারে
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.email == 'admin@drybasket.com';
    }
  }
}
```

## গুরুত্বপূর্ণ:

1. এই rules এ `allow read: if true` আছে orders এ - যাতে সবাই verification এর জন্য orders দেখতে পারে
2. Production এ চাইলে stricter করা যাবে কিন্তু verification feature চালু থাকলে read allow রাখতে হবে
3. Create সবসময় authenticated users এর জন্যই

## করার ধাপ:

1. Firebase Console খুলুন
2. Rules tab এ যান
3. উপরের code paste করুন
4. Publish ক্লিক করুন
