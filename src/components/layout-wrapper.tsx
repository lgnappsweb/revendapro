
"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { AppSidebar } from "./app-sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { SidebarInset } from "@/components/ui/sidebar"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPage = pathname === "/login" || pathname === "/register"

  // Real-time listener for user profile
  const userDocRef = useMemoFirebase(() => {
    if (!user) return null
    return doc(db, "users", user.uid)
  }, [user, db])

  const { data: userProfile } = useDoc(userDocRef)

  // Auth redirection and Admin Auto-Repair logic
  useEffect(() => {
    if (!isUserLoading && !user && !isPublicPage) {
      router.push("/login")
      return
    }

    // Auto-repair: If user is authenticated but lacks admin record, create it.
    // This fixes "Missing or insufficient permissions" for existing users.
    if (user && !isUserLoading && !isPublicPage) {
      const adminRef = doc(db, "admins", user.uid)
      getDoc(adminRef).then((snap) => {
        if (!snap.exists()) {
          setDoc(adminRef, {
            id: user.uid,
            createdAt: new Date().toISOString()
          })
        }
      }).catch(err => console.warn("Admin check skipped:", err))
    }
  }, [user, isUserLoading, isPublicPage, router, db])

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
          <div className="w-full max-w-7xl relative">
            {pathname !== "/" && (
              <div className="h-20 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="fixed top-6 left-4 md:left-[18rem] z-50 rounded-xl border-primary text-primary bg-white/80 backdrop-blur-md hover:bg-primary/5 font-bold h-10 px-4 shadow-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>
            )}
            {children}
          </div>
        </main>
      </SidebarInset>
      <MobileBottomNav />
    </div>
  )
}
