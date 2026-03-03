/**
 * QR Code Validation Helper
 * Validates QR code data from DRY BASKET invoices
 */

export interface QRCodeData {
  invoiceNumber: string;
  orderId: string;
  total: number;
  date: string;
  customerEmail: string;
}

/**
 * Decode and validate QR code data
 * QR codes from DRY BASKET invoices contain JSON with invoice details
 */
export const validateQRCodeData = (
  decodedString: string,
): QRCodeData | null => {
  try {
    const parsed = JSON.parse(decodedString);

    // Validate all required fields exist
    if (
      !parsed.inv ||
      !parsed.oid ||
      parsed.amt === undefined ||
      !parsed.ts ||
      !parsed.email
    ) {
      return null;
    }

    return {
      invoiceNumber: parsed.inv,
      orderId: parsed.oid,
      total: parsed.amt,
      date: new Date(parsed.ts).toLocaleString("en-BD"),
      customerEmail: parsed.email,
    };
  } catch (error) {
    console.error("QR Code validation failed:", error);
    return null;
  }
};
