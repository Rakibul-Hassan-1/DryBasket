import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    if (data.type === "email" && data.html) {
      await transporter.sendMail({
        from: `"DryBasket" <${process.env.SMTP_USER}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      console.log("✅ Email sent successfully to:", data.to);
    }

    // Send SMS (if implemented)
    if (data.type === "sms" && data.phone) {
      console.log("📱 SMS would be sent to:", data.phone);
      // Add your SMS gateway integration here
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Notification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send",
      },
      { status: 500 },
    );
  }
}
