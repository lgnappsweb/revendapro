"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  PlusCircle,
  MoreHorizontal,
  Settings,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const mainItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Nova Venda", href: "/nova-venda", icon: PlusCircle },
  { title: "Clientes", href: "/clientes", icon: Users },
]

const moreItems = [
  { title: "Produtos", href: "/produtos", icon: Package },
  { title: "Pedidos", href: "/pedidos", icon: ShoppingCart },
  { title: "Financeiro", href: "/financeiro", icon: Receipt },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <nav className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl h-16 flex items-center justify-around px-4">
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-6 w-6", pathname === item.href ? "text-primary" : "text-primary/70")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {item.title}
            </span>
          </Link>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground active:scale-90 transition-all outline-none">
              <div className="h-6 w-6 flex items-center justify-center">
                <Plus className="h-7 w-7 text-primary" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl mb-4 p-2 shadow-xl border-none bg-white/95 backdrop-blur-md">
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 cursor-pointer group"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  )
}
