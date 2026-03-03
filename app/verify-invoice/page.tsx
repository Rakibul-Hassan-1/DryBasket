"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { getOrdersForVerification } from "../../src/lib/store";

interface QRValidationResult {
  invoiceNumber: string;
  orderId: string;
  total: number;
  date: string;
  email: string;
  valid: boolean;
}

export default function VerifyInvoicePage() {
  const [qrText, setQrText] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [validationResult, setValidationResult] =
    useState<QRValidationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateQRCode = (qrData: string) => {
    try {
      const parsed = JSON.parse(qrData);

      // Validate all required fields exist
      if (
        !parsed.inv ||
        !parsed.oid ||
        parsed.amt === undefined ||
        !parsed.ts ||
        !parsed.email
      ) {
        setError("Invalid QR code data. Please try again.");
        return null;
      }

      const result: QRValidationResult = {
        invoiceNumber: parsed.inv,
        orderId: parsed.oid,
        total: parsed.amt,
        date: new Date(parsed.ts).toLocaleString("en-BD"),
        email: parsed.email,
        valid: true,
      };

      setValidationResult(result);
      setError("");
      return result;
    } catch (err) {
      setError(
        "Failed to validate QR code. Please ensure you scanned a valid DRY BASKET invoice QR code.",
      );
      console.error("Validation error:", err);
      return null;
    }
  };

  const handlePasteQR = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrText(text);
      validateQRCode(text);
    } catch {
      setError(
        "Unable to read clipboard. Please ensure you have permission to access clipboard.",
      );
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");

    try {
      // Use a QR code scanner library (jsQR or similar)
      // For now, we'll use HTML5 Canvas API with jsQR
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.onload = async () => {
            // We would need jsQR library to scan from image
            // For MVP, we'll show a message
            setError(
              "Image QR scanning requires additional setup. Please copy the QR text manually or scan with device camera.",
            );
            setIsLoading(false);
          };
          img.src = e.target?.result as string;
        } catch {
          setError("Failed to process image. Please try again.");
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to upload file. Please try again.");
      setIsLoading(false);
    }
  };

  const handleManualValidate = () => {
    if (!qrText.trim()) {
      setError("Please enter or paste QR code data.");
      return;
    }
    validateQRCode(qrText);
  };

  const handleInvoiceNumberSearch = async () => {
    if (!invoiceNumber.trim()) {
      setError("Please enter an invoice number (e.g., INV-D7GGTDMIZRK1)");
      return;
    }

    // Format invoice number for display
    const formattedInvoice = invoiceNumber.toUpperCase().startsWith("INV-")
      ? invoiceNumber.toUpperCase()
      : `INV-${invoiceNumber.toUpperCase()}`;

    // Validate format
    if (!/^INV-[A-Z0-9]{12}$/.test(formattedInvoice)) {
      setError(
        "Invalid invoice number format. Format should be: INV-XXXXXXXXXXXXXX",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("🔍 Searching for invoice:", formattedInvoice);

      // Fetch all orders from Firestore
      const allOrders = await getOrdersForVerification();
      console.log("📦 Fetched orders count:", allOrders.length);
      console.log(
        "📋 All orders:",
        allOrders.map((o) => ({
          id: o.id,
          invoiceNum: `INV-${o.id.substring(0, 12).toUpperCase()}`,
        })),
      );

      // Extract order ID from invoice number (INV-XXXXX... where X are the first 12 chars of order ID)
      const invoiceOrderId = formattedInvoice.substring(4); // Remove "INV-" prefix
      console.log("🔎 Looking for order ID starting with:", invoiceOrderId);

      // Find matching order
      const matchingOrder = allOrders.find((order) => {
        const orderInvoiceNumber = `INV-${order.id.substring(0, 12).toUpperCase()}`;
        console.log(
          `Comparing: ${orderInvoiceNumber} === ${formattedInvoice} ? ${orderInvoiceNumber === formattedInvoice}`,
        );
        return orderInvoiceNumber === formattedInvoice;
      });

      if (!matchingOrder) {
        console.error("❌ No matching order found");
        setError(
          "Invoice not found. Please check the invoice number and try again.",
        );
        setIsLoading(false);
        return;
      }

      console.log("✅ Found matching order:", matchingOrder);

      // Format the date
      const invoiceDate = matchingOrder.createdAt
        ? new Date(
            matchingOrder.createdAt as unknown as string | number | Date,
          ).toLocaleString("en-BD")
        : new Date().toLocaleString("en-BD");

      const result: QRValidationResult = {
        invoiceNumber: formattedInvoice,
        orderId: matchingOrder.id,
        total: matchingOrder.grandTotal,
        date: invoiceDate,
        email: matchingOrder.userEmail,
        valid: true,
      };

      setValidationResult(result);
      setIsLoading(false);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search invoice. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Invoice Verification
          </h1>
          <p className="text-gray-600">
            Verify your DRY BASKET invoice authenticity
          </p>
        </div>

        {/* Navigation */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Shop
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Input Methods */}
          <div className="space-y-6 mb-8">
            {/* Method 1: Invoice Number */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Option 1: Enter Invoice Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g., INV-D7GGTDMIZRK1 or D7GGTDMIZRK1"
                  className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-indigo-600 focus:outline-none text-sm font-mono text-gray-900 placeholder:text-gray-500 bg-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleInvoiceNumberSearch();
                    }
                  }}
                />
                <button
                  onClick={handleInvoiceNumberSearch}
                  disabled={isLoading}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  🔍 Search
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Format: INV-XXXXXXXXXXXXXX (12 alphanumeric characters)
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Method 2: Paste QR Data */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Option 2: Paste QR Code Data
              </label>
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Paste the QR code data here..."
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-indigo-600 focus:outline-none text-sm font-mono bg-white text-gray-900 placeholder:text-gray-500"
                rows={4}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handlePasteQR}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                >
                  📋 Paste from Clipboard
                </button>
                <button
                  onClick={handleManualValidate}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
                >
                  ✓ Verify
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Method 3: Upload Image */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Option 3: Upload QR Code Image
              </label>
              <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-600 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full text-indigo-600 hover:text-indigo-700 font-bold disabled:opacity-50"
                >
                  📸{" "}
                  {isLoading
                    ? "Processing..."
                    : "Click to upload image or drag & drop"}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">❌ {error}</p>
            </div>
          )}

          {/* Validation Result */}
          {validationResult && validationResult.valid && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-lg font-bold text-green-900">
                    Invoice Verified
                  </h3>
                  <p className="text-green-700 text-sm">
                    This is a legitimate DRY BASKET invoice
                  </p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="bg-white rounded-lg p-4 space-y-3 border border-green-200">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">
                    Invoice Number:
                  </span>
                  <span className="text-gray-900 font-bold">
                    {validationResult.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">Order ID:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {validationResult.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">
                    Total Amount:
                  </span>
                  <span className="text-green-700 font-bold text-lg">
                    TK {validationResult.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">
                    Date & Time:
                  </span>
                  <span className="text-gray-900">{validationResult.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">
                    Customer Email:
                  </span>
                  <span className="text-gray-900">
                    {validationResult.email}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setQrText("");
                    setValidationResult(null);
                    setError("");
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Verify Another
                </button>
                <Link
                  href="/"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition text-center"
                >
                  Return to Shop
                </Link>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Each DRY BASKET invoice contains a unique QR code</li>
              <li>✓ The QR code encodes your invoice details securely</li>
              <li>✓ Scan or paste the QR data to verify authenticity</li>
              <li>✓ No invoice data is sent to external servers</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Need help? Contact us at support@drybasket.com.bd</p>
        </div>
      </div>
    </div>
  );
}
