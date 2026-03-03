import jsPDF from "jspdf";
import QRCode from "qrcode";
import { OrderRecord } from "./store";

// Currency formatting helper
const formatBDT = (amount: number): string => {
  return `TK ${amount.toFixed(2)}`;
};

export const generateInvoicePDF = async (order: OrderRecord) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const brownColor = [139, 97, 60]; // Brown color for headers
  let yPosition = 12;

  // ========== TOP HEADER - STORE NAME & INFO ==========
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("DRY BASKET", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 7;

  // Store location info (right side)
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  const invoiceNumber = `INV-${order.id.substring(0, 12).toUpperCase()}`;
  const storeInfo = [
    "Hafsa Building, 4th Floor",
    "Cement Crossing Kaca Bazar",
    "EPZ, Chattogram",
  ];

  storeInfo.forEach((line, idx) => {
    doc.text(line, pageWidth - 15, yPosition + idx * 4, { align: "right" });
  });

  // Bill number and date (right side)
  yPosition += 15;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");

  const invoiceDate = order.createdAt
    ? new Date(
        order.createdAt as unknown as string | number | Date,
      ).toLocaleDateString("en-BD", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : new Date().toLocaleDateString("en-BD", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

  doc.text(`BIN NO: 003313071-0505`, pageWidth - 15, yPosition, {
    align: "right",
  });
  doc.text(`Sales Date: ${invoiceDate}`, pageWidth - 15, yPosition + 4, {
    align: "right",
  });
  doc.text(
    `Sales Total: ${formatBDT(order.grandTotal)}`,
    pageWidth - 15,
    yPosition + 8,
    {
      align: "right",
    },
  );
  doc.text(`Paid Status: Paid`, pageWidth - 15, yPosition + 12, {
    align: "right",
  });

  // Customer Details (left side)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  const customerInfoLines = [
    `Name: ${order.shippingName}`,
    `Phone: ${order.shippingPhone}`,
    `Email: ${order.userEmail}`,
    `Address: ${order.shippingAddress}`,
  ];

  customerInfoLines.forEach((line, idx) => {
    doc.text(line, 12, yPosition + idx * 4);
  });

  yPosition += 25;

  // ========== INVOICE NUMBER AND BARCODE AREA ==========
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice No: ${invoiceNumber}`, 12, yPosition);

  yPosition += 8;

  // ========== ITEMS TABLE WITH BROWN HEADER ==========
  // Table header with brown background
  doc.setFillColor(brownColor[0], brownColor[1], brownColor[2]);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.rect(12, yPosition - 3, pageWidth - 24, 6, "F");

  doc.text("ITEM DESCRIPTION", 14, yPosition + 1);
  doc.text("PRICE", 95, yPosition + 1);
  doc.text("QTY", 125, yPosition + 1);
  doc.text("TOTAL", 155, yPosition + 1);

  yPosition += 8;

  // ========== ITEMS ROWS ==========
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  order.items.forEach((item, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(245, 243, 240);
      doc.rect(12, yPosition - 3, pageWidth - 24, 12, "F");
    }

    // Item name and description
    doc.setFont("helvetica", "bold");
    const itemNameWithWeight = item.weight
      ? `${item.name} (${item.weight})`
      : item.name;
    doc.text(itemNameWithWeight, 14, yPosition);

    // Price and quantity
    doc.setFont("helvetica", "normal");
    doc.text(formatBDT(item.unitPrice), 95, yPosition);
    doc.text(item.quantity.toString(), 126, yPosition);
    doc.text(formatBDT(item.lineTotal), 160, yPosition);

    yPosition += 8;
  });

  // Items count
  yPosition += 2;
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `No of items  ${order.items.length}.00 items / ${order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    )}.00 units`,
    14,
    yPosition,
  );

  yPosition += 8;

  // ========== TRANSACTION DETAILS SECTION ==========
  doc.setFillColor(brownColor[0], brownColor[1], brownColor[2]);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.rect(12, yPosition - 3, pageWidth - 24, 5, "F");
  doc.text("TRANSACTION DETAILS", 14, yPosition + 1);

  yPosition += 7;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(`1  ${order.paymentMethod} (TXID )`, 14, yPosition);
  doc.text(`Amt. ${formatBDT(order.grandTotal)}`, 14, yPosition + 4);
  doc.text(formatBDT(order.grandTotal), 160, yPosition + 4);

  yPosition += 12;

  // ========== MRP SUMMARY ==========
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  const summaryStartX = 95;
  const valueStartX = 160;

  doc.text("MRP Total", summaryStartX, yPosition);
  doc.text(formatBDT(order.subtotal), valueStartX, yPosition);

  yPosition += 5;

  const summaryLines = [
    ["(+) VAT/Tax", "-"],
    [
      "(+) Delivery Charges",
      order.deliveryCharge > 0 ? formatBDT(order.deliveryCharge) : "-",
    ],
    ["(-) Exchange", "-"],
    ["(-) Rebate", "-"],
    ["(-) Privilege Discount", "-"],
    ["(-) Redeem Point", "-"],
    ["(-) Gift Card", "-"],
    ["(=) Subtotal", formatBDT(order.subtotal)],
  ];

  summaryLines.forEach((line) => {
    doc.text(line[0], summaryStartX, yPosition);
    doc.text(line[1], valueStartX, yPosition);
    yPosition += 4;
  });

  yPosition += 2;

  // Grand total section
  doc.setFont("helvetica", "bold");
  doc.text("(+/) Round", summaryStartX, yPosition);
  doc.text("0.00", valueStartX, yPosition);

  yPosition += 5;

  doc.setFillColor(200, 200, 200);
  doc.rect(
    summaryStartX - 5,
    yPosition - 3.5,
    pageWidth - summaryStartX - 10,
    5.5,
    "F",
  );

  doc.setTextColor(0, 0, 0);
  doc.text("Grand Total", summaryStartX, yPosition + 0.5);
  doc.text(formatBDT(order.grandTotal), valueStartX, yPosition + 0.5);

  yPosition += 7;

  doc.setFont("helvetica", "normal");
  doc.text("Paid Total", summaryStartX, yPosition);
  doc.text(formatBDT(order.grandTotal), valueStartX, yPosition);

  yPosition += 4;

  doc.text("Balance", summaryStartX, yPosition);
  doc.text("-", valueStartX, yPosition);

  yPosition += 4;

  doc.text("Earning Points", summaryStartX, yPosition);
  doc.text("-", valueStartX, yPosition);

  yPosition += 12;

  // ========== QR CODE SECTION ==========
  // Generate QR code data (validation info)
  const qrData = JSON.stringify({
    inv: invoiceNumber,
    oid: order.id,
    amt: order.grandTotal,
    ts: new Date(
      order.createdAt as unknown as string | number | Date,
    ).getTime(),
    email: order.userEmail,
    v: "1.0",
  });

  const qrCodeDataUrl: string = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: "H",
    type: "image/png",
    margin: 1,
    width: 150,
  });

  // Add horizontal divider before QR
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);

  yPosition += 6;

  // Add QR code to center
  doc.addImage(
    qrCodeDataUrl as string,
    "PNG",
    pageWidth / 2 - 17,
    yPosition,
    34,
    34,
  );

  yPosition += 36;

  // Add validation text
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text("Scan QR to verify invoice authenticity", pageWidth / 2, yPosition, {
    align: "center",
  });
  doc.text("https://drybasket.com.bd/verify", pageWidth / 2, yPosition + 4, {
    align: "center",
  });

  // ========== FOOTER SECTION ==========
  yPosition = pageHeight - 28;

  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  doc.text(
    "This is our system generated invoice & doesn't need any signature",
    pageWidth / 2,
    yPosition,
    { align: "center" },
  );
  doc.text(
    "For verification scan the QR code above or visit: https://drybasket.com.bd/verify",
    pageWidth / 2,
    yPosition + 3,
    { align: "center" },
  );

  // ========== BOTTOM FOOTER INFO ==========
  yPosition = pageHeight - 12;

  doc.setFillColor(brownColor[0], brownColor[1], brownColor[2]);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  doc.rect(0, yPosition, pageWidth, 12, "F");

  doc.text("Hotline: 0xxxxxxxxxx", 10, yPosition + 4);
  doc.text("www.drybasket.com.bd", pageWidth / 2, yPosition + 4, {
    align: "center",
  });
  doc.text("E-Mail: admin@drybasket.com.bd", pageWidth - 10, yPosition + 4, {
    align: "right",
  });

  doc.setFontSize(6);
  doc.text(
    "Date Time: 2026-03-03 | Page 1 of 1",
    pageWidth / 2,
    yPosition + 8,
    {
      align: "center",
    },
  );

  // ========== SAVE PDF ==========
  const fileName = `DryBasket_Receipt_${invoiceNumber.replace(/-/g, "")}.pdf`;
  doc.save(fileName);
};
