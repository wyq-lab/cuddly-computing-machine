"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "学习看板", icon: "□" },
  { href: "/kaodian", label: "考点背诵", icon: "▣" },
  { href: "/shuati", label: "刷题练习", icon: "✎" },
  { href: "/cuoti", label: "错题本", icon: "✗" },
  { href: "/ai", label: "AI助手", icon: "◈" },
];

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card flex-shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/" className="text-lg font-bold text-primary">
            教资过了吗
          </Link>
          <p className="text-xs text-muted-foreground mt-1">高中信息技术</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card flex justify-around py-2 z-50">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded",
              pathname === item.href
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
