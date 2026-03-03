# 🔥 Firebase Firestore Rules Update - বাংলায় গাইড

## ⚠️ এখন যা দেখছেন:

```
"Failed to load products. Please check Firebase rules."
```

## কারণ:

Firestore Database এর security rules guest users কে products collection পড়তে দিচ্ছে না।

---

## 🎯 সমাধান - 5 মিনিটে করুন:

### STEP 1: Firebase Console খুলুন

```
👉 https://console.firebase.google.com
```

### STEP 2: আপনার প্রজেক্ট খুলুন

```
প্রজেক্ট নাম: "next-firebase-dummy"
ক্লিক করুন
```

### STEP 3: Firestore Database খুলুন

```
বাম সাইডে মেনু দেখুন
"Firestore Database" ক্লিক করুন
(বা "Build" → "Firestore Database")
```

### STEP 4: Rules ট্যাব খুলুন

```
Database page এর উপরে 3টি ট্যাব আছে:
- Data
- Indexes
- Rules  ← এটি ক্লিক করুন
```

### STEP 5: এই নিয়ম পেস্ট করুন

সব পুরাতন text delete করুন এবং এটি paste করুন:

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

### STEP 6: Publish করুন

```
Rules editor এর নিচে বড় নীল বাটন আছে: "Publish"
এটি ক্লিক করুন
```

### STEP 7: সফলতা দেখুন

```
সবুজ checkmark ✓ এবং "Publish succeeded" দেখা পর্যন্ত অপেক্ষা করুন
(২-৩ সেকেন্ড লাগবে)
```

---

## ✅ এখন এটি কাজ করবে:

### Guest Users (login নেই):

- ✅ Products দেখতে পারে
- ❌ কিনতে পারবে না (login লাগবে)

### Logged-in Users:

- ✅ Products দেখতে পারে
- ✅ Add to cart করতে পারে
- ✅ Order place করতে পারে
- ✅ নিজের অর্ডার দেখতে পারে

### Admin User:

- ✅ সবকিছু করতে পারে
- (Email: admin@drybasket.com)

---

## 🧪 টেস্ট করুন Rules update এর পর:

1. **Browser refresh করুন**: F5
2. **পেজ reload করুন**: `http://localhost:3000`
3. **Products দেখা যাবে** ✅

যদি এখনও "Failed to load products" দেখায়:

- Browser cache clear করুন (Ctrl+Shift+Delete)
- Firebase Console এ Rules publish succeeded কিনা চেক করুন
- Console errors দেখুন (F12)

---

## 📝 Rules কী করছে (বিস্তারিত):

| Collection | Action     | Who            | Allow? |
| ---------- | ---------- | -------------- | ------ |
| products   | Read       | Anyone (guest) | ✅ YES |
| products   | Write      | Anyone         | ❌ NO  |
| products   | Write      | Admin          | ✅ YES |
| orders     | Read       | Owner only     | ✅ YES |
| orders     | Create     | Logged-in user | ✅ YES |
| users      | Read/Write | Owner only     | ✅ YES |

---

## ⏰ কত সময় লাগবে?

- Rules পেস্ট: 30 সেকেন্ড
- Publish: 5 সেকেন্ড
- Total: ১ মিনিট

**এখনই করুন!** ✨
