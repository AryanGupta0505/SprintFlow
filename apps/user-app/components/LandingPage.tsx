
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-blue-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-3xl -z-10" />

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-start text-center px-6 pt-16 pb-20">

        {/* LOGO + BRAND */}
<div className="flex items-center justify-center gap-3 mb-8">

  <Image
    src="/logo.svg"
    alt="SprintFlow Logo"
    width={260}
    height={260}
    className="object-contain drop-shadow-lg"
    priority
  />

  <h1 className="text-6xl md:text-8xl font-extrabold tracking-[-0.02em] leading-none select-none flex items-center">
    <span className="text-blue-600">
      Sprint
    </span>
    <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
      Flow
    </span>
  </h1>

</div>

        {/* TAGLINE */}
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
          Move Money
          <br />
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            at the Speed of Now.
          </span>
        </h2>

        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Frictionless transfers. Real-time payments. Total financial clarity.
          SprintFlow empowers you to move money instantly with confidence.
        </p>

        {/* BUTTONS */}
        <div className="mt-10 flex gap-6 flex-wrap justify-center">
          <button
            onClick={() => router.push("/signup")}
            className="px-14 py-5 bg-gradient-to-r from-blue-600 to-teal-500 hover:scale-105 text-white rounded-2xl text-lg font-semibold shadow-xl transition duration-300"
          >
            Get Started
          </button>

          <button
            onClick={() => router.push("/signin")}
            className="px-14 py-5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-2xl text-lg font-semibold shadow-md hover:shadow-lg transition duration-300"
          >
            Login
          </button>
        </div>

      </div>

      {/* FEATURES */}
      <div className="pb-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

          <div className="p-10 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 text-center border border-slate-100">
            <div className="text-5xl mb-6">⚡</div>
            <h3 className="text-xl font-semibold text-slate-900">
              Instant Transfers
            </h3>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Send and receive money in real-time with secure P2P transfers.
            </p>
          </div>

          <div className="p-10 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 text-center border border-slate-100">
            <div className="text-5xl mb-6">🔒</div>
            <h3 className="text-xl font-semibold text-slate-900">
              Bank-Level Security
            </h3>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Enterprise-grade encryption keeps your funds and data protected.
            </p>
          </div>

          <div className="p-10 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 text-center border border-slate-100">
            <div className="text-5xl mb-6">📊</div>
            <h3 className="text-xl font-semibold text-slate-900">
              Smart Tracking
            </h3>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Monitor, filter, and analyze transactions with powerful insights.
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center py-8 text-sm text-slate-500 border-t border-slate-200">
        © {new Date().getFullYear()} SprintFlow. All rights reserved.
      </div>

    </div>
  );
}