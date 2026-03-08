
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { useAuth } from "@/firebase"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  LogOut,
  Sparkles,
  PlusCircle
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Clientes", href: "/clientes", icon: Users },
  { title: "Produtos", href: "/produtos", icon: Package },
  { title: "Pedidos", href: "/pedidos", icon: ShoppingCart },
  { title: "Financeiro", href: "/financeiro", icon: Receipt },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const auth = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao sair:", error)
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl primary-gradient text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold tracking-tight text-primary">RevendaPro</span>
            <span className="text-xs font-medium text-muted-foreground">Gestão Consultora</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="opacity-50" />
      <SidebarContent className="px-2 pt-4">
        <SidebarMenu>
          <SidebarMenuItem className="mb-2">
            <SidebarMenuButton 
              asChild
              size="lg" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-md transition-all active:scale-95 rounded-xl px-4"
            >
              <Link href="/nova-venda">
                <PlusCircle className="h-5 w-5" />
                <span className="font-semibold group-data-[collapsible=icon]:hidden">Nova Venda</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <div className="h-2" />

          {mainNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
                className={`rounded-xl transition-all ${
                  pathname === item.href 
                  ? "bg-secondary text-primary font-semibold" 
                  : "hover:bg-secondary/50 text-muted-foreground hover:text-primary"
                }`}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
