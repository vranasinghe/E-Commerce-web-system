import { prisma } from "@repo/database";
import {
  TrendingUp,
  Download,
  Eye,
  Trash2,
  MoreHorizontal,
  Star,
  ChevronDown,
  BarChart2,
  ArrowUpRight,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function moneyShort(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return money(n);
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "Completed",
  PROCESSING: "In Process",
  PENDING: "On Hold",
  CANCELLED: "Cancelled",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

const REVENUE_BARS = [30, 50, 40, 70, 55, 80, 65, 45, 60, 75, 85, 70];
const SPENDING_BARS: [number, number][] = [
  [35, 25],
  [60, 45],
  [45, 35],
  [80, 60],
  [55, 42],
  [75, 55],
  [50, 38],
];

export default async function DashboardPage() {
  const [productCount, orderCount, customerCount, orders, recent] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({ select: { total: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true, user: { select: { name: true, email: true } } },
      }),
    ]);

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const totalSales = revenue > 0 ? revenue * 5.9 : 201843.52;
  const totalProfit = revenue > 0 ? revenue * 14.65 : 500468.15;
  const income = revenue > 0 ? revenue * 0.605 : 20687.69;
  const revenueDisplay = revenue > 0 ? revenue : 34129.03;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-[#f7f8fc] dark:bg-gray-950 font-sans -m-8 p-8 transition-colors duration-300">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">eCommerce Dashboard</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Dashboard &rsaquo; <span className="text-pink-500">eCommerce</span>
          </p>
        </div>
        {/* Theme toggle in header for easy access */}
        <div className="w-44">
          <ThemeToggle />
        </div>
      </div>

      {/* ── Row 1: Revenue + Spending + Congrats ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Revenue card */}
        <div className="rounded-2xl bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 text-white p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold opacity-90">Revenue</span>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-xs cursor-pointer">
                Monthly <ChevronDown className="w-3 h-3" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{money(revenueDisplay)}</p>
            <div className="flex items-center gap-1 text-xs mb-4">
              <TrendingUp className="w-3 h-3 text-green-300" />
              <span className="text-green-300 font-semibold">+4.07%</span>
              <span className="opacity-70">prev month</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {REVENUE_BARS.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-sm ${i === REVENUE_BARS.length - 1 ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Spending Statistics */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Spending Statistic</h2>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <Download className="w-3.5 h-3.5 text-pink-500" />
              Download
            </button>
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">Income</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{money(income)}</span>
              <span className="text-xs text-green-500 font-semibold">+8.50%</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-20 mb-2">
            {SPENDING_BARS.map(([h1, h2], i) => (
              <div key={i} className="flex items-end gap-0.5 flex-1">
                <div style={{ height: `${h1}%` }} className="flex-1 rounded-t bg-pink-500" />
                <div style={{ height: `${h2}%` }} className="flex-1 rounded-t bg-gray-800 dark:bg-gray-300" />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
            {days.map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            {[
              { label: "Total Revenue", value: money(totalSales), change: "+6.37%", up: true },
              { label: "Total Sales", value: money(totalSales * 1.39), change: "-7.05%", up: false },
              { label: "Total Profit", value: money(totalProfit), change: "+7.0%", up: true },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{s.label}</p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 mt-0.5">{s.value}</p>
                <p className={`text-[10px] font-semibold ${s.up ? "text-green-500" : "text-red-500"}`}>{s.change}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Congratulation */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/20 rounded-bl-full opacity-60" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Congratulation James 🎉</p>
              <div className="bg-pink-100 dark:bg-pink-900/30 rounded-xl p-2">
                <Trophy className="w-5 h-5 text-pink-500" />
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center">
                <span className="text-4xl">🏆</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">$1200K</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">0.95% since last year</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">You have reached 99.9% of your sales target today.</p>
              <p className="text-[10px] text-pink-400 mt-2 font-medium">Updated 20 minutes ago.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Total Sales + Stat cards ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Total Sales</span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 cursor-pointer">
              Monthly <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{money(totalSales)}</p>
          <div className="flex items-center gap-1 text-xs mb-4">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-500 font-semibold">+8.50%</span>
            <span className="text-gray-400 dark:text-gray-500">prev month</span>
          </div>
          <div className="flex items-end gap-1.5 h-12">
            {[40, 65, 50, 80, 60, 75, 55].map((h, i) => (
              <div key={i} style={{ height: `${h}%` }} className={`flex-1 rounded-sm ${i % 2 === 0 ? "bg-pink-400" : "bg-gray-200 dark:bg-gray-700"}`} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Products", value: String(productCount || 48), icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
            { label: "Orders", value: String(orderCount || 156), icon: BarChart2, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
            { label: "Customers", value: String(customerCount || 2431), icon: ArrowUpRight, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-500/10" },
            { label: "Revenue", value: moneyShort(revenueDisplay), icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-colors duration-300">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: Transactions + Reviews ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Customer Transaction */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Customer Transaction</h2>
            <button className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">No transactions yet. Place an order from the storefront to see it here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="pl-5 pr-3 py-3 font-medium text-left w-6"></th>
                    <th className="px-3 py-3 font-medium text-left">Customer</th>
                    <th className="px-3 py-3 font-medium text-left">Item</th>
                    <th className="px-3 py-3 font-medium text-left">Date</th>
                    <th className="px-3 py-3 font-medium text-left">Status</th>
                    <th className="px-3 py-3 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o, idx) => {
                    const statusKey = o.status.toUpperCase();
                    const statusStyle = STATUS_STYLES[statusKey] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
                    const statusLabel = STATUS_LABEL[statusKey] ?? o.status;
                    const isChecked = idx === 0 || idx === 5;
                    return (
                      <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-pink-50/30 dark:hover:bg-pink-500/5 transition-colors">
                        <td className="pl-5 pr-3 py-3">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? "bg-pink-500" : "border border-gray-300 dark:border-gray-600"}`}>
                            {isChecked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(o.user?.name ?? o.email ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[90px]">
                              {o.user?.name ?? o.email ?? "Guest"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400">{o.items[0] ? (o.items[0].name ?? "Product") : "—"}</td>
                        <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle}`}>{statusLabel}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Reviews</h2>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">2k+ 5 Star Review</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition font-medium">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-5">
            <div className="rounded-xl border border-pink-100 dark:border-pink-900/30 bg-pink-50/40 dark:bg-pink-900/10 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">J</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">James Carter</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map((s) => <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">2 — 1</span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Absolutely love this product! Great quality, fast shipping, and excellent customer service.
                It exceeded my expectations in every way. I&apos;ll definitely be a repeat customer. Highly recommended!
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["A","B","C","D"].map((l, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-[8px] font-bold">{l}</div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-100">2k+</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">5 Star Review</p>
                </div>
              </div>
              <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-pink-200 dark:shadow-pink-900/30">Report</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Sales Analytics + World Sales ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Sales Analytics */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Sales Analytics</h2>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 cursor-pointer">
              Monthly <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32 mb-2">
            {[20, 40, 60, 35, 75, 55, 90, 65, 80, 45, 70, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
                <div style={{ height: `${h * 0.8}%` }} className="rounded-t-sm bg-pink-500 opacity-80" />
                <div style={{ height: `${h * 0.3}%` }} className="rounded-t-sm bg-pink-200 dark:bg-pink-900/50" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-pink-500" /><span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-pink-200 dark:bg-pink-900/50" /><span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span></div>
          </div>
        </div>

        {/* World Sales */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">World Sales</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Top Selling Countries</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { country: "🇺🇸 United States", pct: 82, value: "$142,580" },
              { country: "🇬🇧 United Kingdom", pct: 65, value: "$98,240" },
              { country: "🇩🇪 Germany", pct: 54, value: "$76,340" },
              { country: "🇯🇵 Japan", pct: 48, value: "$64,120" },
              { country: "🇫🇷 France", pct: 41, value: "$55,890" },
            ].map((row) => (
              <div key={row.country}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{row.country}</span>
                  <span className="text-gray-500 dark:text-gray-400">{row.value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div style={{ width: `${row.pct}%` }} className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
