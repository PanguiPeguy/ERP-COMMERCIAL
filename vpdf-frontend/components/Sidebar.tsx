"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Package, ShoppingCart,
  Truck, Leaf, BarChart3
} from "lucide-react";

const nav = [
  { href: "/",            icon: LayoutDashboard, label: "Dashboard"   },
  { href: "/clients",     icon: Users,            label: "Clients"     },
  { href: "/articles",    icon: Package,          label: "Articles"    },
  { href: "/commandes",   icon: ShoppingCart,     label: "Commandes"   },
  { href: "/livraisons",  icon: Truck,            label: "Livraisons"  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-gray-900 text-white flex flex-col z-10">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">VPDF ERP</p>
          <p className="text-xs text-gray-400">VentesPleinDeFoin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-green-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Apache Cassandra 4</p>
        <p className="text-xs text-gray-500">Spring Boot 3 + Next.js 14</p>
      </div>
    </aside>
  );
}