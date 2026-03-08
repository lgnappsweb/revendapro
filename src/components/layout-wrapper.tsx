
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
import { cn } from "@/lib/utils"

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

  useEffect(() => {
    const root = document.documentElement;
    if (settings) {
      let primaryColorValue = COLOR_THEMES.default;
      const themeId = settings.themeId || "default";

      if (themeId === "custom" && settings.customColor) {
        primaryColorValue = hexToHsl(settings.customColor);
      } else {
        primaryColorValue = COLOR_THEMES[themeId as keyof typeof COLOR_THEMES] || COLOR_THEMES.default;
      }
      
      root.style.setProperty('--primary', primaryColorValue);

      if (settings.darkMode) {
        root.classList.add('dark');
        root.style.removeProperty('--background');
      } else {
        root.classList.remove('dark');
        if (settings.customBgColor) {
          root.style.setProperty('--background', hexToHsl(settings.customBgColor));
        } else {
          root.style.setProperty('--background', "340 20% 95%");
        }
      }
    }
  }, [settings])

  if (isUserLoading || (user && isAdminLoading && !adminRecord && !isPublicPage)) {
    return (
      <div className="flex h-svh w-screen flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-black text-muted-foreground animate-pulse uppercase tracking-widest text-xs">RevendaPro</p>
      </div>
    )
  }

  if (!user && !isPublicPage) return null

  if (isPublicPage) {
    return (
      <div className="min-h-svh bg-background flex items-center justify-center p-4">
        <div className="w-full flex justify-center max-w-md">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-svh w-screen bg-background transition-colors duration-500 overflow-hidden max-w-full">
      <div className="hidden md:block shrink-0 h-full">
        <AppSidebar />
      </div>
      <SidebarInset className="relative flex-1 w-full flex flex-col h-svh max-h-svh overflow-hidden bg-transparent max-w-full">
        {pathname !== "/" && (
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 pointer-events-none">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="rounded-xl border-primary text-primary bg-card/80 backdrop-blur-md hover:bg-primary/5 font-bold h-12 px-6 shadow-xl transition-all active:scale-95 shrink-0 text-base border-2 pointer-events-auto"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar ao Início
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto w-full pb-24 md:pb-0 scroll-smooth max-w-full overflow-x-hidden min-h-0">
          <div className="w-full relative border-l-2 border-primary/20 dark:border-primary/40 bg-card dark:bg-card min-h-full max-w-full overflow-x-hidden">
            <div className={cn("w-full p-4 sm:p-8 md:p-12 max-w-full overflow-x-hidden pt-24 sm:pt-28")}>
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </div>
  )
}
