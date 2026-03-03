"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { generateInvoicePDF } from "../../src/lib/invoiceGenerator";
import { getOrdersByUser, OrderRecord } from "../../src/lib/store";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!user) {
        setFetching(false);
        return;
      }

      try {
        const data = await getOrdersByUser(user.uid);
        setOrders(data);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setFetching(false);
      }
    };

    if (!loading) {
      run();
    }
  }, [loading, user]);

  const handleDownloadInvoice = async (order: OrderRecord) => {
    try {
      await generateInvoicePDF(order);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  if (loading || fetching) {
    return (
      <div className="p-10 text-center text-gray-600">Loading orders...</div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-700">Please login to view your orders.</p>
          <Link
            href="/login"
            className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">My Orders</h1>

      {error && (
        <p className="mb-4 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {!orders.length ? (
        <div className="bg-white border border-gray-300 rounded-xl p-6 text-gray-700 font-semibold">
          You have no orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white border-2 border-gray-300 rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center gap-4 mb-4 flex-wrap">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">
                    Order #{order.id.slice(0, 8)}
                  </h2>
                  <p className="text-sm font-semibold text-gray-700">
                    Status:{" "}
                    <span className="text-indigo-700">{order.status}</span>
                  </p>
                </div>
                <p className="text-2xl font-bold text-indigo-700">
                  TK {order.grandTotal.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.productId}`}
                    className="flex justify-between text-sm font-semibold text-gray-900"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-indigo-700">
                      TK {item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleDownloadInvoice(order)}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                📄 Download Invoice
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
