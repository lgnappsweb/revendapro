
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { AppSidebar } from "./app-sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { SidebarInset } from "@/components/ui/sidebar"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const COLOR_THEMES = {
  default: "340 78% 43%",
  ocean: "221 83% 53%",
  forest: "142 76% 36%",
  luxury: "43 74% 49%",
  sunset: "12 80% 50%",
}

function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const pathname = usePathname()
  const [isRepairing, setIsRepairing] = useState(false)

  const isPublicPage = pathname === "/login" || pathname === "/register"

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null
    return doc(db, "users", user.uid)
  }, [user, db])

  const adminDocRef = useMemoFirebase(() => {
    if (!user) return null
    return doc(db, "admins", user.uid)
  }, [user, db])

  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db])
  const { data: settings } = useDoc(settingsRef)

  const { data: adminRecord, isLoading: isAdminLoading } = useDoc(adminDocRef)

  useEffect(() => {
    if (!isUserLoading && !user && !isPublicPage) {
      router.push("/login")
      return
    }

    if (user && !isUserLoading && !isAdminLoading && !adminRecord && !isPublicPage && !isRepairing) {
      setIsRepairing(true)
      const adminRef = doc(db, "admins", user.uid)
      setDoc(adminRef, {
        id: user.uid,
        createdAt: new Date().toISOString()
      }).then(() => {
        setIsRepairing(false)
      }).catch(err => {
        console.error("Admin repair failed:", err)
        setIsRepairing(false)
      })
    }
  }, [user, isUserLoading, isAdminLoading, adminRecord, isPublicPage, router, db, isRepairing])

  // Apply Theme and Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    if (settings) {
      // Apply primary color
      let primaryColorValue = COLOR_THEMES.default;
      const themeId = settings.themeId || "default";

      if (themeId === "custom" && settings.customColor) {
        primaryColorValue = hexToHsl(settings.customColor);
      } else {
        primaryColorValue = COLOR_THEMES[themeId as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;
      }
      
      root.style.setProperty('--primary', primaryColorValue);

      // Apply background color if not in dark mode
      if (settings.customBgColor && !settings.darkMode) {
        root.style.setProperty('--background', hexToHsl(settings.customBgColor));
      } else if (!settings.darkMode) {
        root.style.setProperty('--background', "340 20% 95%"); // Default HSL background
      }
      
      // Apply dark mode
      if (settings.darkMode) {
        root.classList.add('dark');
        root.style.setProperty('--background', "222.2 84% 4.9%"); // Shadcn dark background
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings])

  if (isUserLoading || (user && isAdminLoading && !adminRecord && !isPublicPage)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground animate-pulse">Verificando credenciais...</p>
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
    <div className="flex min-h-screen bg-background transition-colors duration-500 overflow-x-hidden">
      <div className="hidden md:block shrink-0">
        <AppSidebar />
      </div>
      <SidebarInset className="bg-transparent flex-1 w-full overflow-x-hidden">
        <main className="p-2 sm:p-4 md:p-6 lg:p-8 flex justify-center pb-24 md:pb-8 w-full">
          <div className="w-full max-w-[95vw] md:max-w-[1600px] relative border-2 border-primary rounded-[2rem] sm:rounded-[3rem] bg-white dark:bg-slate-900 shadow-sm p-3 sm:p-6 md:p-10 min-h-[calc(100vh-4rem)] flex flex-col gap-6 overflow-hidden">
            {pathname !== "/" && (
              <div className="flex items-start shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="rounded-xl border-primary text-primary bg-white dark:bg-slate-800 hover:bg-primary/5 font-bold h-10 px-4 shadow-sm transition-all active:scale-95"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            )}
            <div className="flex-1 w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
      <MobileBottomNav />
    </div>
  )
}
