// Email notification service using browser-compatible approach
// For production, use a backend service like Resend, SendGrid, or Firebase Functions

export interface EmailData {
  to: string;
  subject: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  shippingAddress: string;
  shippingPhone: string;
}

// Send order confirmation email
export const sendOrderConfirmationEmail = async (
  data: EmailData,
): Promise<boolean> => {
  try {
    console.log("📧 Sending order confirmation email...");
    console.log("To:", data.to);
    console.log("Order:", data.orderNumber);

    // Generate email HTML
    const emailHtml = generateOrderEmailHTML(data);

    // Call backend API endpoint
    const response = await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email",
        to: data.to,
        subject: data.subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Email API error:", error);
      return false;
    }

    console.log("✅ Email sent successfully!");
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error);
    return false;
  }
};

// Generate email HTML template
export const generateOrderEmailHTML = (data: EmailData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; color: #667eea; margin-top: 15px; padding-top: 15px; border-top: 2px solid #667eea; }
    .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Order Confirmed!</h1>
      <p>Thank you for your order, ${data.customerName}!</p>
    </div>
    
    <div class="content">
      <h2>Order Details</h2>
      <div class="order-details">
        <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-BD")}</p>
        
        <h3 style="margin-top: 20px;">Items:</h3>
        ${data.items
          .map(
            (item) => `
          <div class="item">
            <span>${item.name} × ${item.quantity}</span>
            <span>TK ${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `,
          )
          .join("")}
        
        <div class="item">
          <span>Subtotal</span>
          <span>TK ${data.subtotal.toFixed(2)}</span>
        </div>
        <div class="item">
          <span>Delivery Charge</span>
          <span>TK ${data.deliveryCharge.toFixed(2)}</span>
        </div>
        <div class="total">
          <span>Total</span>
          <span>TK ${data.total.toFixed(2)}</span>
        </div>
      </div>
      
      <h3>Shipping Address:</h3>
      <p>${data.shippingAddress}</p>
      <p>Phone: ${data.shippingPhone}</p>
      
      <div style="text-align: center;">
        <a href="https://drybasket.com/orders" class="button">View Order Details</a>
      </div>
      
      <div class="footer">
        <p>Questions? Contact us at support@drybasket.com.bd or call 0xxxxxxxxxx</p>
        <p>&copy; 2026 DryBasket. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Send invoice email with PDF attachment
export const sendInvoiceEmail = async (
  email: string,
  orderNumber: string,
  _pdfBlob: Blob,
): Promise<boolean> => {
  try {
    console.log("📧 Sending invoice email...");
    console.log("To:", email);
    console.log("Invoice:", orderNumber);

    // In production, upload PDF to storage and send link via email API
    console.log("✅ Invoice email would be sent with PDF attachment");

    return true;
  } catch (error) {
    console.error("❌ Invoice email error:", error);
    return false;
  }
};
