
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
  PlusCircle,
  Plus,
  Settings,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mainItems = [
  { title: "Início", href: "/", icon: LayoutDashboard },
  { title: "Nova Venda", href: "/nova-venda", icon: PlusCircle },
  { title: "Clientes", href: "/clientes", icon: Users },
]

const moreItems = [
  { title: "Categorias", href: "/categorias", icon: Layers },
  { title: "Produtos", href: "/produtos", icon: Package },
  { title: "Pedidos", href: "/pedidos", icon: ShoppingCart },
  { title: "Financeiro", href: "/financeiro", icon: Receipt },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full">
      <nav className="bg-card/95 backdrop-blur-lg border-t border-primary/20 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-[2.5rem] h-20 flex items-center justify-around px-4 pb-2">
        {mainItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all active:scale-90 flex-1",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-6 w-6", pathname === item.href ? "text-primary" : "text-primary/70")} />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {item.title}
            </span>
          </Link>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground active:scale-90 transition-all outline-none flex-1">
              <div className="h-6 w-6 flex items-center justify-center">
                <Plus className="h-7 w-7 text-primary" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={15}
            className="w-64 rounded-3xl mb-2 p-3 shadow-2xl border-2 border-primary/20 bg-card/98 backdrop-blur-xl animate-in slide-in-from-bottom-5"
          >
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer group mb-1 last:mb-0 transition-colors",
                    pathname === item.href ? "bg-primary text-white" : "hover:bg-primary/10"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-primary")} />
                  <span className={cn(
                    "font-black text-sm uppercase tracking-tight",
                    pathname === item.href ? "text-white" : "text-foreground group-hover:text-primary"
                  )}>
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
