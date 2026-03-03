# Quick Setup Guide - Email Configuration

## 🔧 Gmail SMTP Setup (5 Minutes)

### Step 1: Enable 2-Factor Authentication

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Type: "DryBasket"
4. Click "Generate"
5. Copy the 16-character password (example: `abcd efgh ijkl mnop`)

### Step 3: Create `.env.local` file

Create a file named `.env.local` in the root directory and add:

```env
# Firebase (your existing config)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Email Configuration (ADD THESE)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

**Replace:**

- `your-email@gmail.com` with your Gmail address
- `abcd efgh ijkl mnop` with your App Password from Step 2

### Step 4: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Test

1. Place an order
2. Check your email inbox
3. Look for "Order Confirmation - DryBasket"

## 🐛 Troubleshooting

**"Invalid login"** error:

- Make sure you're using App Password, NOT your regular Gmail password
- Remove all spaces from the App Password in `.env.local`

**Email not received:**

- Check spam/junk folder
- Wait 1-2 minutes
- Check browser console for errors
- Verify SMTP credentials are correct

**"Connection refused":**

- Check your firewall settings
- Try port 465 instead of 587
- Make sure 2FA is enabled on Google account

## 📧 Email Will Include:

- Order number
- Customer name
- Item list with quantities
- Subtotal, delivery charge, total
- Shipping address
- Professional HTML template

---

**Need help?** Check the console logs for detailed error messages!
