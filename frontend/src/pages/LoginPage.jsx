import React, { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/users/login", {
        email,
        password,
      });

      const { accessToken, user } = res.data;
      toast.success("Login successful!");

      // Store JWT token for authenticated requests
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: { authenticated: true } }));

      // Navigate to home
      setTimeout(() => navigate("/", { state: { user } }), 1500);
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f7f1] p-4 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-lime-200/50 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_-28px_rgba(20,83,45,0.28)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden min-h-[580px] flex-col justify-between overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-10 text-white lg:flex xl:p-14">
          <div aria-hidden="true" className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/15" />
          <div aria-hidden="true" className="absolute -right-10 top-36 h-44 w-44 rounded-full border border-white/15" />
          <div className="relative">
            <div className="mb-16 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl">🌱</span>
              <span className="text-xl font-bold tracking-wide">AgriMitra</span>
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">Welcome back</p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight xl:text-5xl">
              Growing stronger, together.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-green-50/90">
              Sign in to connect with farmers, explore fresh produce, and find the tools your farm needs.
            </p>
          </div>
          <p className="relative text-sm text-green-100/80">A community for a better harvest.</p>
        </aside>

        <section className="flex items-center px-6 py-10 sm:px-12 sm:py-14 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9 lg:hidden">
              <div className="flex items-center gap-2 text-lg font-bold text-green-800">
                <span className="text-2xl">🌱</span> AgriMitra
              </div>
            </div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Your farming community</p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Welcome back</h2>
            <p className="mt-3 text-gray-500">Enter your details to sign in to your account.</p>

            <div className="mt-9 space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-gray-700">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                />
              </div>

              <button
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
              >
                Sign in <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">New to AgriMitra?</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <button
              onClick={() => navigate("/register")}
              className="w-full rounded-xl border border-green-200 bg-white px-5 py-3.5 font-semibold text-green-800 transition hover:border-green-400 hover:bg-green-50 focus:outline-none focus:ring-4 focus:ring-green-100"
            >
              Create an account
            </button>
            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              By continuing, you’re joining a community built around better farming.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
