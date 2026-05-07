"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Etusivu" },
  { href: "/laskuri", label: "Laskuri" },
  { href: "/tarjoukset", label: "Tarjoukset" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 no-print">
      <div className="glass">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-foreground tracking-tight">
            MaalariPro <span className="text-muted font-normal">Lite</span>
          </Link>
          <ul className="flex items-center gap-1">
            {items.map((it) => {
              const active =
                it.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={cn(
                      "inline-flex items-center h-9 px-3 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-white"
                        : "text-foreground hover:bg-surface-subtle"
                    )}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
