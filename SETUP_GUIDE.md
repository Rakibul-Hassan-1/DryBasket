# 📸 Admin Setup - ভিজ্যুয়াল গাইড

## 🎯 লক্ষ্য: Admin Account তৈরি এবং Dashboard ব্যবহার করা

---

## ✅ STEP 1: Firebase Project সেটআপ

### 1.1 Firebase Console এ যান
```
👉 https://console.firebase.google.com
```

### 1.2 আপনার প্রজেক্ট খুলুন
- বিদ্যমান প্রজেক্ট বেছে নিন বা নতুন তৈরি করুন
- প্রজেক্ট নাম: "DryBasket" বা যেকোনো নাম

### 1.3 Project Settings এ যান
```
⚙️ সেটিংস আইকন → Project Settings
```

### 1.4 Web App যোগ করুন
```
গ্লোবাল আইকন → "</>" চিহ্ন → "Add app"
→ "Web" বেছে নিন
→ অ্যাপ নাম দিন: "DryBasket"
```

### 1.5 Firebase Config কপি করুন
```javascript
// এই ফরম্যাটে credentials পাবেন:
{
  apiKey: "AIzaSyC...",
  authDomain: "firebase-next-app.firebaseapp.com",
  projectId: "firebase-next-app",
  storageBucket: "firebase-next-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
}
```

---

## ✅ STEP 2: Environment Variables সেটআপ

### 2.1 `.env.local` ফাইল খুলুন
```
📁 firebase-next-app/.env.local
```

### 2.2 Firebase Credentials পেস্ট করুন
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC_your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=firebase-next-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=firebase-next-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=firebase-next-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=admin@drybasket.com
```

### 2.3 Dev Server রিস্টার্ট করুন
```bash
# Terminal এ:
Ctrl+C (বর্তমান সার্ভার বন্ধ করুন)
npm run dev (নতুন করে চালু করুন)
```

---

## ✅ STEP 3: Admin Account তৈরি করুন

### 3.1 Login পেজে যান
```
👉 http://localhost:3000/login
```

### 3.2 Register ট্যাবে ক্লিক করুন
```
┌─────────────────────────────┐
│  Login         │ Register  │  ← এখানে ক্লিক করুন
└─────────────────────────────┘
```

### 3.3 নিম্নলিখিত তথ্য ভরুন

```
┌──────────────────────────────────────┐
│  Full Name:  Admin User              │
├──────────────────────────────────────┤
│  Phone:      01234567890             │
├──────────────────────────────────────┤
│  Address:    Admin Office            │
├──────────────────────────────────────┤
│  Email Address:  admin@drybasket.com │
├──────────────────────────────────────┤
│  Password:   DryBasket@123456        │
│  [Show/Hide]                         │
├──────────────────────────────────────┤
│  [✓] Create DryBasket Account        │
└──────────────────────────────────────┘
```

### 3.4 "Create DryBasket Account" ক্লিক করুন
```
✓ Account তৈরি হবে
✓ Firebase এ সেভ হবে
✓ স্বয়ংক্রিয়ভাবে লগইন হয়ে যাবে
```

---

## ✅ STEP 4: Admin Navigation দেখুন

### 4.1 লগইন হওয়ার পর Navigation দেখা যাবে
```
┌─────────────────────────────────────────────────────┐
│  DryBasket  Shop  Cart  📦 Manage  📊 Dashboard     │
│                                    Products    Logout│
└─────────────────────────────────────────────────────┘
```

### 4.2 Admin লিঙ্ক পাবেন:
- ✅ **📦 Manage Products** - পণ্য যোগ করতে
- ✅ **📊 Dashboard** - সব ম্যানেজ করতে

---

## ✅ STEP 5: Admin Dashboard অ্যাক্সেস করুন

### 5.1 দুটি উপায়ে প্রবেশ করা যায়

**পদ্ধতি ১: Navigation থেকে**
```
Navigation বারে "📊 Dashboard" ক্লিক করুন
```

**পদ্ধতি ২: সরাসরি URL**
```
👉 http://localhost:3000/admin-dashboard
```

### 5.2 Dashboard পাবেন এমনটি
```
┌──────────────────────────────────────────────────┐
│  Admin Dashboard                    ← Back to Shop│
│  Welcome back, admin@drybasket.com               │
├──────────────────────────────────────────────────┤
│  📊 Overview  │ 📦 Products │ 🛒 Orders │ 👥 Users│
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Products │ │ Orders   │ │ Users    │        │
│  │ 30       │ │ 45       │ │ 120      │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Revenue: $3,250.00                       │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Dashboard এর 4টি ট্যাব

