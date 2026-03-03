# 🚀 Email, SMS & Analytics Setup Guide

This guide will help you configure Email notifications, SMS integration, and Google Analytics for your DryBasket e-commerce platform.

---

## 📧 1. Email Notification Setup

### Option A: Gmail SMTP (Recommended for Development)

1. **Enable 2-Factor Authentication on your Google Account**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "DryBasket App" and click Generate
   - Copy the 16-character password

3. **Update `.env.local`**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # The app password you generated
   ```

### Option B: SendGrid (Recommended for Production)

1. **Create SendGrid Account**
   - Go to https://sendgrid.com/
   - Sign up for free (100 emails/day)

2. **Generate API Key**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Update `.env.local`**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### Option C: Resend (Modern Alternative)

1. **Create Resend Account**
   - Go to https://resend.com/
   - Sign up (free tier: 3,000 emails/month)

2. **Get API Key**
   - Go to API Keys
   - Create new API key
   - Copy the key

3. **Install Resend SDK**

   ```bash
   npm install resend
   ```

4. **Update Email Service**

   ```typescript
   // In src/lib/emailService.ts
   import { Resend } from "resend";

   const resend = new Resend(process.env.RESEND_API_KEY);

   export const sendOrderConfirmationEmail = async (data: EmailData) => {
     await resend.emails.send({
       from: "DryBasket <orders@drybasket.com.bd>",
       to: data.to,
       subject: data.subject,
       html: generateOrderEmailHTML(data),
     });
   };
   ```

---

## 📱 2. SMS Integration Setup (Bangladesh)

### Option A: SSL Wireless (Most Popular in BD)

1. **Create Account**
   - Go to https://sslwireless.com/
   - Contact sales: +8801707001234
   - Request SMS API access

2. **Get API Credentials**
   - After account approval, you'll receive:
     - API URL
     - API Token
     - Sender ID (e.g., "DryBasket")

3. **Update `.env.local`**

   ```env
   NEXT_PUBLIC_SMS_API_URL=https://smsplus.sslwireless.com/api/v3/send-sms
   NEXT_PUBLIC_SMS_API_KEY=your-ssl-wireless-api-token
   NEXT_PUBLIC_SMS_SENDER_ID=DryBasket
   ```

4. **Implementation Example**
   ```typescript
   // Update src/lib/smsService.ts
   const response = await fetch(SMS_CONFIG.apiUrl, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       Authorization: `Bearer ${SMS_CONFIG.apiKey}`,
     },
     body: JSON.stringify({
       api_token: SMS_CONFIG.apiKey,
       sid: SMS_CONFIG.senderId,
       msisdn: formattedPhone,
       sms: message,
       csms_id: Math.random().toString(36).substring(7),
     }),
   });
   ```

### Option B: BulkSMSBD

1. **Create Account**
   - Go to https://bulksmsbd.net/
   - Sign up and verify account
   - Buy SMS credits

2. **Get API Credentials**
   - Go to API Settings
   - Copy API Key

3. **Update `.env.local`**

   ```env
   NEXT_PUBLIC_SMS_API_URL=http://bulksmsbd.net/api/smsapi
   NEXT_PUBLIC_SMS_API_KEY=your-bulksmsbd-api-key
   NEXT_PUBLIC_SMS_SENDER_ID=DryBasket
   ```

4. **Implementation Example**
   ```typescript
   const url = `${SMS_CONFIG.apiUrl}?api_key=${SMS_CONFIG.apiKey}&type=text&number=${formattedPhone}&senderid=${SMS_CONFIG.senderId}&message=${encodeURIComponent(message)}`;
   const response = await fetch(url);
   ```

### Option C: Grameenphone API

1. **Register as Developer**
   - Go to https://developer.portal.gp/
   - Create developer account
   - Apply for SMS API access

2. **Get API Credentials**
   - After approval, get API key and endpoints

3. **Update `.env.local`**
   ```env
   NEXT_PUBLIC_SMS_API_URL=https://api.grameenphone.com/sms/send
   NEXT_PUBLIC_SMS_API_KEY=your-gp-api-key
   NEXT_PUBLIC_SMS_SENDER_ID=8801XXXXXXXXX
   ```

---

## 📊 3. Google Analytics Setup

### Step 1: Create GA4 Property

1. **Go to Google Analytics**
   - Visit https://analytics.google.com/
   - Sign in with your Google account

2. **Create Account**
   - Click "Start measuring"
   - Enter Account name: "DryBasket"
   - Configure data-sharing settings

3. **Create Property**
   - Property name: "DryBasket E-commerce"
   - Time zone: Bangladesh (GMT+6)
   - Currency: BDT (Bangladeshi Taka)

4. **Get Measurement ID**
   - After creating property, you'll see: `G-XXXXXXXXXX`
   - Copy this ID

### Step 2: Configure Environment

1. **Update `.env.local`**

   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. **Restart Development Server**
   ```bash
   npm run dev
   ```

### Step 3: Enable E-commerce Tracking

1. **In Google Analytics Dashboard**
   - Go to Admin → Property Settings
   - Click "Data Streams"
   - Select your web stream
   - Click "Configure tag settings"
   - Enable "Enhanced measurement"
   - Enable "E-commerce events"

2. **Set Up Conversions**
   - Go to Admin → Events
   - Mark these as conversions:
     - `purchase` (already marked by default)
     - `add_to_cart`
     - `begin_checkout`

### Step 4: Test Analytics

1. **Open Browser Console**

   ```javascript
   // Check if GA is loaded
   console.log(window.gtag);
   ```

2. **Test Events**
   - Add item to cart → Check console for "Analytics: Add to Cart"
   - Start checkout → Check console for "Analytics: Begin Checkout"
   - Complete purchase → Check console for "Analytics: Purchase"

3. **Real-time Verification**
   - Go to GA Dashboard → Reports → Realtime
   - Browse your site
   - You should see your activity in real-time

---

## 🔧 4. Production Backend Setup

For production, move email/SMS logic to backend API routes:

### Create API Route: `/app/api/send-notification/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Verify request (check API key, validate data, etc.)

    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DryBasket" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    // Send SMS
    const smsResponse = await fetch(process.env.SMS_API_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_token: process.env.SMS_API_KEY,
        phone: data.phone,
        message: data.smsMessage,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
```

### Update Client-Side Services

```typescript
// In src/lib/emailService.ts
export const sendOrderConfirmationEmail = async (data: EmailData) => {
  const response = await fetch("/api/send-notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "email",
      to: data.to,
      subject: data.subject,
      html: generateOrderEmailHTML(data),
    }),
  });

  return response.ok;
};
```

---

## ✅ 5. Testing Checklist

### Email Testing

- [ ] Send test email to your address
- [ ] Verify order details are correct
- [ ] Check email formatting in different clients (Gmail, Outlook)
- [ ] Test with different order amounts and items
- [ ] Verify email arrives within 30 seconds

### SMS Testing

- [ ] Send test SMS to your BD phone number
- [ ] Verify message content and formatting
- [ ] Test with different phone number formats (88017..., 017..., +8801...)
- [ ] Check character limits (160 chars for single SMS)
- [ ] Verify delivery within 1 minute

### Analytics Testing

- [ ] Check browser console for analytics logs
- [ ] Add item to cart → Verify in GA Realtime
- [ ] Begin checkout → Verify in GA Realtime
- [ ] Complete purchase → Verify in GA Realtime
- [ ] Wait 24 hours → Check GA Reports for data

---

## 🐛 6. Troubleshooting

### Email Issues

**Problem**: "Invalid login" error

- **Solution**: Use App Password, not regular Gmail password
- **Check**: 2FA is enabled on Google account

**Problem**: Emails go to spam

- **Solution**:
  - Add SPF record to domain
  - Use authenticated SMTP service (SendGrid, AWS SES)
  - Avoid spam trigger words in subject

**Problem**: "Connection timeout"

- **Solution**: Check firewall settings, try port 465 (SSL) instead of 587

### SMS Issues

**Problem**: SMS not delivered

- **Solution**:
  - Verify phone number format (88017XXXXXXXX)
  - Check SMS gateway account balance
  - Verify sender ID is approved

**Problem**: "Invalid API key"

- **Solution**: Double-check API key in .env.local, ensure no extra spaces

### Analytics Issues

**Problem**: No data in GA dashboard

- **Solution**:
  - Wait 24-48 hours for data processing
  - Check Realtime reports for immediate feedback
  - Verify Measurement ID is correct

**Problem**: Events not tracked

- **Solution**:
  - Open browser console and check for errors
  - Verify `initGA()` is called before events
  - Check if ad blockers are blocking GA

---

## 📚 7. Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid API Docs](https://docs.sendgrid.com/)
- [SSL Wireless SMS API](https://sslwireless.com/sms-api)
- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)
- [GA4 E-commerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)

---

## 🎯 Next Steps

1. ✅ Set up Google Analytics (easiest, free)
2. ✅ Configure email service (Gmail for dev, SendGrid for prod)
3. ✅ Set up SMS gateway (contact providers for pricing)
4. ✅ Test all notifications thoroughly
5. ✅ Monitor analytics dashboard daily
6. ✅ Move to backend API routes before production launch

**Questions?** Check the console logs for detailed debugging information!
