# DryBasket - Professional Food E-commerce Platform

A complete e-commerce platform for dry foods built with Next.js 16, Firebase, and TypeScript. Features include shopping cart, order management, invoice generation with QR codes, email notifications, SMS integration, and Google Analytics.

## ✨ Features

### 🛒 E-commerce Core

- ✅ Product Catalog with Search & Filter
- ✅ Shopping Cart Management
- ✅ Checkout with Form Validation
- ✅ Order Management System
- ✅ Stock Management

### 🔐 Authentication & Security

- ✅ Firebase Authentication (Email/Password)
- ✅ Protected Routes
- ✅ Guest Browsing (Login required for purchase)
- ✅ Auth State Management with Context API

### 📄 Invoice System

- ✅ Professional PDF Invoice Generation
- ✅ QR Code Integration for Verification
- ✅ Invoice Verification Portal (3 methods)
- ✅ Weight & Product Details Display

### 📧 Notifications & Communication

- ✅ Email Notifications (Order Confirmation)
- ✅ SMS Integration (Order Updates)
- ✅ Professional Email Templates
- ✅ Bangladesh SMS Gateway Support

### 📊 Analytics & Insights

- ✅ Google Analytics 4 Integration
- ✅ E-commerce Event Tracking
- ✅ Purchase Tracking
- ✅ User Behavior Analytics

### 🎨 UI/UX

- ✅ Professional Landing Page
- ✅ Responsive Design
- ✅ Loading Skeletons
- ✅ Hover Effects & Animations
- ✅ Toast Notifications

### 👨‍💼 Admin Dashboard

- ✅ Overview Statistics
- ✅ Product Management
- ✅ Order Management
- ✅ User Management

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Bangladesh)
NEXT_PUBLIC_SMS_API_URL=your-sms-gateway-url
NEXT_PUBLIC_SMS_API_KEY=your-api-key
NEXT_PUBLIC_SMS_SENDER_ID=DryBasket
```

See `SETUP_NOTIFICATIONS.md` for detailed setup instructions.

### 3. Configure Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Create Firestore database
4. Update Firestore rules (see below)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔐 Firestore Security Rules

Update your Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Public read, authenticated write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders: Public read for verification, authenticated write
    match /orders/{orderId} {
      allow read: if true; // Required for invoice verification
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.token.email == 'admin@drybasket.com');
    }

    // Admin-only access to other collections
    match /{document=**} {
      allow read, write: if request.auth != null &&
        request.auth.token.email == 'admin@drybasket.com';
    }
  }
}
```

## 📦 Project Structure

```
firebase-next-app/
├── app/
│   ├── page.tsx              # Landing page with product catalog
│   ├── layout.tsx            # Root layout with providers
│   ├── login/                # Authentication pages
│   ├── cart/                 # Shopping cart & checkout
│   ├── orders/               # Order history
│   ├── admin-dashboard/      # Admin panel
│   └── verify-invoice/       # Invoice verification
├── src/
│   ├── components/
│   │   ├── SiteNav.tsx       # Navigation bar
│   │   └── AnalyticsProvider.tsx  # GA4 integration
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── CartContext.tsx   # Shopping cart state
│   └── lib/
│       ├── firebase.ts       # Firebase configuration
│       ├── store.ts          # Data operations
│       ├── invoiceGenerator.ts  # PDF invoice generation
│       ├── analytics.ts      # Google Analytics tracking
│       ├── emailService.ts   # Email notifications
│       └── smsService.ts     # SMS integration
└── public/                   # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Auth 12
- **Database**: Firebase Firestore 12
- **PDF Generation**: jsPDF
- **QR Codes**: qrcode library
- **Analytics**: react-ga4 (Google Analytics 4)
- **Email**: nodemailer (production setup required)

## 📊 Product Configuration

All products use Bengali Taka (৳) currency:

| Product              | Price | Weight | Stock |
| -------------------- | ----- | ------ | ----- |
| Premium Basmati Rice | ৳1962 | 5kg    | 50    |
| Organic Red Lentils  | ৳981  | 2kg    | 80    |
| Whole Wheat Flour    | ৳1308 | 5kg    | 60    |
| Raw Peanuts          | ৳654  | 1kg    | 100   |
| Medjool Dates        | ৳1199 | 500g   | 35    |
| Cashew Nuts          | ৳1526 | 500g   | 40    |

**Fixed Delivery Charge**: ৳120 (all orders)

## 🚀 Features in Detail

### Invoice System

- Professional PDF generation with company branding
- QR code contains encrypted order data
- 3 verification methods:
  1. Invoice number (e.g., INV-D7GGTDMIZRK1)
  2. QR code data paste
  3. QR code image upload (scan)

### Email Notifications

- Order confirmation emails with details
- Professional HTML templates
- Automatic invoice attachment (production setup required)
- Supports Gmail, SendGrid, AWS SES, Mailgun

### SMS Integration

- Order confirmation SMS
- Status update notifications
- Bangladesh phone number formatting (88017...)
- Supports SSL Wireless, BulkSMSBD, Grameenphone

### Analytics Tracking

- Page views
- Product views (on hover)
- Add to cart events
- Checkout initiation
- Purchase completion
- Full e-commerce tracking

## 📖 Documentation

- **[SETUP_NOTIFICATIONS.md](SETUP_NOTIFICATIONS.md)** - Complete guide for Email, SMS, and Analytics setup
- **[.env.example](.env.example)** - Environment variables template

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 Admin Access

To access admin dashboard:

1. Register with email: `admin@drybasket.com`
2. Login with your credentials
3. Access `/admin-dashboard`

## 🐛 Troubleshooting

### Email Issues

- Verify SMTP credentials in `.env.local`
- Use Gmail App Password (not regular password)
- Check firewall settings for port 587

### SMS Issues

- Verify phone number format (88017...)
- Check SMS gateway API credentials
- Ensure sufficient account balance

### Analytics Issues

- Wait 24-48 hours for data in GA dashboard
- Check browser console for tracking logs
- Verify Measurement ID is correct
- Disable ad blockers for testing

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📞 Support

For questions or issues:

- Email: support@drybasket.com.bd
- Phone: 09638001122

---

**Built with ❤️ using Next.js and Firebase**

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
firebase-next-app/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Protected home page
│   └── login/
│       └── page.js         # Login/Register page
├── src/
│   ├── contexts/
│   │   └── AuthContext.js  # Authentication context
│   └── lib/
│       └── firebase.js     # Firebase configuration
```

## Usage

### Register a New User

1. Go to `/login`
2. Enter email and password
3. Click "Create Account"
4. You'll be automatically logged in and redirected to home page

### Login

1. Go to `/login`
2. Enter your registered email and password
3. Click "Login"
4. You'll be redirected to home page

### Logout

Click the "Logout" button on the home page.

## Security Note

⚠️ **Important**: The Firebase configuration in `src/lib/firebase.js` contains API keys. While these are safe to expose in client-side code (they are public by design), you should:

1. Set up Firebase Security Rules to protect your data
2. Use environment variables for production
3. Never commit `.env.local` to version control

## Technologies Used

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Firebase 12](https://firebase.google.com/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## License

MIT
# DryBasket