### Tab 1: 📊 Overview
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Products   │   Orders    │  Revenue    │   Users     │
│  📦         │   🛒        │   💰        │   👥        │
│  30         │   45        │   $3,250.00 │   120       │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Tab 2: 📦 Products
```
Name      │ Category   │ Price  │ Stock │ Status
──────────────────────────────────────────────────
Rice      │ Dry Foods  │ $5.99  │ 45    │ 🟢 In Stock
Lentils   │ Dry Foods  │ $3.99  │ 8     │ 🟡 Low Stock
Flour     │ Dry Foods  │ $2.99  │ 0     │ 🔴 Out

[+ Add Product]
```

### Tab 3: 🛒 Orders
```
Order #ABC123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customer: user@example.com
Amount: $15.97
Status: 🟡 Pending

Shipping: John Doe
Phone: 01234567890
Address: Dhaka
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Items:
• Rice × 2 = $11.98
• Lentils × 1 = $3.99
```

### Tab 4: 👥 Users
```
Name       │ Email              │ Phone        │ Role
──────────────────────────────────────────────────────
John Doe   │ john@example.com   │ 01234567890  │ Customer
Admin User │ admin@drybasket.com│ 01555555555  │ Admin
```

---

## 💡 ব্যবহারের উদাহরণ

### উদাহরণ 1: নতুন পণ্য যোগ করুন
```
1. Dashboard → 📦 Products ট্যাব
2. [+ Add Product] বাটন ক্লিক করুন
3. পণ্যের তথ্য ভরুন:
   - নাম: মসুর ডাল
   - বিভাগ: Dry Foods
   - দাম: $4.99
   - স্টক: 50
4. [Add Product] ক্লিক করুন
```

### উদাহরণ 2: অর্ডার চেক করুন
```
1. Dashboard → 🛒 Orders ট্যাব
2. সর্বশেষ অর্ডার দেখুন
3. গ্রাহক তথ্য যাচাই করুন
4. পেমেন্ট স্ট্যাটাস চেক করুন
```

### উদাহরণ 3: স্টক যাচাই করুন
```
1. Dashboard → 📊 Overview
2. মোট পণ্য সংখ্যা দেখুন
3. 📦 Products ট্যাবে যান
4. লো স্টক আইটেম চিহ্নিত করুন (🟡)
5. প্রয়োজন অনুযায়ী নতুন পণ্য যোগ করুন
```

---

## ✨ All Set!

```
✅ Firebase সেটআপ করা হয়েছে
✅ Admin Account তৈরি করা হয়েছে
✅ Dashboard অ্যাক্সেস করা যায়
✅ সব ফিচার কাজ করছে

👉 এখন Dashboard এক্সপ্লোর করুন এবং ব্যবসা পরিচালনা করুন! 🚀
```

---

## ❓ সাধারণ প্রশ্ন

**Q: Password ভুলে গেছি, কী করব?**
A: "Forgot Password" লিঙ্ক ক্লিক করুন বা নতুন অ্যাকাউন্ট তৈরি করুন।

**Q: অন্য কম্পিউটারে অ্যাক্সেস করতে পারব?**
A: হ্যাঁ, একই ইমেইল এবং পাসওয়ার্ড দিয়ে যেকোনো জায়গা থেকে লগইন করুন।

**Q: Mobile থেকে অ্যাক্সেস করা যায়?**
A: হ্যাঁ, সব ডিভাইসে কাজ করে (রেসপন্সিভ ডিজাইন)।

**Q: অর্ডার স্ট্যাটাস পরিবর্তন করব কীভাবে?**
A: এই ফিচার শীঘ্রই যোগ হবে। এখন Orders দেখতে পারেন শুধু।

---

**প্রশ্ন থাকলে এই গাইড আবার পড়ুন বা ADMIN_READY.md দেখুন! 📖**
