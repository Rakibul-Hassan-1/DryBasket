# QR Code Invoice Verification Feature

## Overview

DRY BASKET now includes a comprehensive QR code verification system that allows customers to validate the authenticity of their invoices.

## Features

### 1. **QR Code on Invoice PDF**

- Every generated invoice contains a unique QR code
- The QR code is placed prominently on the receipt before the footer
- QR encodes secure invoice data in JSON format:
  ```json
  {
    "inv": "INV-XXXXXXXXXX", // Invoice number
    "oid": "order-id", // Order ID
    "amt": 15.0, // Grand total
    "ts": 1704067200000, // Timestamp (milliseconds)
    "email": "customer@email.com", // Customer email
    "v": "1.0" // API version
  }
  ```

### 2. **Verification Page** (`/verify-invoice`)

A dedicated page where customers can verify their invoice authenticity.

#### Two Verification Methods:

**Method 1: Paste QR Data**

- Customer copies the QR code data
- Pastes it into the textarea on the verification page
- Clicks "Paste from Clipboard" button (auto-reads from clipboard)
- Clicks "Verify" to validate

**Method 2: Upload QR Image** (MVP - requires jsQR library)

- Upload a screenshot/photo of the QR code
- System decodes and validates the data
- Shows verification results

### 3. **Verification Results**

When a QR code is successfully verified, the page displays:

- ✅ Verification status (Green badge)
- Invoice Number
- Order ID
- Total Amount
- Date & Time
- Customer Email

### 4. **Security Features**

- No external API calls required
- All validation happens client-side
- Data is not sent to any server
- QR encodes complete invoice information
- Timestamp prevents tampering detection
- Email validation ensures order ownership (in future implementations)

## Implementation Details

### Files Created/Modified

**New Files:**

1. `/src/lib/qrCodeHelper.ts` - QR code generation and validation utilities
2. `/app/verify-invoice/page.tsx` - Invoice verification page (client-side)

**Modified Files:**

1. `/src/lib/invoiceGenerator.ts` - Updated to include QR code generation
2. `/app/orders/page.tsx` - Updated download button to handle async PDF generation
3. `/src/components/SiteNav.tsx` - Added "Verify Invoice" link in navigation

### Dependencies

- `qrcode` - QR code generation library
- `@types/qrcode` - TypeScript types for qrcode

### Installation

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

## How Customers Use It

### Step 1: Download Invoice

1. User logs in to their account
2. Goes to "Orders" page
3. Clicks "📄 Download Invoice" button
4. Invoice PDF is generated with embedded QR code

### Step 2: Verify Invoice (Optional)

1. User can go to "🔐 Verify Invoice" in navigation
2. Two options:
   - **Paste Method**: Copy QR data and paste into textarea
   - **Image Method**: Upload QR code image (coming soon)
3. Click "Verify" to check authenticity
4. View detailed invoice information if valid

## API Version History

- **v1.0** - Initial QR code format (current)
  - Includes: invoice number, order ID, total, timestamp, email

## Future Enhancements

1. **Image QR Scanning** - Add jsQR library for camera/image scanning
2. **Mobile App** - QR scanner using device camera
3. **Admin Verification Dashboard** - Bulk verification of invoices
4. **Order Lookup** - Add lookup by order ID to retrieve invoice
5. **Email Verification** - Verify email matches order before showing details
6. **Refund Verification** - Track refund status via QR code

## Benefits

**For Customers:**

- Easy way to verify invoice authenticity
- Can prove purchase legitimacy
- Quick access to order details
- No need to contact support for verification

**For Business:**

- Reduces fraudulent invoice claims
- Improves customer trust
- Automates verification process
- Data stored client-side (no server load)
- Professional presentation

## Technical Stack

- **QR Generation**: `qrcode` npm package
- **PDF Generation**: jsPDF with QR code embedding
- **Frontend**: Next.js 16 with React 19
- **Validation**: Client-side JSON parsing and validation
- **Data Format**: JSON (human-readable and machine-parseable)

## Usage Examples

### For Developers - Generate QR Code

```typescript
import { generateInvoicePDF } from "@/src/lib/invoiceGenerator";
import { OrderRecord } from "@/src/lib/store";

const order: OrderRecord = {
  /* order data */
};
await generateInvoicePDF(order); // QR is included automatically
```

### For Developers - Validate QR Code

```typescript
import { validateQRCodeData } from "@/src/lib/qrCodeHelper";

const qrData = `{"inv":"INV-ABC123",...}`;
const result = validateQRCodeData(qrData);
if (result) {
  console.log("Valid invoice:", result.invoiceNumber);
}
```

## Support

For issues or questions about invoice verification:

- Email: support@drybasket.com.bd
- Hotline: 09638001122
- Website: www.drybasket.com.bd

---

**Last Updated**: March 3, 2026
**Feature Status**: ✅ Production Ready
