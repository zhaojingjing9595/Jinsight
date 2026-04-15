"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Check your email for a confirmation link, then sign in.");
      setLoading(false);
      return;
    }

    // Provision User row + default account via the API
    const token = data.session.access_token;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/trpc/auth.register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            json: { name: name || undefined, currency: "ILS" },
          }),
        },
      );

      if (!res.ok) {
        console.error("auth.register failed:", await res.text());
      }
    } catch (err) {
      console.error("Failed to call auth.register:", err);
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-primary">
      {/* Starburst */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 46 46"
        fill="none"
        className="mb-5"
        aria-hidden="true"
      >
        <path
          d="M23 0L25.5 18.5L40 8L29.5 21L46 23L29.5 25L40 38L25.5 27.5L23 46L20.5 27.5L6 38L16.5 25L0 23L16.5 21L6 8L20.5 18.5L23 0Z"
          fill="#2ad2a3"
          stroke="#111008"
          strokeWidth="1.5"
        />
      </svg>

      <h1 className="font-display text-[36px] font-[900] text-white text-center leading-[1.0] mb-2 tracking-tight">
        JOIN JINSIGHT
      </h1>
      <p className="font-body text-[12px] text-primary-muted text-center leading-[1.5] max-w-[280px] mb-8">
        Start tracking your money with clarity and style.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[340px] bg-base border-[2.5px] border-ink rounded-[14px] p-5 shadow-neo-md flex flex-col gap-4"
      >
        {error && (
          <div className="bg-alert/10 border-2 border-alert rounded-btn px-3 py-2 text-[12px] font-body font-[700] text-alert">
            {error}
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="font-body text-[10px] font-[700] uppercase tracking-[2px] text-muted">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-body text-[14px] bg-base border-2 border-ink rounded-btn px-3 py-2.5 outline-none focus:shadow-neo-xs transition-shadow"
            placeholder="What should we call you?"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-body text-[10px] font-[700] uppercase tracking-[2px] text-muted">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-body text-[14px] bg-base border-2 border-ink rounded-btn px-3 py-2.5 outline-none focus:shadow-neo-xs transition-shadow"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-body text-[10px] font-[700] uppercase tracking-[2px] text-muted">
            Password
          </span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-body text-[14px] bg-base border-2 border-ink rounded-btn px-3 py-2.5 outline-none focus:shadow-neo-xs transition-shadow"
            placeholder="At least 6 characters"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="font-body w-full py-3 text-center text-[14px] font-[700] text-ink rounded-btn border-2 border-ink bg-income shadow-neo-sm transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-neo-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-neo-pressed disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? "Creating account..." : "Get Started"}
        </button>
      </form>

      <Link
        href="/login"
        className="font-body mt-6 text-[12px] text-primary-muted underline underline-offset-2"
      >
        Already have an account? Sign in
      </Link>

      <Link
        href="/"
        className="font-body mt-3 text-[12px] text-primary-muted/60 underline underline-offset-2"
      >
        Back to home
      </Link>
    </main>
  );
}
