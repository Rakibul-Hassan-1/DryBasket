// SMS notification service for Bangladesh
// Popular BD SMS Gateways: SSL Wireless, Grameenphone, Robi, BulkSMSBD

export interface SMSData {
  phone: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: "confirmed" | "processing" | "shipped" | "delivered";
}

// SMS Gateway configuration (for future use in production)
// const SMS_CONFIG = {
//   apiUrl: process.env.NEXT_PUBLIC_SMS_API_URL || "",
//   apiKey: process.env.NEXT_PUBLIC_SMS_API_KEY || "",
//   senderId: process.env.NEXT_PUBLIC_SMS_SENDER_ID || "DryBasket",
// };

// Format phone number for Bangladesh
export const formatBDPhone = (phone: string): string => {
  // Remove spaces, dashes, and non-digits
  let cleaned = phone.replace(/\D/g, "");

  // Add country code if missing
  if (cleaned.startsWith("0")) {
    cleaned = "88" + cleaned;
  } else if (!cleaned.startsWith("88")) {
    cleaned = "88" + cleaned;
  }

  return cleaned;
};

// Generate SMS message based on order status
export const generateSMSMessage = (data: SMSData): string => {
  const messages = {
    confirmed: `Dear ${data.customerName}, Your order ${data.orderNumber} has been confirmed! Total: TK ${data.total}. We will deliver soon. Track: drybasket.com.bd/orders - DryBasket`,
    processing: `Dear ${data.customerName}, Your order ${data.orderNumber} is being processed. You will receive it soon. - DryBasket`,
    shipped: `Dear ${data.customerName}, Great news! Your order ${data.orderNumber} has been shipped and is on its way. Track: drybasket.com.bd/orders - DryBasket`,
    delivered: `Dear ${data.customerName}, Your order ${data.orderNumber} has been delivered! Thank you for shopping with DryBasket. Rate us: drybasket.com.bd/rate`,
  };

  return messages[data.status];
};

// Send SMS notification
export const sendOrderSMS = async (data: SMSData): Promise<boolean> => {
  try {
    const formattedPhone = formatBDPhone(data.phone);
    const message = generateSMSMessage(data);

    console.log("📱 Sending SMS...");
    console.log("To:", formattedPhone);
    console.log("Status:", data.status);
    console.log("Message:", message);

    // In production, call your SMS gateway API
    // Example for SSL Wireless:
    // const response = await fetch(SMS_CONFIG.apiUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     api_token: SMS_CONFIG.apiKey,
    //     sid: SMS_CONFIG.senderId,
    //     msisdn: formattedPhone,
    //     sms: message,
    //   }),
    // });

    // Example for BulkSMSBD:
    // const url = `${SMS_CONFIG.apiUrl}?api_key=${SMS_CONFIG.apiKey}&type=text&number=${formattedPhone}&senderid=${SMS_CONFIG.senderId}&message=${encodeURIComponent(message)}`;
    // const response = await fetch(url);

    console.log("✅ SMS would be sent successfully");
    return true;
  } catch (error) {
    console.error("❌ SMS send error:", error);
    return false;
  }
};

// Send multiple SMS (batch)
export const sendBulkSMS = async (dataArray: SMSData[]): Promise<number> => {
  console.log(`📱 Sending ${dataArray.length} SMS messages...`);

  let successCount = 0;

  for (const data of dataArray) {
    const success = await sendOrderSMS(data);
    if (success) successCount++;

    // Add delay between SMS to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`✅ Sent ${successCount}/${dataArray.length} SMS successfully`);
  return successCount;
};

// Send OTP SMS for verification
export const sendOTPSMS = async (
  phone: string,
  otp: string,
): Promise<boolean> => {
  try {
    const formattedPhone = formatBDPhone(phone);
    // const message = `Your DryBasket verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone. - DryBasket`;

    console.log("📱 Sending OTP SMS to:", formattedPhone);
    console.log("OTP:", otp);

    // Call SMS API here in production

    console.log("✅ OTP SMS sent");
    return true;
  } catch (error) {
    console.error("❌ OTP SMS error:", error);
    return false;
  }
};
