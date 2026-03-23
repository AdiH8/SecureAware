import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import { uiCopy } from "@/content/bg";
import { Role } from "@/lib/types";

interface AppShellProps {
  role: Role;
  name: string;
  children: React.ReactNode;
}

function linksForRole(role: Role): Array<{ href: string; label: string }> {
  if (role === "EMPLOYEE") {
    return [
      { href: "/employee/home", label: uiCopy.nav.employeeHome },
    ];
  }
  if (role === "MANAGER") {
    return [
      { href: "/manager/dashboard", label: uiCopy.nav.managerDashboard },
      { href: "/manager/department/dept_sales", label: uiCopy.nav.managerSales },
      { href: "/manager/department/dept_finance", label: uiCopy.nav.managerFinance },
    ];
  }
  return [
    { href: "/admin/content", label: uiCopy.nav.adminContent },
    { href: "/manager/dashboard", label: uiCopy.nav.managerView },
  ];
}

function labelForRole(role: Role) {
  if (role === "EMPLOYEE") return "Служител";
  if (role === "MANAGER") return "Мениджър";
  return "Администратор";
}

export function AppShell({ role, name, children }: AppShellProps) {
  const links = linksForRole(role);
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-auto w-[152px]" />
            <div>
              <p className="text-sm text-[var(--brand)]">{labelForRole(role)}</p>
              <p className="font-semibold">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                className="rounded-full border border-transparent px-3 py-1.5 text-sm font-medium hover:border-[var(--line)]"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
