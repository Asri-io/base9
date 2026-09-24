"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base9-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-1 justify-center mb-12">
          <span className="text-3xl font-bold tracking-widest text-base9-white uppercase">BASE</span>
          <span className="text-3xl font-bold text-base9-red">9</span>
        </div>

        <div className="bg-base9-gray-800 p-8">
          <p className="text-[10px] tracking-ultra-wide uppercase text-base9-gray-500 mb-6 text-center">
            Admin Access
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] tracking-ultra-wide uppercase text-base9-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-base9-gray-700 border border-base9-gray-600 text-base9-white px-4 py-3 text-sm focus:outline-none focus:border-base9-red transition-colors"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-base9-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-base9-red text-base9-white py-3 text-xs tracking-ultra-wide uppercase font-medium hover:bg-base9-red-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
