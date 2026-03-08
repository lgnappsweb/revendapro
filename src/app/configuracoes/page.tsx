
"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  Palette, 
  Smartphone, 
  Moon, 
  Sun, 
  Check, 
  Save, 
  Loader2,
  Brush,
  Type
} from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

const COLOR_THEMES = [
  { id: "default", name: "Padrão Rosa", primary: "340 78% 43%", preview: "bg-[#C2185B]" },
  { id: "ocean", name: "Azul Oceano", primary: "221 83% 53%", preview: "bg-[#3B82F6]" },
  { id: "forest", name: "Verde Floresta", primary: "142 76% 36%", preview: "bg-[#16A34A]" },
  { id: "luxury", name: "Luxo Dourado", primary: "43 74% 49%", preview: "bg-[#D4A017]" },
  { id: "sunset", name: "Pôr do Sol", primary: "12 80% 50%", preview: "bg-[#EA580C]" },
]

export default function SettingsPage() {
  const db = useFirestore()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db])
  const { data: settings, isLoading } = useDoc(settingsRef)

  const [appName, setAppName] = useState("")
  const [themeId, setThemeId] = useState("default")
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName || "RevendaPro")
      setThemeId(settings.themeId || "default")
      setDarkMode(settings.darkMode || false)
    }
  }, [settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await setDoc(settingsRef, {
        appName,
        themeId,
        darkMode,
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      toast({
        title: "Configurações Salvas",
        description: "Suas preferências foram aplicadas com sucesso."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível atualizar as configurações."
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-10 pt-12 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary uppercase">
              Configurações
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Personalize a identidade visual e o comportamento do seu app.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 px-1 pb-20">
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-primary/20 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Type className="h-6 w-6" /> Geral
                </CardTitle>
                <CardDescription className="font-medium">Identidade básica do seu aplicativo.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appName" className="font-bold text-muted-foreground ml-1">Nome do Aplicativo</Label>
                  <Input 
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Ex: RevendaPro"
                    className="h-12 rounded-xl border-primary/30 text-lg font-medium"
                  />
                  <p className="text-xs text-muted-foreground font-medium ml-1">Este nome será exibido na barra lateral e no título do app.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-primary/20 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Palette className="h-6 w-6" /> Aparência
                </CardTitle>
                <CardDescription className="font-medium">Escolha as cores e o modo de exibição.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-2xl border border-primary/10">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-amber-500" />}
                      <span className="font-bold">Modo Escuro</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Melhora a leitura em ambientes escuros.</span>
                  </div>
                  <Switch 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-muted-foreground ml-1 flex items-center gap-2">
                    <Brush className="h-4 w-4" /> Cor Principal do Sistema
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setThemeId(theme.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                          themeId === theme.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-transparent bg-white hover:border-primary/30"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-full shadow-inner ${theme.preview}`} />
                        <span className={`font-bold text-sm ${themeId === theme.id ? "text-primary" : "text-foreground"}`}>
                          {theme.name}
                        </span>
                        {themeId === theme.id && <Check className="ml-auto h-5 w-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-primary/20 bg-white shadow-sm overflow-hidden sticky top-8">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Smartphone className="h-6 w-6" /> Visualização em Tempo Real
                </CardTitle>
                <CardDescription className="font-medium">Veja como suas alterações estão ficando.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center">
                <div className={`w-full max-w-sm rounded-[3rem] border-8 border-slate-800 shadow-2xl p-4 overflow-hidden aspect-[9/16] relative ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                  {/* Status Bar */}
                  <div className="flex justify-between px-6 py-2">
                    <span className={`text-[10px] font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className={`h-2 w-2 rounded-full ${darkMode ? 'bg-white' : 'bg-slate-900'}`} />
                      <div className={`h-2 w-2 rounded-full ${darkMode ? 'bg-white/50' : 'bg-slate-400'}`} />
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="mt-8 space-y-6">
                    <div className="text-center space-y-2">
                      <h4 className={`text-2xl font-black tracking-tighter ${themeId === 'ocean' ? 'text-[#3B82F6]' : themeId === 'forest' ? 'text-[#16A34A]' : themeId === 'luxury' ? 'text-[#D4A017]' : themeId === 'sunset' ? 'text-[#EA580C]' : 'text-primary'}`}>
                        {appName || "RevendaPro"}
                      </h4>
                      <div className={`h-1 w-12 mx-auto rounded-full ${themeId === 'ocean' ? 'bg-[#3B82F6]' : themeId === 'forest' ? 'bg-[#16A34A]' : themeId === 'luxury' ? 'bg-[#D4A017]' : themeId === 'sunset' ? 'bg-[#EA580C]' : 'bg-primary'}`} />
                    </div>

                    <div className={`p-4 rounded-2xl shadow-sm border ${darkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                      <div className={`h-3 w-2/3 rounded-full mb-3 ${darkMode ? 'bg-white/20' : 'bg-slate-100'}`} />
                      <div className={`h-2 w-full rounded-full mb-2 ${darkMode ? 'bg-white/10' : 'bg-slate-50'}`} />
                      <div className={`h-2 w-1/2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-slate-50'}`} />
                    </div>

                    <div className={`p-5 rounded-2xl text-center font-bold text-white shadow-lg ${themeId === 'ocean' ? 'bg-[#3B82F6]' : themeId === 'forest' ? 'bg-[#16A34A]' : themeId === 'luxury' ? 'bg-[#D4A017]' : themeId === 'sunset' ? 'bg-[#EA580C]' : 'bg-primary'}`}>
                      Botão de Exemplo
                    </div>
                  </div>
                </div>

                <div className="w-full mt-10">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full h-16 rounded-2xl font-black text-xl primary-gradient shadow-xl active:scale-95 transition-all"
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-2 h-6 w-6" /> Aplicar Configurações</>}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground font-medium mt-4">
                    Ao clicar em aplicar, as mudanças serão salvas para todos os seus dispositivos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
