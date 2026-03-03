"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { db } from "../../src/lib/firebase";
import { getProducts, OrderRecord, Product } from "../../src/lib/store";

type AdminTab = "overview" | "products" | "orders" | "users";

const isPermissionDeniedError = (error: unknown) => {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  return code.includes("permission-denied");
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [dashboardNotice, setDashboardNotice] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = Boolean(user?.email && user.email === adminEmail);

  useEffect(() => {
    const ensureCurrentUserProfile = async () => {
      if (!user?.uid) return;

      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            email: user.email || "",
            fullName: user.displayName || "N/A",
            phone: "",
            address: "",
            role:
              user.email && adminEmail && user.email === adminEmail
                ? "admin"
                : "customer",
            lastLoginAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        if (!isPermissionDeniedError(error)) {
          console.error("Failed to ensure user profile:", error);
        }
      }
    };

    ensureCurrentUserProfile();
  }, [user?.uid, user?.email, user?.displayName, adminEmail]);

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Load products
      const productsData = await getProducts();
      setProducts(productsData);

      // Load all orders
      let ordersData: OrderRecord[] = [];
      try {
        const ordersQuery = query(collection(db, "orders"));
        const ordersSnapshot = await getDocs(ordersQuery);
        ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as OrderRecord[];
      } catch (error) {
        if (!isPermissionDeniedError(error)) {
          console.error("Failed to load orders:", error);
        }

        setDashboardNotice(
          "Missing Firestore permission for orders/users. Please deploy admin rules.",
        );
      }

      const sortedOrdersData = [...ordersData].sort(
        (firstOrder, secondOrder) => {
          const firstTimestamp =
            (firstOrder.createdAt as { seconds?: number })?.seconds ?? 0;
          const secondTimestamp =
            (secondOrder.createdAt as { seconds?: number })?.seconds ?? 0;
          return secondTimestamp - firstTimestamp;
        },
      );

      setAllOrders(sortedOrdersData);

      // Load users count
      let usersCount = 0;
      try {
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        usersCount = usersSnapshot.size;
      } catch (error) {
        if (!isPermissionDeniedError(error)) {
          console.error("Failed to load users count from collection:", error);
        }

        setDashboardNotice(
          "Firestore rules are blocking full user read. Update rules for admin access.",
        );

        if (user?.uid) {
          const currentUserDoc = await getDoc(doc(db, "users", user.uid));
          usersCount = currentUserDoc.exists() ? 1 : 0;
        }
      }

      // Calculate stats
      const totalRevenue = ordersData.reduce(
        (sum, order) => sum + Number(order.grandTotal || 0),
        0,
      );

      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue,
        totalUsers: usersCount,
      });
    } catch (error) {
      if (!isPermissionDeniedError(error)) {
        console.error("Failed to load dashboard data:", error);
      }

      if (isPermissionDeniedError(error)) {
        setDashboardNotice(
          "Missing Firestore permission for orders/users. Please deploy admin rules.",
        );
      }
    } finally {
      setLoadingData(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!loading && isAdmin) {
      loadDashboardData();
    }
  }, [loading, isAdmin, loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 text-lg font-semibold">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto p-8 mt-10">
        <div className="bg-white border-2 border-red-300 rounded-xl p-6 text-center">
          <p className="text-gray-700 font-bold text-lg mb-4">
            🔒 Admin Access Only
          </p>
          <p className="text-gray-600 mb-6">
            You need admin credentials to access this dashboard.
          </p>
          <p className="text-sm text-gray-500">
            Set `NEXT_PUBLIC_ADMIN_EMAIL` in your environment and login with
            that email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 font-semibold">
                Welcome back, {user?.email}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Back to Shop
            </Link>
          </div>

          {dashboardNotice ? (
            <p className="mb-4 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 font-semibold text-sm">
              {dashboardNotice}
            </p>
          ) : null}

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b-2 border-gray-300 overflow-x-auto pb-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-bold whitespace-nowrap transition ${
                activeTab === "overview"
                  ? "border-b-4 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 font-bold whitespace-nowrap transition ${
                activeTab === "products"
                  ? "border-b-4 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📦 Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 font-bold whitespace-nowrap transition ${
                activeTab === "orders"
                  ? "border-b-4 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🛒 Orders
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 font-bold whitespace-nowrap transition ${
                activeTab === "users"
                  ? "border-b-4 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              👥 Users
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {loadingData ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-600 font-semibold">Loading data...</p>
          </div>
        ) : activeTab === "overview" ? (
          <OverviewTab stats={stats} />
        ) : activeTab === "products" ? (
          <ProductsTab products={products} />
        ) : activeTab === "orders" ? (
          <OrdersTab orders={allOrders} />
        ) : (
          <UsersTab />
        )}
      </div>
    </section>
  );
}

