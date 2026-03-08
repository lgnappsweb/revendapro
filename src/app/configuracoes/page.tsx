
"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Palette, 
  Moon, 
  Save, 
  Loader2,
  Brush,
  Type,
  Pipette,
  Layout,
  Eye,
  Sparkles
} from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

const COLOR_THEMES = [
  { id: "default", name: "Padrão Rosa", primary: "340 78% 43%", hex: "#C2185B", preview: "bg-[#C2185B]" },
  { id: "ocean", name: "Azul Oceano", primary: "221 83% 53%", hex: "#3B82F6", preview: "bg-[#3B82F6]" },
  { id: "forest", name: "Verde Floresta", primary: "142 76% 36%", hex: "#16A34A", preview: "bg-[#16A34A]" },
  { id: "luxury", name: "Luxo Dourado", primary: "43 74% 49%", hex: "#D4A017", preview: "bg-[#D4A017]" },
  { id: "sunset", name: "Pôr do Sol", primary: "12 80% 50%", hex: "#EA580C", preview: "bg-[#EA580C]" },
]

export default function SettingsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => {
    if (!user) return null
    return doc(db, "settings", "global")
  }, [db, user])
  
  const { data: settings, isLoading } = useDoc(settingsRef)

  const [appName, setAppName] = useState("")
  const [themeId, setThemeId] = useState("default")
  const [customColor, setCustomColor] = useState("#C2185B")
  const [customBgColor, setCustomBgColor] = useState("#FDFBFB")
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName || "RevendaPRO")
      setThemeId(settings.themeId || "default")
      setDarkMode(settings.darkMode || false)
      if (settings.customColor) setCustomColor(settings.customColor)
      if (settings.customBgColor) setCustomBgColor(settings.customBgColor)
    }
  }, [settings])

  const handleSave = async () => {
    if (!settingsRef) return
    setIsSaving(true)
    try {
      await setDoc(settingsRef, {
        appName,
        themeId,
        customColor,
        customBgColor,
        darkMode,
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast({ title: "Configurações Salvas" })
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao salvar" })
    } finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">
              Configurações
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Personalize sua ferramenta de trabalho.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 px-1 pb-20">
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <Type className="h-6 w-6" /> Geral
                </CardTitle>
                <CardDescription className="font-medium">Identidade do seu sistema de gestão.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                  <Label className="font-bold text-muted-foreground ml-1">Nome do Aplicativo</Label>
                  <Input 
                    value={appName} 
                    onChange={(e) => setAppName(e.target.value)} 
                    className="h-12 rounded-xl border-primary/30 text-lg font-medium bg-card mt-2 focus-visible:ring-primary/20" 
                  />
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <Palette className="h-6 w-6" /> Cor Principal
                </CardTitle>
                <CardDescription className="font-medium">Escolha a cor principal da sua marca pessoal.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COLOR_THEMES.map((theme) => (
                    <button 
                      key={theme.id} 
                      onClick={() => setThemeId(theme.id)} 
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${themeId === theme.id ? "border-primary bg-primary/5 shadow-md scale-105" : "border-transparent bg-muted/20 hover:border-primary/30"}`}
                    >
                      <div className={`h-8 w-8 rounded-full shadow-inner ${theme.preview}`} />
                      <span className={`font-bold text-[10px] uppercase tracking-wider ${themeId === theme.id ? "text-primary" : "text-muted-foreground"}`}>{theme.name}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => setThemeId("custom")} 
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${themeId === "custom" ? "border-primary bg-primary/5 shadow-md scale-105" : "border-transparent bg-muted/20 hover:border-primary/30"}`}
                  >
                    <div className="h-8 w-8 rounded-full shadow-inner flex items-center justify-center bg-gradient-to-tr from-rose-400 via-emerald-400 to-blue-400">
                      <Pipette className="h-4 w-4 text-white" />
                    </div>
                    <span className={`font-bold text-[10px] uppercase tracking-wider ${themeId === "custom" ? "text-primary" : "text-muted-foreground"}`}>Personalizada</span>
                  </button>
                </div>

                {themeId === "custom" && (
                  <div className="p-4 bg-muted/30 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                    <Label className="font-black text-[10px] text-muted-foreground uppercase tracking-widest block mb-2 ml-1">Código HEX da Cor</Label>
                    <div className="flex gap-3">
                      <Input 
                        type="color" 
                        value={customColor} 
                        onChange={(e) => setCustomColor(e.target.value)} 
                        className="w-12 h-12 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                      />
                      <Input 
                        value={customColor} 
                        onChange={(e) => setCustomColor(e.target.value)} 
                        className="h-12 rounded-xl border-primary/30 font-bold uppercase" 
                        placeholder="#C2185B"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <Layout className="h-6 w-6" /> Interface
                </CardTitle>
                <CardDescription className="font-medium">Configurações de exibição do aplicativo.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Moon className="h-5 w-5" />
                      <span>Modo Escuro</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Melhora o conforto visual em ambientes escuros.</span>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-bold text-muted-foreground ml-1">Cor de Fundo (Personalizada)</Label>
                  <div className="flex gap-3">
                    <Input 
                      type="color" 
                      value={customBgColor} 
                      onChange={(e) => setCustomBgColor(e.target.value)} 
                      className="w-12 h-12 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                    />
                    <Input 
                      value={customBgColor} 
                      onChange={(e) => setCustomBgColor(e.target.value)} 
                      className="h-12 rounded-xl border-primary/30 font-bold uppercase flex-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <Eye className="h-6 w-6" /> Prévia do App
                </CardTitle>
                <CardDescription className="font-medium">Veja como seu aplicativo ficará no celular.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex justify-center">
                <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[500px] w-[250px] shadow-xl overflow-hidden">
                  <div className="w-[100px] h-[18px] bg-gray-800 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-xl z-20"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                  <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[94px] rounded-r-lg"></div>
                  
                  <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mt-4">
                       <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                       </div>
                       <div className="h-3 w-20 bg-muted rounded-full" />
                    </div>
                    
                    <div className="h-24 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col p-3 gap-2">
                       <div className="h-2 w-10 bg-primary/30 rounded-full" />
                       <div className="h-5 w-24 bg-primary rounded-lg" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <div className="h-16 bg-muted/30 rounded-2xl border border-muted flex flex-col p-3 gap-1">
                          <div className="h-1.5 w-6 bg-muted rounded-full" />
                          <div className="h-3 w-10 bg-muted rounded-md" />
                       </div>
                       <div className="h-16 bg-muted/30 rounded-2xl border border-muted flex flex-col p-3 gap-1">
                          <div className="h-1.5 w-6 bg-muted rounded-full" />
                          <div className="h-3 w-10 bg-muted rounded-md" />
                       </div>
                    </div>
                    
                    <div className="mt-auto h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                       <div className="h-2 w-24 bg-white/40 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6 text-center">
                 <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">Ações</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="w-full h-16 rounded-2xl font-black text-xl primary-gradient shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isSaving ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-6 w-6" />
                      SALVAR ALTERAÇÕES
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
