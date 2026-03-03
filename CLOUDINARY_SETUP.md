# ☁️ Cloudinary Setup Guide

## ✅ Step 1: Create Cloudinary Account

1. যান: https://cloudinary.com/users/register_free
2. Sign up করুন (Email দিয়ে)
3. Email verify করুন
4. Dashboard এ login করুন

## ✅ Step 2: Get Cloud Name

Dashboard এ login করার পর:

- উপরে **"Product Environment Credentials"** section দেখবেন
- **"Cloud Name"** কপি করুন (যেমন: `dxxxxxxxx`)

## ✅ Step 3: Create Upload Preset

1. Dashboard থেকে **Settings** (⚙️ gear icon) ক্লিক করুন
2. **"Upload"** tab এ যান
3. Scroll করে নিচে **"Upload presets"** section খুঁজুন
4. **"Add upload preset"** button ক্লিক করুন
5. Settings configure করুন:
   ```
   Preset name: drybasket_products
   Signing Mode: Unsigned (important!)
   Folder: drybasket (optional)
   ```
6. **Save** button ক্লিক করুন

## ✅ Step 4: Update Environment Variables

`.env.local` file খুলুন এবং update করুন:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=drybasket_products
```

**Example:**

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dab123xyz
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=drybasket_products
```

## ✅ Step 5: Restart Development Server

Terminal এ:

```bash
# Server stop করুন (Ctrl+C)
npm run dev
```

## ✅ Step 6: Test Image Upload

1. Admin panel এ যান: http://localhost:3000/admin
2. Image select করুন
3. Product details fill করুন
4. **"Add Product"** ক্লিক করুন
5. Console (F12) এ success message দেখবেন

---

## 🎯 Cloudinary Free Tier Benefits:

- ✅ **25 GB storage** (Firebase এর চেয়ে বেশি!)
- ✅ **25 GB bandwidth/month**
- ✅ **Automatic image optimization**
- ✅ **Image transformations** (resize, crop, etc.)
- ✅ **CDN delivery** (fast loading)

## 🔍 Troubleshooting:

### Error: "Cloudinary not configured"

- `.env.local` file এ credentials ঠিকমত আছে কিনা check করুন
- Server restart করেছেন কিনা দেখুন

### Error: "Upload preset not found"

- Upload preset name ঠিক আছে কিনা verify করুন
- **Signing Mode** যে **"Unsigned"** আছে confirm করুন

### Error: "Invalid signature"

- Upload preset এ **"Unsigned"** mode select করুন
- Save করে page refresh করুন

---

## 📸 Image URLs:

Upload করার পর images এই format এ পাবেন:

```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/drybasket/filename.jpg
```

এই URLs সরাসরি products এ save হবে এবং সব জায়গায় কাজ করবে!

---

**Setup complete! 🎉**
