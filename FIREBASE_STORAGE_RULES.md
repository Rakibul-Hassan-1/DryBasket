# Firebase Storage Security Rules

Firebase Console থেকে Storage Rules configure করুন।

## Steps:

1. Firebase Console এ যান: https://console.firebase.google.com
2. আপনার প্রজেক্ট সিলেক্ট করুন
3. Left sidebar থেকে **Storage** → **Rules** এ যান
4. নিচের rules paste করুন:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all images
    match /{allPaths=**} {
      allow read: if true;
    }

    // Only authenticated users can upload
    match /products/{imageId} {
      allow write: if request.auth != null;
    }
  }
}
```

5. **Publish** button ক্লিক করুন

## Features:

✅ সবাই images দেখতে পারবে (public read)
✅ শুধুমাত্র logged-in users upload করতে পারবে
✅ Images `/products/` folder এ save হবে
✅ Automatic URL generation

## Alternative (More Secure):

যদি শুধু admin-ই upload করতে পারবে:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
    }

    match /products/{imageId} {
      allow write: if request.auth != null
                  && request.auth.token.email == 'admin@example.com';
    }
  }
}
```

`admin@example.com` এর জায়গায় আপনার admin email দিন।
