"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { useCart } from "../../src/contexts/CartContext";
import { logBeginCheckout, logPurchase } from "../../src/lib/analytics";
import { sendOrderConfirmationEmail } from "../../src/lib/emailService";
import { sendOrderSMS } from "../../src/lib/smsService";
import { placeOrder } from "../../src/lib/store";

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const deliveryCharge = useMemo(() => 120, []);
  const grandTotal = subtotal + deliveryCharge;

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">Loading cart...</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">
            Please login to manage cart and place order.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!items.length) {
      setMessage("Your cart is empty.");
      return;
    }

    if (
      shippingName.trim().length < 2 ||
      shippingPhone.trim().length < 7 ||
      shippingAddress.trim().length < 6
    ) {
      setMessage("Please provide complete shipping details.");
      return;
    }

    const hasInvalidQuantity = items.some((item) => item.quantity > item.stock);
    if (hasInvalidQuantity) {
      setMessage("Some item quantities exceed available stock.");
      return;
    }

    // Log checkout begin
    logBeginCheckout(grandTotal, items);

    setSubmitting(true);

    try {
      const orderId = await placeOrder(user.uid, user.email ?? "", {
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        items,
      });

      // Log successful purchase
      logPurchase(
        orderId,
        grandTotal,
        items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      );

      // Send email notification
      await sendOrderConfirmationEmail({
        to: user.email ?? "",
        subject: "Order Confirmation - DryBasket",
        orderNumber: `INV-${orderId.substring(0, 12).toUpperCase()}`,
        customerName: shippingName,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        total: grandTotal,
        shippingAddress: shippingAddress,
        shippingPhone: shippingPhone,
      });

      // Send SMS notification
      await sendOrderSMS({
        phone: shippingPhone,
        orderNumber: `INV-${orderId.substring(0, 12).toUpperCase()}`,
        customerName: shippingName,
        total: grandTotal,
        status: "confirmed",
      });

      clearCart();
      router.push("/orders");
    } catch (error: unknown) {
      console.error("Order error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const errorCode = (error as any)?.code || "unknown";
      setMessage(
        `Failed to place order. Error: ${errorCode}. ${errorMsg}. Check browser console for details.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          Your Cart
        </h1>

        {!items.length ? (
          <p className="text-gray-600">No items in cart yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-white transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">
                      {item.name}
                    </h2>
                    <p className="text-sm font-semibold text-gray-800">
                      ${item.price} each
                    </p>
                    <p className="text-xs font-semibold text-gray-700 mt-1">
                      Available: {item.stock}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded border-2 border-gray-400 font-bold text-gray-900 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded border-2 border-gray-400 font-bold text-gray-900 hover:bg-gray-200"
                  >
                    +
                  </button>
                  <p className="ml-auto font-bold text-indigo-700 text-lg">
                    TK {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleCheckout}
        className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 h-fit sticky top-4"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Checkout
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Full Name
            </label>
            <input
              value={shippingName}
              onChange={(event) => setShippingName(event.target.value)}
              placeholder="Enter your full name"
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Phone
            </label>
            <input
              value={shippingPhone}
              onChange={(event) => setShippingPhone(event.target.value)}
              placeholder="Enter your phone number"
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Delivery Address
            </label>
            <textarea
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              placeholder="Enter your complete delivery address"
              rows={3}
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full border-2 border-gray-400 bg-white rounded-lg px-3 py-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option>Cash on Delivery</option>
              <option>Card</option>
              <option>Mobile Banking</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-900 space-y-2 font-semibold">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>TK {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>
              {deliveryCharge === 0
                ? "Free"
                : `TK ${deliveryCharge.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t-2 border-gray-300">
            <span>Total</span>
            <span>TK {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {message && (
          <p className="mt-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !items.length}
          className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold"
        >
          {submitting ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </section>
  );
}
