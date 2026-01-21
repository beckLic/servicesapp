"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Loader } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Por favor ingresa una dirección de correo electrónico válida"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        setSubmitError(authError.message || "Failed to sign in");
        setIsLoading(false);
        return;
      }

      if (authData?.user) {
        router.push("/dashboard");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Bienvenido de Vuelta</h1>
            <p className="text-slate-600">
              Inicia sesión en tu cuenta para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-900"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-900"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{submitError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm">
            <p className="text-slate-600">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Protegido por Autenticación de Supabase</p>
        </div>
      </div>
    </div>
  );
}
