"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { auth, db } from "../../src/lib/firebase";

type Mode = "login" | "register";

const mapAuthError = (error: unknown) => {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please login instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing login.";
    case "auth/popup-blocked":
      return "Popup was blocked by browser. Please allow popups and try again.";
    case "auth/network-request-failed":
      return "Network issue detected. Check your internet and try again.";
    default:
      return error instanceof Error
        ? error.message
        : "Authentication failed. Please try again.";
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setFormError("");
  }, [mode]);

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1)
      return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2)
      return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (score === 3)
      return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  }, [password]);

  const validate = () => {
    if (!email.includes("@")) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";

    if (mode === "register") {
      if (fullName.trim().length < 2) return "Please enter your full name.";
      if (phone.trim().length < 7) return "Please enter a valid phone number.";
      if (address.trim().length < 6) return "Please enter a complete address.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        await addDoc(collection(db, "users"), {
          uid: credential.user.uid,
          email: credential.user.email,
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          role: "customer",
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push("/");
    } catch (error) {
      setFormError(mapAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError("");
    setIsGoogleSubmitting(true);

    try {
      const credential = await signInWithGoogle();
      const signedInUser = credential.user;

      await setDoc(
        doc(db, "users", signedInUser.uid),
        {
          uid: signedInUser.uid,
          email: signedInUser.email || "",
          fullName: signedInUser.displayName || "",
          phone: "",
          address: "",
          role: "customer",
          provider: "google",
          photoURL: signedInUser.photoURL || "",
          lastLoginAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      router.push("/");
    } catch (error) {
      setFormError(mapAuthError(error));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const openForgotPassword = () => {
    setResetEmail(email.trim());
    setResetStatus("");
    setForgotOpen(true);
  };

  const handlePasswordReset = async () => {
    const nextEmail = resetEmail.trim();
    if (!nextEmail || !nextEmail.includes("@")) {
      setResetStatus("Please enter a valid email address.");
      return;
    }

    setIsResetting(true);
    setResetStatus("");
    try {
      await sendPasswordResetEmail(auth, nextEmail);
      setResetStatus(
        "Password reset email sent. Please check your inbox and spam folder.",
      );
    } catch (error) {
      setResetStatus(mapAuthError(error));
    } finally {
      setIsResetting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 font-medium">Loading authentication...</p>
      </div>
    );
  }

  return (
    <section
      className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6"
      style={{
        fontFamily: "var(--font-playfair), Georgia, Times New Roman, serif",
      }}
    >
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <div className="grid lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between p-10 bg-linear-to-br from-slate-900 to-indigo-900 text-white">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white mb-4"
              >
                ← Back to shop
              </Link>
              <p className="inline-flex text-[11px] font-semibold tracking-wide uppercase bg-white/20 px-3 py-1 rounded-full">
                DryBasket Secure Access
              </p>
              <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight">
                Smart way to buy quality dry food
              </h2>
              <p className="mt-4 text-white/80 text-base leading-7 max-w-md">
                Manage your account, order quickly, and track purchases in one
                clean dashboard.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p className="bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                ✓ Fast checkout process
              </p>
              <p className="bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                ✓ Order history & status
              </p>
              <p className="bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                ✓ Secure Firebase authentication
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 bg-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-slate-600 text-center mt-2">
              {mode === "login"
                ? "Login to continue shopping your favorite dry foods"
                : "Register with your details to place and track orders"}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 bg-slate-100 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white shadow-sm text-indigo-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-white shadow-sm text-indigo-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Register
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting || isSubmitting}
              className="mt-4 w-full border border-slate-300 bg-white text-slate-800 py-3 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.21 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.84 1.154 7.958 3.042l5.657-5.657C34.046 6.053 29.279 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c10.493 0 20-7.595 20-20 0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 12 24 12c3.059 0 5.84 1.154 7.958 3.042l5.657-5.657C34.046 6.053 29.279 4 24 4c-7.682 0-14.41 4.337-17.694 10.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.177 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.144 35.091 26.659 36 24 36c-5.19 0-9.617-3.325-11.283-7.946l-6.522 5.025C9.438 39.556 16.671 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571l.003-.002 6.19 5.238C37. 38.518 44 33 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
              {isGoogleSubmitting
                ? "Connecting Google..."
                : mode === "login"
                  ? "Sign in with Google"
                  : "Register with Google"}
            </button>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                or continue with email
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Full Name
                    </label>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Enter your full name"
                      className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Phone
                      </label>
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Address
                      </label>
                      <input
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder="City, area, street"
                        className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 pr-20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {mode === "register" && password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all`}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Password strength:{" "}
                      <span className="font-semibold">
                        {passwordStrength.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-sm text-slate-600">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {formError && (
                <p className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-sm disabled:bg-indigo-300"
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "login"
                    ? "Login to DryBasket"
                    : "Create DryBasket Account"}
              </button>

              <p className="text-xs text-slate-500 text-center">
                By continuing, you agree to secure authentication and account
                usage terms.
              </p>
            </form>

            {forgotOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl p-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    Reset your password
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter your email and we will send a password reset link.
                  </p>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(event) => setResetEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full border-2 border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                    />
                  </div>

                  {resetStatus && (
                    <p
                      className={`mt-3 text-sm rounded-xl px-3 py-2.5 border ${
                        resetStatus.toLowerCase().includes("sent")
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      {resetStatus}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={isResetting}
                      className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-300"
                    >
                      {isResetting ? "Sending..." : "Send reset link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
