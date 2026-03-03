"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = Boolean(user?.email && user.email === adminEmail);
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (href: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      pathname === href
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const mobileMenuItemClass = (href: string) =>
    `block w-full text-left px-4 py-2 text-sm font-medium transition ${
      pathname === href
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          className="font-bold text-lg sm:text-xl text-indigo-700 whitespace-nowrap"
        >
          DryBasket
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
          <Link href="/" className={`${linkClass("/")} text-sm px-3`}>
            Shop
          </Link>
          <Link
            href="/verify-invoice"
            className={`${linkClass("/verify-invoice")} text-sm px-3 whitespace-nowrap`}
          >
            🔐 Verify Invoice
          </Link>
          {user && (
            <>
              <Link
                href="/cart"
                className={`${linkClass("/cart")} text-sm px-3`}
              >
                Cart ({itemCount})
              </Link>
              <Link
                href="/orders"
                className={`${linkClass("/orders")} text-sm px-3`}
              >
                Orders
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                href="/admin"
                className={`${linkClass("/admin")} text-sm px-3 whitespace-nowrap`}
              >
                📦 Manage
              </Link>
              <Link
                href="/admin-dashboard"
                className={`${linkClass("/admin-dashboard")} text-sm px-3 whitespace-nowrap`}
              >
                📊 Dashboard
              </Link>
            </>
          )}

          {!user ? (
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition whitespace-nowrap"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black transition whitespace-nowrap"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`${mobileMenuItemClass("/")} border-b`}
              >
                🏪 Shop
              </Link>
              <Link
                href="/verify-invoice"
                onClick={closeMobileMenu}
                className={`${mobileMenuItemClass("/verify-invoice")} border-b`}
              >
                🔐 Verify
              </Link>
              {user && (
                <>
                  <Link
                    href="/cart"
                    onClick={closeMobileMenu}
                    className={`${mobileMenuItemClass("/cart")} border-b`}
                  >
                    🛒 Cart ({itemCount})
                  </Link>
                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className={`${mobileMenuItemClass("/orders")} border-b`}
                  >
                    📋 Orders
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className={`${mobileMenuItemClass("/admin")} border-b`}
                  >
                    📦 Manage
                  </Link>
                  <Link
                    href="/admin-dashboard"
                    onClick={closeMobileMenu}
                    className={`${mobileMenuItemClass("/admin-dashboard")} border-b`}
                  >
                    📊 Dashboard
                  </Link>
                </>
              )}
              {!user ? (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="block w-full text-left px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition rounded-b-lg"
                >
                  🔑 Login
                </Link>
              ) : (
                <button
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                    closeMobileMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-black transition rounded-b-lg"
                >
                  🚪 Logout
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
