# 🔧 Firestore Security Rules - অর্ডার প্লেসমেন্ট ফিক্স

## 🔴 সমস্যা

Order placement error: **"Failed to place order. Please check your Firebase permissions."**

**কারণ**: Firestore security rules authenticated users কে `orders` collection এ লিখতে দিচ্ছে না।

---

## ✅ সমাধান - Firestore Rules আপডেট করুন

### STEP 1: Firebase Console এ যান

```
👉 https://console.firebase.google.com
```

### STEP 2: আপনার প্রজেক্ট খুলুন

- প্রজেক্ট নাম: `next-firebase-dummy`

### STEP 3: Firestore Database খুলুন

```
Left Sidebar → "Firestore Database" ক্লিক করুন
```

### STEP 4: Rules ট্যাব খুলুন

```
Database page এর top এ "Rules" ট্যাব খুলুন
```

---

## 🔐 নতুন Rules সেট করুন

### বর্তমান Rules (সম্ভবত এই রকম):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### নতুন Rules - DEVELOPMENT (দ্রুত টেস্টিংয়ের জন্য):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write everything
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ নোট**: এটি শুধুমাত্র ডেভেলপমেন্টের জন্য। প্রোডাকশনে আরও নিরাপদ rules ব্যবহার করুন।

### নিরাপদ Rules - PRODUCTION:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection - সবাই পড়তে পারবে, শুধু admin লিখতে পারবে
    match /products/{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth != null &&
                                      request.auth.token.email == 'admin@drybasket.com';
    }

    // Orders collection - নিজের অর্ডার পড়তে পারবে, নিজের অর্ডার তৈরি করতে পারবে
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                    request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                      request.auth.uid == request.resource.data.userId;
    }

    // Admin access - admin সব কিছু করতে পারবে
    match /{document=**} {
      allow read, write: if request.auth != null &&
                           request.auth.token.email == 'admin@drybasket.com';
    }
  }
}
```

---

## 📝 Rules কীভাবে আপডেট করবেন

### STEP 1: Rules এডিটর খুলুন

```
Firebase Console → Firestore Database → Rules ট্যাব
```

### STEP 2: সব পুরাতন code সিলেক্ট করুন

```
Ctrl+A (Windows) অথবা Cmd+A (Mac)
```

### STEP 3: নতুন rules পেস্ট করুন

```
উপরের DEVELOPMENT rules কপি করুন এবং পেস্ট করুন
```

### STEP 4: "Publish" বাটন ক্লিক করুন

```
Rules এডিটরের নিচে "Publish" বাটন খুঁজুন এবং ক্লিক করুন
```

### STEP 5: সম্পূর্ণ হওয়ার জন্য অপেক্ষা করুন

```
সবুজ চেকমার্ক দেখা পর্যন্ত অপেক্ষা করুন এবং "Publish succeeded" মেসেজ দেখুন
```

---

## ✅ ফিক্স ভেরিফাই করুন

### টেস্ট করুন:

1. **অ্যাপ এ যান**: `http://localhost:3000`
2. **লগইন করুন**: ব্যবহারকারী account দিয়ে
3. **প্রোডাক্ট যোগ করুন**: Cart এ কিছু আইটেম যোগ করুন
4. **অর্ডার প্লেস করুন**: Cart page এ checkout form পূরণ করুন
5. **সফল হওয়া উচিত**: "order placed successfully" মেসেজ পাওয়া উচিত এবং `/orders` page এ রিডাইরেক্ট হওয়া উচিত

### যদি সমস্যা থেকে যায়:

```
1. Browser console খুলুন (F12)
2. Network tab দেখুন
3. কী error আসছে তা চেক করুন
4. Firebase rules নির্ভুল কিনা আবার চেক করুন
```

---

## 🔍 Rules কীভাবে কাজ করে

### DEVELOPMENT Rules (সহজ version):

- `allow read, write: if request.auth != null`
  - মানে: কোনো logged-in user লিখতে এবং পড়তে পারবে
  - সুবিধা: দ্রুত টেস্ট করা যায়
  - ঝুঁকি: সব users সব ডেটা এক্সেস করতে পারবে

### PRODUCTION Rules (নিরাপদ version):

- Users শুধু নিজের অর্ডার পড়তে পারে
- Users শুধু নিজের নামে অর্ডার তৈরি করতে পারে
- Admin সবকিছু পরিচালনা করতে পারে
- Products collection সবাই পড়তে পারে, শুধু admin তৈরি/আপডেট করতে পারে

---

## 📌 গুরুত্বপূর্ণ পয়েন্ট

### Admin Email কনফিগার করা আছে কি?

```
File: .env.local
Value: NEXT_PUBLIC_ADMIN_EMAIL=admin@drybasket.com
```

প্রোডাকশন rules এ এই email use হবে।

### Firebase Auth সাজানো আছে কি?

```
✅ করা হয়েছে - Authentication setup complete
- Email/Password enabled
- Login page কাজ করছে
```

### Firestore Collections তৈরি করা আছে কি?

```
✅ করা হয়েছে - Auto-created by the app:
- /products (sample data)
- /orders (empty, waiting for your order)
- /users (optional, for user profiles)
```

---

## 🆘 ট্রাবলশুটিং

### Error: "Missing or insufficient permissions"

**সমাধান**: DEVELOPMENT rules ব্যবহার করুন উপরে দেওয়া মত

### Error: "Permission denied"

**সমাধান**:

1. আপনি logged-in আছেন কি চেক করুন
2. Rules publish হয়েছে কি চেক করুন (সবুজ checkmark দেখুন)
3. Browser cache clear করুন: Ctrl+Shift+Delete

### Rules publish হচ্ছে না

**সমাধান**:

1. Syntax errors চেক করুন
2. Comments সঠিক আছে কি দেখুন
3. Firebase console reload করুন

---

## 📚 উপকারী লিঙ্ক

- Firestore Rules Documentation: https://firebase.google.com/docs/firestore/security/start
- Security Rules Playground: https://firebase.google.com/docs/firestore/security/test-rules-emulator
- Firebase Console: https://console.firebase.google.com

---

## ✨ পরবর্তী ধাপ (Rules ফিক্স করার পর)

1. ✅ অর্ডার প্লেসমেন্ট টেস্ট করুন
2. ✅ Invoice generation টেস্ট করুন
3. ✅ অর্ডার হিস্টরি পেজ টেস্ট করুন
4. ✅ Admin dashboard টেস্ট করুন
5. ✅ Complete checkout flow টেস্ট করুন
