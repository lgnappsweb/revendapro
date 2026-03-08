"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { AppSidebar } from "./app-sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPage = pathname === "/login" || pathname === "/register"

  // Real-time listener for user profile to support multi-device synchronization
  const userDocRef = useMemoFirebase(() => {
    if (!user) return null
    return doc(db, "users", user.uid)
  }, [user, db])

  const { data: userProfile } = useDoc(userDocRef)

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
        <div className="w-full flex justify-center max-w-md">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset className="bg-transparent">
        <main className="p-4 md:p-6 lg:p-8 flex justify-center pb-24 md:pb-8">
          <div className="w-full max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
      <MobileBottomNav />
    </div>
  )
}
