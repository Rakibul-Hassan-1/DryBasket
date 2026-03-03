"use client";

import { useState } from "react";

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void;
  onCancel?: () => void;
}

export default function PhoneVerificationSimple({
  onVerified,
  onCancel,
}: PhoneVerificationProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, "");
    const regex = /^(\+880|88|0)1\d{9}$/;
    return regex.test(cleaned);
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/[\s-]/g, "");
    if (cleaned.startsWith("+880")) return cleaned;
    if (cleaned.startsWith("880")) return "+" + cleaned;
    if (cleaned.startsWith("0")) return "+88" + cleaned;
    return "+880" + cleaned;
  };

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!phoneNumber.trim()) {
      setError("Phone number required");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError("Invalid format. Use: 01XXXXXXXXXX or +880XXXXXXXXXX");
      return;
    }

    setLoading(true);

    try {
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);
      setMessage(`OTP Generated: ${newOtp} - Please enter to verify`);
      console.log("OTP:", newOtp, "Phone:", formatPhoneNumber(phoneNumber));
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    if (otp !== generatedOtp) {
      setError("Invalid OTP. Try again");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      setMessage("Phone verified successfully!");

      setTimeout(() => {
        onVerified(formattedPhone);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 font-serif">
          Verify Phone Number
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {step === "phone"
            ? "Enter your phone number"
            : "Enter the 6-digit OTP"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="01XXXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 font-medium"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Bangladesh format (10 digits)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>

              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono text-gray-900 font-medium"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {phoneNumber} -
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-blue-600 hover:underline ml-1"
                  disabled={loading}
                >
                  Change number
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