/* Overview Tab */
function OverviewTab({
  stats,
}: {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
  };
}) {
  const [editMode, setEditMode] = useState(false);
  const [editStats, setEditStats] = useState(stats);

  useEffect(() => {
    setEditStats(stats);
  }, [stats]);

  const handleSave = () => {
    // In a real app, save to database
    setEditMode(false);
    alert("Stats updated! (This would save to DB in production)");
  };

  const handleReset = () => {
    setEditStats(stats);
    setEditMode(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                ✓ Save
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
              >
                ✕ Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              ✎ Edit Stats
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Products Card */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <p className="text-gray-600 font-semibold text-sm">
                Total Products
              </p>
              {editMode ? (
                <input
                  type="number"
                  value={editStats.totalProducts}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      totalProducts: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-4xl font-bold text-indigo-700 mt-2 border border-indigo-300 px-2 py-1 rounded"
                />
              ) : (
                <p className="text-4xl font-bold text-indigo-700 mt-2">
                  {editStats.totalProducts}
                </p>
              )}
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <p className="text-gray-600 font-semibold text-sm">
                Total Orders
              </p>
              {editMode ? (
                <input
                  type="number"
                  value={editStats.totalOrders}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      totalOrders: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-4xl font-bold text-green-700 mt-2 border border-green-300 px-2 py-1 rounded"
                />
              ) : (
                <p className="text-4xl font-bold text-green-700 mt-2">
                  {editStats.totalOrders}
                </p>
              )}
            </div>
            <span className="text-3xl">🛒</span>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <p className="text-gray-600 font-semibold text-sm">
                Total Revenue
              </p>
              {editMode ? (
                <input
                  type="number"
                  step="0.01"
                  value={editStats.totalRevenue}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      totalRevenue: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full text-4xl font-bold text-blue-700 mt-2 border border-blue-300 px-2 py-1 rounded"
                />
              ) : (
                <p className="text-4xl font-bold text-blue-700 mt-2">
                  TK {editStats.totalRevenue.toFixed(2)}
                </p>
              )}
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div className="w-full">
              <p className="text-gray-600 font-semibold text-sm">Total Users</p>
              {editMode ? (
                <input
                  type="number"
                  value={editStats.totalUsers}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      totalUsers: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-4xl font-bold text-purple-700 mt-2 border border-purple-300 px-2 py-1 rounded"
                />
              ) : (
                <p className="text-4xl font-bold text-purple-700 mt-2">
                  {editStats.totalUsers}
                </p>
              )}
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Products Tab */
function ProductsTab({ products }: { products: Product[] }) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products Inventory</h2>
        <Link
          href="/admin"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-600 font-semibold">No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="px-4 py-3 font-bold text-gray-900">Name</th>
                <th className="px-4 py-3 font-bold text-gray-900">Category</th>
                <th className="px-4 py-3 font-bold text-gray-900">Price</th>
                <th className="px-4 py-3 font-bold text-gray-900">Stock</th>
                <th className="px-4 py-3 font-bold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 font-bold text-indigo-700">
                    ${product.price}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {product.stock} units
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-sm ${
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock > 10
                        ? "In Stock"
                        : product.stock > 0
                          ? "Low Stock"
                          : "Out"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* Orders Tab */
function OrdersTab({ orders }: { orders: OrderRecord[] }) {
  const [displayOrders, setDisplayOrders] = useState<OrderRecord[]>(orders);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    setDisplayOrders(orders);
  }, [orders]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus:
      | "Pending"
      | "Accepted"
      | "Processing"
      | "Shipped"
      | "Delivered"
      | "Cancelled",
  ) => {
    setUpdatingOrder(orderId);
    setUpdateMessage("");

    try {
      // Find the order to get customer email
      const order = displayOrders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Update Firestore
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Update local state immediately without full page reload
      setDisplayOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o,
        ),
      );

      // Send email notification to customer
      try {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "email",
            to: order.userEmail,
            subject: `Order #${order.id.slice(0, 8)} Status Updated - DryBasket`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0;">DryBasket</h1>
                  <p style="margin: 10px 0 0 0;">Order Status Update</p>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; color: #333; margin-top: 0;">Dear ${order.shippingName},</p>
                  <p style="font-size: 14px; color: #666; line-height: 1.6;">
                    Your order status has been updated:
                  </p>
                  <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 12px; color: #999;">Order ID</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #333;">#${order.id.slice(0, 8)}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p style="margin: 0; font-size: 12px; color: #999;">New Status</p>
                    <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #667eea;">${newStatus}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p style="margin: 0; font-size: 12px; color: #999;">Total Amount</p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #333;">TK ${order.grandTotal.toFixed(2)}</p>
                  </div>
                  <div style="background: #f0f4ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 13px; color: #667eea;"><strong>Order Details:</strong></p>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">Shipping To: ${order.shippingAddress}</p>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">Phone: ${order.shippingPhone}</p>
                  </div>
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #999; margin: 0;">
                      Thank you for shopping with DryBasket!<br>
                      <strong>Track your order and manage preferences in your account.</strong>
                    </p>
                  </div>
                </div>
                <div style="background: #f0f4ff; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="margin: 0; font-size: 11px; color: #999;">
                    © 2026 DryBasket. All rights reserved.<br>
                    This is an automated message, please do not reply.
                  </p>
                </div>
              </div>
            `,
          }),
        });
        console.log("✅ Email notification sent to:", order.userEmail);
      } catch (emailError) {
        console.error("⚠️ Failed to send email notification:", emailError);
        // Don't fail the order update if email fails
      }

      setUpdateMessage(`✓ Order status updated to ${newStatus}`);
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (error) {
      console.error("Error updating order:", error);
      setUpdateMessage("✗ Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const statusOptions: Array<
    | "Pending"
    | "Accepted"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
  > = [
    "Pending",
    "Accepted",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-purple-100 text-purple-800";
      case "Shipped":
        return "bg-indigo-100 text-indigo-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>

      {updateMessage && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
            updateMessage.includes("✓")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {updateMessage}
        </div>
      )}

      {displayOrders.length === 0 ? (
        <p className="text-gray-600 font-semibold">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="border-2 border-gray-300 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {order.userEmail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-700">
                    TK {order.grandTotal.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full font-bold text-sm mt-1 ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm font-semibold text-gray-700">
                <div>
                  <p className="text-gray-600">Shipping Name</p>
                  <p className="text-gray-900">{order.shippingName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="text-gray-900">{order.shippingPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="text-gray-900">{order.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment</p>
                  <p className="text-gray-900">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="mt-3 bg-gray-50 p-3 rounded">
                <p className="font-bold text-gray-900 text-sm mb-2">Items:</p>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <p
                      key={`${order.id}-${item.productId}`}
                      className="text-sm text-gray-700"
                    >
                      • {item.name} × {item.quantity} = TK
                      {item.lineTotal.toFixed(2)}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(order.id, status)}
                    disabled={
                      updatingOrder === order.id || order.status === status
                    }
                    className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition ${
                      order.status === status
                        ? "bg-indigo-600 text-white cursor-not-allowed"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:opacity-50"
                    }`}
                  >
                    {updatingOrder === order.id ? "..." : status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Users Tab */
function UsersTab() {
  interface User {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    blocked?: boolean;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
      usersQuery,
      (usersSnapshot) => {
        clearTimeout(loadingTimeout);
        setLoadError("");
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          fullName: doc.data().fullName || "N/A",
          email: doc.data().email || "N/A",
          phone: doc.data().phone || "N/A",
          address: doc.data().address || "N/A",
          role: doc.data().role || "customer",
          blocked: doc.data().blocked || false,
        }));
        setUsers(usersData);
        setLoading(false);
      },
      async (error) => {
        clearTimeout(loadingTimeout);
        if (!isPermissionDeniedError(error)) {
          console.error("Failed to load users:", error);
        }

        setLoadError(
          isPermissionDeniedError(error)
            ? "Missing Firestore permission for reading users. Showing your profile only."
            : "Could not load all users. Showing your profile only.",
        );

        try {
          if (currentUser?.uid) {
            const profileDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              setUsers([
                {
                  id: profileDoc.id,
                  fullName: profileData.fullName || "N/A",
                  email: profileData.email || currentUser.email || "N/A",
                  phone: profileData.phone || "N/A",
                  address: profileData.address || "N/A",
                  role: profileData.role || "customer",
                  blocked: profileData.blocked || false,
                },
              ]);
            } else {
              setUsers([]);
            }
          }
        } catch (fallbackError) {
          if (!isPermissionDeniedError(fallbackError)) {
            console.error(
              "Failed to load fallback user profile:",
              fallbackError,
            );
          }
          setUsers([]);
        }
        setLoading(false);
      },
    );

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [currentUser?.uid, currentUser?.email]);

  const handleBlockUnblock = async (
    userId: string,
    currentBlockStatus: boolean,
  ) => {
    setBlockingUserId(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        blocked: !currentBlockStatus,
      });

      // Update local state
      alert(
        `User ${currentBlockStatus ? "unblocked" : "blocked"} successfully!`,
      );
    } catch (error) {
      if (!isPermissionDeniedError(error)) {
        console.error("Failed to block/unblock user:", error);
      }
      alert("Failed to update user status. Please try again.");
    } finally {
      setBlockingUserId(null);
    }
  };

  if (loading) {
    return <div className="text-gray-600 font-semibold">Loading users...</div>;
  }

  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Registered Users
      </h2>

      {loadError ? (
        <p className="mb-4 px-3 py-2 rounded bg-amber-100 text-amber-800 text-sm font-semibold">
          {loadError}
        </p>
      ) : null}

      {users.length === 0 ? (
        <p className="text-gray-600 font-semibold">No users yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-300 bg-gray-50">
                <th className="px-4 py-3 font-bold text-gray-900">Name</th>
                <th className="px-4 py-3 font-bold text-gray-900">Email</th>
                <th className="px-4 py-3 font-bold text-gray-900">Phone</th>
                <th className="px-4 py-3 font-bold text-gray-900">Address</th>
                <th className="px-4 py-3 font-bold text-gray-900">Role</th>
                <th className="px-4 py-3 font-bold text-gray-900">Status</th>
                <th className="px-4 py-3 font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    user.blocked ? "bg-red-50" : ""
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-semibold ${
                      user.blocked
                        ? "text-gray-500 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {user.fullName}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      user.blocked
                        ? "text-gray-500 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {user.email}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {user.phone}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {user.address}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-sm ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-sm ${
                        user.blocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleBlockUnblock(user.id, user.blocked || false)
                      }
                      disabled={blockingUserId === user.id}
                      className={`px-3 py-1 rounded font-bold text-sm transition-colors ${
                        user.blocked
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {blockingUserId === user.id
                        ? "Loading..."
                        : user.blocked
                          ? "Unblock"
                          : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
