# ✅ সঠিক Firestore Rules - Development Phase

Firebase Console → Firestore Database → Rules এ এই rules পেস্ট করুন:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: সবাই পড়তে পারে, authenticated users লিখতে পারে
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders: authenticated users তৈরি করতে পারে, নিজের অর্ডার পড়তে পারে
    match /orders/{orderId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.email == 'admin@drybasket.com');
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

## পরিবর্তনসমূহ:

- ✅ `allow write: if request.auth != null` - যেকোনো authenticated user products আপডেট করতে পারে (development)
- ✅ `allow create: if request.auth != null` - কোনো condition নেই, শুধু logged-in থাকলেই চলবে
- ✅ Orders read condition আরও flexible

## করার ধাপ:

1. Firebase Console খুলুন
2. Rules ট্যাব এ সব delete করুন
3. উপরের code paste করুন
4. **Publish** ক্লিক করুন
5. সবুজ checkmark ✓ দেখুন
6. অ্যাপে ফিরে যান F5 দিয়ে refresh করুন
7. আবার order place করার চেষ্টা করুন
