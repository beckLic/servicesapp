"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Droplet,
  Flame,
  Zap,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  LogOut,
  Loader,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ==================== Types & Interfaces ====================

enum ServiceProvider {
  AYSAM = "AYSAM",
  ECOGAS_CUYANA = "ECOGAS_CUYANA",
  EDEMSA = "EDEMSA",
}

enum BillStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  FUTURE = "FUTURE",
}

interface Bill {
  month: number; // 1-12
  year: number;
  status: BillStatus;
  amount?: number;
}

interface ServiceAccount {
  id: string;
  provider: ServiceProvider;
  accountNumber: string;
  alias?: string;
  bills: Bill[];
}

interface User {
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

// ==================== Zod Schemas ====================

const addServiceSchema = z.object({
  provider: z.nativeEnum(ServiceProvider),
  accountNumber: z
    .string()
    .min(1, "El número de cuenta es requerido")
    .regex(/^[0-9A-Za-z\-]+$/, "El número de cuenta debe ser alfanumérico"),
  alias: z.string().optional(),
});

type AddServiceFormData = z.infer<typeof addServiceSchema>;

// ==================== Mock Data ====================

const mockServices: ServiceAccount[] = [
  {
    id: "1",
    provider: ServiceProvider.AYSAM,
    accountNumber: "1234567",
    alias: "Home Water - Case A (Debt in Past)",
    bills: [
      { month: 1, year: 2026, status: BillStatus.PAID, amount: 15000 },
      { month: 2, year: 2026, status: BillStatus.PAID, amount: 16000 },
      { month: 3, year: 2026, status: BillStatus.PAID, amount: 15500 },
      { month: 4, year: 2026, status: BillStatus.PAID, amount: 16500 },
      { month: 5, year: 2026, status: BillStatus.PAID, amount: 14800 },
      { month: 6, year: 2026, status: BillStatus.PAID, amount: 15200 },
      { month: 7, year: 2026, status: BillStatus.PAID, amount: 16100 },
      { month: 8, year: 2026, status: BillStatus.PAID, amount: 15900 },
      { month: 9, year: 2026, status: BillStatus.PAID, amount: 16300 },
      { month: 10, year: 2026, status: BillStatus.PAID, amount: 15700 },
      { month: 11, year: 2026, status: BillStatus.PAID, amount: 16200 },
      { month: 12, year: 2026, status: BillStatus.PENDING, amount: 18500 },
    ],
  },
  {
    id: "2",
    provider: ServiceProvider.ECOGAS_CUYANA,
    accountNumber: "9876543",
    alias: "Home Gas - Case B (Clean Slate)",
    bills: [
      { month: 1, year: 2026, status: BillStatus.PAID, amount: 45000 },
      { month: 2, year: 2026, status: BillStatus.PAID, amount: 52000 },
      { month: 3, year: 2026, status: BillStatus.PAID, amount: 48000 },
      { month: 4, year: 2026, status: BillStatus.PAID, amount: 50000 },
      { month: 5, year: 2026, status: BillStatus.PAID, amount: 60000 },
      { month: 6, year: 2026, status: BillStatus.PAID, amount: 55000 },
      { month: 7, year: 2026, status: BillStatus.PAID, amount: 58000 },
      { month: 8, year: 2026, status: BillStatus.PAID, amount: 62000 },
      { month: 9, year: 2026, status: BillStatus.PAID, amount: 59000 },
      { month: 10, year: 2026, status: BillStatus.PAID, amount: 61000 },
      { month: 11, year: 2026, status: BillStatus.PAID, amount: 63000 },
      { month: 12, year: 2026, status: BillStatus.PAID, amount: 65000 },
      { month: 1, year: 2027, status: BillStatus.PENDING, amount: 68000 },
      { month: 2, year: 2027, status: BillStatus.PENDING, amount: 70000 },
      { month: 3, year: 2027, status: BillStatus.FUTURE },
      { month: 4, year: 2027, status: BillStatus.FUTURE },
      { month: 5, year: 2027, status: BillStatus.FUTURE },
      { month: 6, year: 2027, status: BillStatus.FUTURE },
      { month: 7, year: 2027, status: BillStatus.FUTURE },
      { month: 8, year: 2027, status: BillStatus.FUTURE },
      { month: 9, year: 2027, status: BillStatus.FUTURE },
      { month: 10, year: 2027, status: BillStatus.FUTURE },
      { month: 11, year: 2027, status: BillStatus.FUTURE },
      { month: 12, year: 2027, status: BillStatus.FUTURE },
    ],
  },
  {
    id: "3",
    provider: ServiceProvider.EDEMSA,
    accountNumber: "5555555",
    alias: "Home Electricity - Mixed Status",
    bills: [
      { month: 1, year: 2026, status: BillStatus.PAID, amount: 75500 },
      { month: 2, year: 2026, status: BillStatus.PAID, amount: 80000 },
      { month: 3, year: 2026, status: BillStatus.PAID, amount: 78000 },
      { month: 4, year: 2026, status: BillStatus.PAID, amount: 82000 },
      { month: 5, year: 2026, status: BillStatus.PENDING, amount: 85000 },
      { month: 6, year: 2026, status: BillStatus.FUTURE },
      { month: 7, year: 2026, status: BillStatus.FUTURE },
      { month: 8, year: 2026, status: BillStatus.FUTURE },
      { month: 9, year: 2026, status: BillStatus.FUTURE },
      { month: 10, year: 2026, status: BillStatus.FUTURE },
      { month: 11, year: 2026, status: BillStatus.FUTURE },
      { month: 12, year: 2026, status: BillStatus.FUTURE },
    ],
  },
];

// ==================== Utility Functions ====================

const getProviderIcon = (provider: ServiceProvider) => {
  switch (provider) {
    case ServiceProvider.AYSAM:
      return <Droplet className="w-6 h-6 text-blue-500" />;
    case ServiceProvider.ECOGAS_CUYANA:
      return <Flame className="w-6 h-6 text-orange-500" />;
    case ServiceProvider.EDEMSA:
      return <Zap className="w-6 h-6 text-yellow-500" />;
  }
};

const getProviderName = (provider: ServiceProvider) => {
  switch (provider) {
    case ServiceProvider.AYSAM:
      return "AYSAM";
    case ServiceProvider.ECOGAS_CUYANA:
      return "ECOGAS CUYANA";
    case ServiceProvider.EDEMSA:
      return "EDEMSA";
  }
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const calculateTotalDebt = (bills: Bill[]): number => {
  return bills.reduce((sum, bill) => {
    if (bill.status === BillStatus.PENDING && bill.amount) {
      return sum + bill.amount;
    }
    return sum;
  }, 0);
};

const getActiveYear = (bills: Bill[]): number => {
  // Get all unique years sorted ascending
  const years = Array.from(new Set(bills.map((bill) => bill.year))).sort(
    (a, b) => a - b
  );

  if (years.length === 0) {
    return new Date().getFullYear();
  }

  // Find the earliest year with unpaid debt (PENDING)
  for (const year of years) {
    const yearBills = bills.filter((bill) => bill.year === year);
    const hasUnpaid = yearBills.some(
      (bill) => bill.status === BillStatus.PENDING
    );
    if (hasUnpaid) {
      return year;
    }
  }

  // If all years are fully paid, return the latest year
  return years[years.length - 1];
};

// ==================== Service Card Component ====================

interface ServiceCardProps {
  service: ServiceAccount;
}

function ServiceCard({ service }: ServiceCardProps) {
  const activeYear = getActiveYear(service.bills);
  const yearBills = service.bills.filter((bill) => bill.year === activeYear);
  const totalDebt = calculateTotalDebt(yearBills);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getProviderIcon(service.provider)}
          <div>
            <p className="text-sm font-medium text-slate-500">
              {getProviderName(service.provider)}
            </p>
            <p className="text-lg font-bold text-slate-900">
              {service.accountNumber}
            </p>
            {service.alias && (
              <p className="text-xs text-slate-400 mt-1">{service.alias}</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600 uppercase">
          Bill Status {activeYear}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {yearBills.map((bill, idx) => {
            const isDebt = bill.status === BillStatus.PENDING;
            const isPaid = bill.status === BillStatus.PAID;
            const isFuture = bill.status === BillStatus.FUTURE;

            return (
              <div
                key={idx}
                className="relative group"
                title={`${monthNames[bill.month - 1]} ${bill.year}: ${bill.status}${bill.amount ? ` - $${bill.amount}` : ""}`}
              >
                {isPaid && (
                  <div className="w-full bg-green-100 rounded-sm border border-green-300 flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-4 h-4 text-green-600 mb-1" />
                    <span className="text-[10px] text-green-700 font-medium">
                      {monthNames[bill.month - 1]}
                    </span>
                  </div>
                )}
                {isDebt && (
                  <div className="w-full bg-red-100 rounded-sm border border-red-300 flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:bg-red-200 transition-colors min-h-[3.5rem]">
                    <span className="text-[10px] text-red-600 font-medium">
                      {monthNames[bill.month - 1]}
                    </span>
                    {bill.amount && (
                      <span className="text-sm font-bold text-red-700 mt-1 break-words text-center">
                        ${bill.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
                {isFuture && (
                  <div className="w-full bg-slate-100 rounded-sm border border-slate-200 flex flex-col items-center justify-center px-2 py-2 cursor-pointer hover:bg-slate-200 transition-colors">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {monthNames[bill.month - 1]}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">-</span>
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {monthNames[bill.month - 1]} {bill.year}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Debt */}
      <div className="pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Deuda Total {activeYear}:</span>
          <span
            className={`text-lg font-bold ${
              totalDebt > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            ${totalDebt.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== Add Service Dialog Component ====================

interface AddServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddServiceFormData) => void;
  isLoading: boolean;
}

function AddServiceDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: AddServiceDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddServiceFormData>({
    resolver: zodResolver(addServiceSchema),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Añadir Nuevo Servicio</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Provider Select */}
          <div className="space-y-2">
            <label
              htmlFor="provider"
              className="block text-sm font-semibold text-slate-900"
            >
              Proveedor de Servicios
            </label>
            <select
              id="provider"
              {...register("provider")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 bg-white transition-all"
            >
              <option value="">Selecciona un proveedor...</option>
              <option value={ServiceProvider.AYSAM}>AYSAM (Agua)</option>
              <option value={ServiceProvider.ECOGAS_CUYANA}>
                ECOGAS CUYANA (Gas)
              </option>
              <option value={ServiceProvider.EDEMSA}>EDEMSA (Electricidad)</option>
            </select>
            {errors.provider && (
              <p className="text-red-500 text-sm font-medium">
                {errors.provider.message}
              </p>
            )}
          </div>

          {/* Account Number Input */}
          <div className="space-y-2">
            <label
              htmlFor="accountNumber"
              className="block text-sm font-semibold text-slate-900"
            >
              Número de Cuenta
            </label>
            <input
              id="accountNumber"
              type="text"
              placeholder="Ingresa tu número de cuenta"
              {...register("accountNumber")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
            />
            {errors.accountNumber && (
              <p className="text-red-500 text-sm font-medium">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          {/* Alias Input */}
          <div className="space-y-2">
            <label
              htmlFor="alias"
              className="block text-sm font-semibold text-slate-900"
            >
              Alias (Opcional)
            </label>
            <input
              id="alias"
              type="text"
              placeholder="p. ej., Casa, Oficina"
              {...register("alias")}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Añadiendo...</span>
                </>
              ) : (
                "Añadir Servicio"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Dashboard Page Component ====================

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<ServiceAccount[]>(mockServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        setUser(authUser as User);
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  const handleAddService = async (data: AddServiceFormData) => {
    setIsAddingService(true);
    try {
      // Simulate API call
      const newService: ServiceAccount = {
        id: Math.random().toString(36).substr(2, 9),
        provider: data.provider,
        accountNumber: data.accountNumber,
        alias: data.alias,
        bills: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          year: 2026,
          status: i < 2 ? BillStatus.PAID : i < 4 ? BillStatus.PENDING : BillStatus.FUTURE,
          amount: i < 4 ? Math.floor(Math.random() * 300) + 100 : undefined,
        })),
      };

      setServices([...services, newService]);
      setIsDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al añadir el servicio"
      );
    } finally {
      setIsAddingService(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const userName =
    user?.user_metadata?.full_name || user?.email || "User";

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Bienvenido, {userName}!
              </h1>
              <p className="text-slate-600 mt-1">
                Gestiona tus servicios de utilidad y rastrea pagos
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Añadir Servicio
              </button>
              <button
                onClick={handleLogout}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2.5 px-4 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {services.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Sin servicios aún
            </h2>
            <p className="text-slate-600 mb-6">
              Añade tu primer servicio para comenzar a rastrear pagos
            </p>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Añadir Servicio
            </button>
          </div>
        ) : (
          <>
            {/* Info Section */}
            <div className="bg-white rounded-lg p-4 mb-8 border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Verde = Pagado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span>Rojo = Pendiente</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-sm" />
                <span>Gris = Futuro/Desconocido</span>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Add Service Dialog */}
      <AddServiceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleAddService}
        isLoading={isAddingService}
      />
    </div>
  );
}
