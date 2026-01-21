"use client";

import { useRouter } from "next/navigation";
import { Droplet, Zap, Flame, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-yellow-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Droplet className="w-8 h-8 text-blue-500" />
              <Flame className="w-8 h-8 text-orange-500" />
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Services App</h1>
            <p className="text-lg text-slate-600">
              Manage all your utility services in one place
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Droplet className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900 text-sm">Water</h3>
              <p className="text-xs text-slate-600 mt-1">Track water usage</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900 text-sm">Gas</h3>
              <p className="text-xs text-slate-600 mt-1">Monitor gas bills</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900 text-sm">Electric</h3>
              <p className="text-xs text-slate-600 mt-1">Control electricity</p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Easy Management</p>
                <p className="text-sm text-slate-600">
                  Add and organize all your utility accounts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Track Payments</p>
                <p className="text-sm text-slate-600">
                  Monitor paid, pending, and future bills
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Secure & Private</p>
                <p className="text-sm text-slate-600">
                  Your data is protected with Supabase
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => router.push("/login")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Login
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Sign Up
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500">
            <p>Secure authentication powered by Supabase</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>© 2026 Services App. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
