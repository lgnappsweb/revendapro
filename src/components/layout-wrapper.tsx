
"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/firebase"
import { AppSidebar } from "./app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Search, Bell, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPage = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    if (!isUserLoading && !user && !isPublicPage) {
      router.push("/login")
    }
  }, [user, isUserLoading, isPublicPage, router])

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && !isPublicPage) {
    return null
  }

  if (isPublicPage) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div className="relative hidden w-full max-w-sm md:flex">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar clientes, produtos ou vendas..." 
                className="h-10 w-[300px] pl-10 bg-white/50 border-none shadow-sm focus-visible:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
            </Button>
            <div className="h-8 w-px bg-border mx-1" />
            <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-white/50 p-1 rounded-full transition-colors">
              <div className="hidden flex-col items-end text-right md:flex">
                <span className="text-sm font-semibold leading-none">{user?.displayName || "Administradora"}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Administradora</span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary/10">
                <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/user/100/100"} />
                <AvatarFallback className="bg-primary text-white">
                  {user?.displayName?.substring(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
