"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { db } from "../../src/lib/firebase";
import { getProducts, OrderRecord, Product } from "../../src/lib/store";

type AdminTab = "overview" | "products" | "orders" | "users";

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
  const [loadingData, setLoadingData] = useState(true);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = Boolean(user?.email && user.email === adminEmail);

  useEffect(() => {
    if (!loading && isAdmin) {
      loadDashboardData();
    }
  }, [loading, isAdmin]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // Load products
      const productsData = await getProducts();
      setProducts(productsData);

      // Load all orders
      const ordersQuery = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc"),
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OrderRecord[];
      setAllOrders(ordersData);

      // Load users count
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);
      const usersCount = usersSnapshot.size;

      // Calculate stats
      const totalRevenue = ordersData.reduce(
        (sum, order) => sum + order.grandTotal,
        0,
      );

      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue,
        totalUsers: usersCount,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

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
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Stat Cards */}
      <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 font-semibold text-sm">
              Total Products
            </p>
            <p className="text-4xl font-bold text-indigo-700 mt-2">
              {stats.totalProducts}
            </p>
          </div>
          <span className="text-3xl">📦</span>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 font-semibold text-sm">Total Orders</p>
            <p className="text-4xl font-bold text-green-700 mt-2">
              {stats.totalOrders}
            </p>
          </div>
          <span className="text-3xl">🛒</span>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 font-semibold text-sm">Total Revenue</p>
            <p className="text-4xl font-bold text-blue-700 mt-2">
              TK {stats.totalRevenue.toFixed(2)}
            </p>
          </div>
          <span className="text-3xl">💰</span>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-300 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 font-semibold text-sm">Total Users</p>
            <p className="text-4xl font-bold text-purple-700 mt-2">
              {stats.totalUsers}
            </p>
          </div>
          <span className="text-3xl">👥</span>
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
  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600 font-semibold">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                    className={`inline-block px-3 py-1 rounded-full font-bold text-sm mt-1 ${
                      order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "Shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                    }`}
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
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          fullName: doc.data().fullName || "N/A",
          email: doc.data().email || "N/A",
          phone: doc.data().phone || "N/A",
          address: doc.data().address || "N/A",
          role: doc.data().role || "customer",
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) {
    return <div className="text-gray-600 font-semibold">Loading users...</div>;
  }

  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Registered Users
      </h2>

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
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {user.fullName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
