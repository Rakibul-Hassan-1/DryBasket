# Firebase Phone Authentication Setup Guide

## Issue: "Firebase: Error (auth/operation-not-allowed)"

This error occurs when Phone Authentication is not enabled in Firebase Console.

## Step-by-Step Setup (Firebase Console)

### 1. Go to Firebase Console
- Open: https://console.firebase.google.com
- Select Project: **next-firebase-dummy**

### 2. Enable Phone Authentication
1. Click **Build** (left sidebar)
2. Click **Authentication**
3. Click on the **Sign-in method** tab
4. Scroll down and find **Phone**
5. Click on **Phone** option
6. Toggle the switch to **Enable** (blue)
7. Click **Save**

### 3. Configure Phone Numbers (Optional - for Testing)
In the Authentication → Phone tab, you can:
- Add test phone numbers for development
- Set test OTP codes to use during testing

### 4. Verify in Your App
After enabling:
1. Go to http://localhost:3000/cart
2. Click **Verify** button on phone field
3. Enter test number: `01812345678` or `+8801812345678`
4. Click **Send OTP**
5. Enter test OTP when prompted

## Test Phone Numbers (Development)

You can use any valid Bangladesh phone number format:
- `01812345678` (without country code)
- `+8801812345678` (with country code)
- `8801812345678` (alternative format)

## Firebase Limits
- **Free Plan**: 100 phone verifications/month
- **Blaze Plan**: Pay-as-you-go (recommended for production)

## Troubleshooting

### Still Getting "operation-not-allowed"?
1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear browser cache
3. Check Firebase project ID in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=next-firebase-dummy
   ```

### OTP Not Appearing?
- Check browser console for errors
- Ensure reCAPTCHA is initialized
- Check Firebase quota usage

## Support
- Firebase Docs: https://firebase.google.com/docs/auth/web/phone-auth
- Project: DryBasket Food E-commerce
- Admin: rakobulsagor@gmail.com
