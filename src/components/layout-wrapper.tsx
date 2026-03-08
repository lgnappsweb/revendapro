
"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/firebase"
import { AppSidebar } from "./app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full flex justify-center">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <SidebarTrigger className="bg-white shadow-md rounded-full h-10 w-10 flex items-center justify-center" />
        </div>
        <main className="p-4 md:p-6 lg:p-8 flex justify-center">
          <div className="w-full max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}
