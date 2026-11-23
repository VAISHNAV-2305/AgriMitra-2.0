import React, { useState } from "react";

export default function SignUp() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [result, setResult] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5001/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResult(data.message || "Registration complete!");

    if (data.message?.includes("success")) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f7f1] p-4 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-green-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-lime-200/50 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_80px_-28px_rgba(20,83,45,0.28)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-10 text-white lg:flex xl:p-14">
          <div aria-hidden="true" className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/15" />
          <div aria-hidden="true" className="absolute -right-10 top-36 h-44 w-44 rounded-full border border-white/15" />
          <div className="relative">
            <div className="mb-16 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl">🌱</span>
              <span className="text-xl font-bold tracking-wide">AgriMitra</span>
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">Start your journey</p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight xl:text-5xl">
              Good things grow when we connect.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-green-50/90">
              Create your account to discover a community supporting farmers and more sustainable agriculture.
            </p>
          </div>
          <p className="relative text-sm text-green-100/80">A community for a better harvest.</p>
        </aside>

        <section className="flex items-center px-6 py-10 sm:px-12 sm:py-14 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-2 text-lg font-bold text-green-800">
                <span className="text-2xl">🌱</span> AgriMitra
              </div>
            </div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Join the community</p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Create your account</h2>
            <p className="mt-3 text-gray-500">A few details are all you need to get started.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-semibold text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
              >
                Create account <span aria-hidden="true">→</span>
              </button>
            </form>

            <p role="status" className="mt-4 text-center text-sm font-medium text-green-800">
              {result}
            </p>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-green-700 transition hover:text-green-900 hover:underline">
                Sign in
              </a>
            </p>
            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              By creating an account, you’re joining a community built around better farming.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}