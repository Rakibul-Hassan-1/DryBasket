# ⚡ দ্রুত Firestore Rules ফিক্স - 2 মিনিটে

## 🎯 এই 3 ধাপ অনুসরণ করুন:

### ✅ STEP 1: Firebase Console খুলুন

```
https://console.firebase.google.com
↓
প্রজেক্ট: "next-firebase-dummy" বেছে নিন
↓
Firestore Database ক্লিক করুন (বাম সাইড)
↓
Rules ট্যাব ক্লিক করুন (উপরে)
```

### ✅ STEP 2: এই Code পেস্ট করুন

সব পুরাতন code delete করুন এবং এটি paste করুন:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### ✅ STEP 3: Publish করুন

```
নিচে "Publish" বাটন ক্লিক করুন ✓
সবুজ checkmark এবং "Publish succeeded" দেখা পর্যন্ত অপেক্ষা করুন ✓
```

---

## 🧪 এখন টেস্ট করুন

আপনার অ্যাপে ফিরে যান:

```
1. http://localhost:3000 এ যান
2. লগইন করুন
3. Cart এ অর্ডার যোগ করুন
4. "Place Order" ক্লিক করুন
5. Success! ✅ অর্ডার তৈরি হয়েছে
```

---

## ⚠️ যদি এখনও Error হয়?

### ডাবল-চেক করুন:

- [ ] Rules publish হয়েছে? (সবুজ checkmark দেখা যাচ্ছে?)
- [ ] আপনি logged-in আছেন অ্যাপে?
- [ ] Browser reload করেছেন? (F5)
- [ ] আপনার account Firebase authentication এ তৈরি?

### যদি সমস্যা থাকে:

1. **Browser console খুলুন**: F12
2. **Network tab দেখুন**: কী error আসছে?
3. **সম্পূর্ণ গাইড পড়ুন**: FIRESTORE_RULES_FIX.md

---

## 📱 প্রোডাকশনের জন্য (পরে)

নিরাপদ rules ব্যবহার করুন (FIRESTORE_RULES_FIX.md এ আছে)

- Users শুধু নিজের ডেটা এক্সেস করতে পারবে
- Admin সব ম্যানেজ করতে পারবে

---

## 🎉 Done!

Orders এখন সেভ হবে Firebase Firestore এ ✅
