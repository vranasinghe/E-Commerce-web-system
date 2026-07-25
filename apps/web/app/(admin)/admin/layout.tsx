import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { AdminThemeProvider } from "@/components/AdminThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/marketing", label: "Marketing", icon: Tag },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return (
      <AdminThemeProvider>
        <main className="min-h-screen bg-[#f7f8fc] dark:bg-gray-950">{children}</main>
      </AdminThemeProvider>
    );
  }

  return (
    <AdminThemeProvider>
      <div className="flex min-h-screen bg-[#f7f8fc] dark:bg-gray-950 text-neutral-900 dark:text-gray-100 antialiased font-sans transition-colors duration-300">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col justify-between shadow-sm transition-colors duration-300">
          <div>
            {/* Logo */}
            <p className="mb-6 px-2 text-lg font-bold">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">AURA</span>{" "}
              <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">Admin</span>
            </p>

            {/* Nav links */}
            <nav className="space-y-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-150"
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="mt-auto space-y-3">
            {/* Theme toggle */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <ThemeToggle />
            </div>

            {/* User profile */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 px-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider bg-pink-50 dark:bg-pink-500/10 px-2 py-0.5 rounded self-start mb-1">
                  {session.role}
                </span>
                <span
                  className="text-sm font-semibold text-neutral-700 dark:text-gray-200 truncate"
                  title={session.name || ""}
                >
                  {session.name || "Store Staff"}
                </span>
                <span
                  className="text-xs text-neutral-400 dark:text-gray-500 truncate mb-3"
                  title={session.email}
                >
                  {session.email}
                </span>

                <form
                  action={async () => {
                    "use server";
                    await logoutAction();
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5 py-1.5 transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </AdminThemeProvider>
  );
}
