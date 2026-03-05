
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function SigninPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await signIn("credentials", {
      phone,
      password,
      mode: "signin",
      redirect: false
    })

    if (res?.ok) {
      router.push("/dashboard")
    } else {
      alert("Invalid phone or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-100 px-4">
      
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl border border-emerald-100 p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-700 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to access your wallet
          </p>
        </div>

        <form onSubmit={handleSignin} className="space-y-6">

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
              required
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all text-sm shadow-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all text-sm shadow-sm"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 text-white py-3 rounded-xl font-semibold shadow-md"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="text-emerald-600 font-medium cursor-pointer hover:underline"
          >
            Create Account
          </span>
        </p>
      </div>
    </div>
  )
}