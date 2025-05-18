"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message || "Sign in failed");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="mb-2 px-4 py-2 rounded text-black"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="mb-4 px-4 py-2 rounded text-black"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-400">{error}</p>}
        <p className="mt-4">Don't have an account? <a href="/auth/signup" className="text-blue-400 underline">Sign up</a></p>
      </div>
    </main>
  );
} 