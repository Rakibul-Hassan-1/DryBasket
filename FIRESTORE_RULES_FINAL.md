# 🔐 Updated Firestore Security Rules

## সাধারণ Access Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: সবাই পড়তে পারে, শুধু admin লিখতে পারে
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
                                      request.auth.token.email == 'admin@drybasket.com';
    }

    // Orders: Authenticated users তৈরি করতে পারে, নিজের অর্ডার দেখতে পারে
    match /orders/{orderId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null &&
                              (request.auth.uid == resource.data.userId ||
                               request.auth.token.email == 'admin@drybasket.com');
    }

    // Users: প্রত্যেকে নিজের ডেটা পড়তে এবং লিখতে পারে
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin: Admin সবকিছু করতে পারে
    match /{document=**} {
      allow read, write: if request.auth != null &&
                           request.auth.token.email == 'admin@drybasket.com';
    }
  }
}
```

## কপি-পেস্ট করার জন্য প্রস্তুত Rules:

এই rules গুলো Firebase Console → Firestore Database → Rules এ পেস্ট করুন।

কী পরিবর্তন হলো:

- ✅ Products সবাই পড়তে পারে (guest users সহ)
- ✅ Products শুধু admin লিখতে পারে
- ✅ Orders শুধু authenticated users তৈরি করতে পারে
- ✅ Users প্রত্যেকে নিজের ডেটা ম্যানেজ করতে পারে
- ✅ Admin সবকিছু ম্যানেজ করতে পারে
