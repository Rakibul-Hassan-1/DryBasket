# 🛡️ Admin Account - সম্পূর্ণ সেটআপ গাইড

## ✅ Admin Credentials

```
📧 Email:    admin@drybasket.com
🔑 Password: DryBasket@123456 (আপনি পরিবর্তন করতে পারেন)
```

### কীভাবে Admin Account তৈরি করবেন?

#### Step 1: আপনার Firebase Project সেটআপ করুন

1. **Google Firebase তে যান**: https://console.firebase.google.com
2. **New Project তৈরি করুন** বা বিদ্যমান প্রজেক্ট ব্যবহার করুন
3. **Project Settings** এ যান
4. **Web App** এড করুন
5. Firebase Configuration কপি করুন এবং `.env.local` এ পেস্ট করুন

#### Step 2: Environment Variables আপডেট করুন

`.env.local` ফাইলে এই লাইনগুলো আপনার Firebase credentials দিয়ে পূরণ করুন:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=আপনার_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=আপনার_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=আপনার_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=আপনার_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=আপনার_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=আপনার_app_id

# Admin Email
NEXT_PUBLIC_ADMIN_EMAIL=admin@drybasket.com
```

#### Step 3: Admin Account তৈরি করুন

1. **ওয়েবসাইটে যান**: `http://localhost:3000/login`
2. **Register** ট্যাবে ক্লিক করুন
3. এই তথ্য দিয়ে রেজিস্টার করুন:
   ```
   Full Name:  Admin User
   Phone:      01234567890
   Address:    Admin Office
   Email:      admin@drybasket.com
   Password:   DryBasket@123456
   ```
4. **Create DryBasket Account** বাটন ক্লিক করুন

#### Step 4: Admin Verify করুন

1. লগইন করুন সাথে সাথে
2. নেভিগেশন বারে এই দুটি লিঙ্ক পাবেন:
   - 📦 **Manage Products** - পণ্য যোগ করতে
   - 📊 **Dashboard** - সব কিছু দেখতে

#### Step 5: Admin Dashboard অ্যাক্সেস করুন

`/admin-dashboard` URL এ যান বা Navigation থেকে **📊 Dashboard** ক্লিক করুন।

---

## 🎯 Admin Dashboard এ কী করতে পারবেন?

### 1. **📊 Overview Tab**

- সব পণ্যের সংখ্যা দেখুন
- সব অর্ডারের সংখ্যা দেখুন
- মোট আয় দেখুন
- মোট ব্যবহারকারী দেখুন

### 2. **📦 Products Management**

- সব পণ্যের তালিকা দেখুন
- পণ্যের স্টক স্ট্যাটাস চেক করুন:
  - 🟢 **In Stock** - ১০+ ইউনিট
  - 🟡 **Low Stock** - ১-১০ ইউনিট
  - 🔴 **Out** - ০ ইউনিট
- **"+ Add Product"** বাটন দিয়ে নতুন পণ্য যোগ করুন

### 3. **🛒 Orders Management**

- সব গ্রাহক অর্ডার দেখুন
- অর্ডার বিস্তারিত:
  - গ্রাহক তথ্য (নাম, ফোন, ঠিকানা)
  - অর্ডার করা আইটেম
  - মোট পরিমাণ
  - অর্ডার স্ট্যাটাস (Pending/Shipped/Delivered)
  - পেমেন্ট পদ্ধতি

### 4. **👥 Users Management**

- সব নিবন্ধিত ব্যবহারকারী দেখুন
- ব্যবহারকারীর তথ্য:
  - নাম, ইমেইল, ফোন, ঠিকানা
  - ব্যবহারকারীর ধরন (Customer/Admin)

---

## 🔐 নিরাপত্তা টিপস

⚠️ **গুরুত্বপূর্ণ**:

- ✅ Strong Password ব্যবহার করুন (অন্তত ১২ ক্যারেক্টার, মিশ্র ক্যাস করে)
- ✅ Admin Email গোপনীয় রাখুন
- ✅ Firebase Credentials কখনো GitHub তে commit করবেন না
- ✅ `.env.local` ফাইল `.gitignore` এ থাকা উচিত

---

## 📋 প্রথম করণীয় কাজ

1. ✅ Admin Account তৈরি করুন (উপরের স্টেপ অনুসরণ করুন)
2. ✅ Dashboard এ লগইন করুন
3. ✅ কয়েকটি পণ্য যোগ করুন (Manage Products থেকে)
4. ✅ পণ্য তালিকা দেখুন (Products Tab এ)
5. ✅ সব স্ট্যাটিস্টিক্স চেক করুন (Overview Tab এ)

---

## 🔗 দ্রুত লিঙ্ক

| পেজ             | URL                | উদ্দেশ্য        |
| --------------- | ------------------ | --------------- |
| Shop            | `/`                | পণ্য কিনুন      |
| Admin Dashboard | `/admin-dashboard` | সব ম্যানেজ করুন |
| Add Products    | `/admin`           | পণ্য যোগ করুন   |
| Cart            | `/cart`            | শপিং কার্ট      |
| Orders          | `/orders`          | অর্ডার ইতিহাস   |
| Login           | `/login`           | লগইন/রেজিস্টার  |

---

## ❓ সমস্যা হলে কী করবেন?

### সমস্যা: Dashboard এ "Admin Access Only" দেখাচ্ছে

**সমাধান:**

1. `.env.local` এ `NEXT_PUBLIC_ADMIN_EMAIL` সঠিক আছে কি চেক করুন
2. রেজিস্টার করা ইমেইল এবং `.env.local` এর ইমেইল এক্সাক্ট ম্যাচ করতে হবে
3. ডেভ সার্ভার রিস্টার্ট করুন (`Ctrl+C` দিয়ে বন্ধ করে আবার চালু করুন)

### সমস্যা: Firebase Credentials Error

**সমাধান:**

1. Firebase Console এ যান এবং সঠিক Credentials কপি করুন
2. `.env.local` এ পেস্ট করুন
3. সার্ভার রিস্টার্ট করুন

### সমস্যা: লগইন করতে পারছেন না

**সমাধান:**

1. Firebase Authentication সক্ষম আছে কি চেক করুন
2. Email/Password প্রোভাইডার এনাবল আছে কি চেক করুন
3. পাসওয়ার্ড সঠিক আছে কি ভেরিফাই করুন

---

## 💡 টিপস

🎯 **নিয়মিত ব্যবহার করুন:**

- প্রতিদিন Dashboard চেক করুন
- নতুন অর্ডার দেখুন
- স্টক কম হলে পণ্য যোগ করুন

📱 **মোবাইল থেকেও অ্যাক্সেস করতে পারবেন:**

- সব ফিচার রেসপন্সিভ
- মোবাইলে ট্যাবলেট-এ পারফেক্টভাবে কাজ করে

🔄 **ডেটা রিয়েল-টাইম:**

- Dashboard সবসময় লেটেস্ট ডেটা দেখায়
- পেজ রিফ্রেশ করলে নতুন ডেটা আপডেট হয়

---

## ✨ সম্পূর্ণভাবে প্রস্তুত!

আপনার Admin Account এবং Dashboard এখন সম্পূর্ণভাবে প্রস্তুত। শুধু এই গাইড অনুসরণ করুন এবং শুরু করুন! 🚀

**যেকোনো প্রশ্ন থাকলে ড্যাশবোর্ড ব্যবহার করে দেখুন - সবকিছুই সহজ এবং ইউজার-ফ্রেন্ডলি।**
