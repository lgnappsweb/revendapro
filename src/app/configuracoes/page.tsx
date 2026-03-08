
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
  Smartphone, 
  Moon, 
  Sun, 
  Check, 
  Save, 
  Loader2,
  Brush,
  Type,
  Pipette,
  Layout
} from "lucide-react"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"
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
  const db = useFirestore()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => doc(db, "settings", "global"), [db])
  const { data: settings, isLoading } = useDoc(settingsRef)

  const [appName, setAppName] = useState("")
  const [themeId, setThemeId] = useState("default")
  const [customColor, setCustomColor] = useState("#C2185B")
  const [customBgColor, setCustomBgColor] = useState("#FDFBFB")
  const [darkMode, setDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName || "RevendaPro")
      setThemeId(settings.themeId || "default")
      setDarkMode(settings.darkMode || false)
      if (settings.customColor) setCustomColor(settings.customColor)
      if (settings.customBgColor) setCustomBgColor(settings.customBgColor)
    }
  }, [settings])

  const handleSave = async () => {
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

  const getPreviewColor = () => {
    if (themeId === "custom") return customColor
    const theme = COLOR_THEMES.find(t => t.id === themeId)
    return theme ? theme.hex : COLOR_THEMES[0].hex
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
            <p className="text-muted-foreground font-medium text-lg">Personalize cada detalhe da sua ferramenta de trabalho.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 px-1 pb-20">
          <div className="space-y-8">
            {/* Seção Geral */}
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Type className="h-6 w-6" /> Geral
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appName" className="font-bold text-muted-foreground ml-1">Nome do Aplicativo</Label>
                  <Input 
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Ex: RevendaPro"
                    className="h-12 rounded-xl border-primary/30 text-lg font-medium bg-card"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção de Cores Principal */}
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Palette className="h-6 w-6" /> Cor Principal
                </CardTitle>
                <CardDescription className="font-medium">Define a cor dos botões e ícones principais.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="font-bold text-muted-foreground ml-1 flex items-center gap-2">
                    Temas Padrão
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setThemeId(theme.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          themeId === theme.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-transparent bg-muted/20 hover:border-primary/30"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-full shadow-inner ${theme.preview}`} />
                        <span className={`font-bold text-[10px] uppercase tracking-wider ${themeId === theme.id ? "text-primary" : "text-muted-foreground"}`}>
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="font-bold text-muted-foreground ml-1 flex items-center gap-2">
                    <Pipette className="h-4 w-4" /> Customizar Cor Principal
                  </Label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-primary/10">
                    <div 
                      className="h-12 w-12 rounded-xl shadow-inner border border-black/10 flex items-center justify-center overflow-hidden shrink-0" 
                      style={{ backgroundColor: customColor }}
                    >
                       <input 
                         type="color" 
                         value={customColor}
                         onChange={(e) => {
                           setCustomColor(e.target.value)
                           setThemeId("custom")
                         }}
                         className="w-20 h-20 shrink-0 cursor-pointer border-none p-0 bg-transparent"
                       />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input 
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value)
                          setThemeId("custom")
                        }}
                        className="h-10 rounded-lg border-primary/20 font-mono text-center bg-card"
                        placeholder="#HEXCODE"
                      />
                      <p className="text-[10px] text-muted-foreground font-bold uppercase text-center">Código Hexadecimal</p>
                    </div>
                    <Button 
                      variant={themeId === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setThemeId("custom")}
                      className="rounded-lg font-bold"
                    >
                      {themeId === 'custom' ? <Check className="h-4 w-4" /> : "Usar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção de Cor de Fundo */}
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Layout className="h-6 w-6" /> Ambiente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="h-6 w-6 text-primary" /> : <Sun className="h-6 w-6 text-amber-500" />}
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">Modo Noturno</span>
                      <span className="text-xs text-muted-foreground font-medium">Ideal para uso à noite</span>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-muted-foreground ml-1 flex items-center gap-2">
                    <Brush className="h-4 w-4" /> Cor de Fundo do Aplicativo
                  </Label>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-primary/10">
                    <div 
                      className="h-12 w-12 rounded-xl shadow-inner border border-black/10 flex items-center justify-center overflow-hidden shrink-0" 
                      style={{ backgroundColor: customBgColor }}
                    >
                       <input 
                         type="color" 
                         value={customBgColor}
                         onChange={(e) => setCustomBgColor(e.target.value)}
                         className="w-20 h-20 shrink-0 cursor-pointer border-none p-0 bg-transparent"
                       />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input 
                        value={customBgColor}
                        onChange={(e) => setCustomBgColor(e.target.value)}
                        className="h-10 rounded-lg border-primary/20 font-mono text-center bg-card"
                      />
                      <p className="text-[10px] text-muted-foreground font-bold uppercase text-center">Fundo das Páginas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden sticky top-8">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Smartphone className="h-6 w-6" /> Pré-visualização
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex flex-col items-center">
                <div 
                  className={`w-full max-w-[280px] rounded-[3rem] border-8 border-slate-800 shadow-2xl p-4 overflow-hidden aspect-[9/16] relative transition-colors duration-500`}
                  style={{ backgroundColor: darkMode ? '#0f172a' : customBgColor }}
                >
                  <div className="mt-6 space-y-6">
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-black tracking-tighter" style={{ color: getPreviewColor() }}>
                        {appName || "RevendaPro"}
                      </h4>
                      <div className="h-1 w-10 mx-auto rounded-full" style={{ backgroundColor: getPreviewColor() }} />
                    </div>

                    <div className={`p-4 rounded-2xl shadow-sm border ${darkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-black/5'}`}>
                      <div className={`h-3 w-2/3 rounded-full mb-3 ${darkMode ? 'bg-white/20' : 'bg-slate-100'}`} />
                      <div className={`h-2 w-full rounded-full mb-1 ${darkMode ? 'bg-white/10' : 'bg-slate-50'}`} />
                      <div className={`h-2 w-4/5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-slate-50'}`} />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 h-10 rounded-xl bg-muted/20" />
                      <div className="flex-1 h-10 rounded-xl" style={{ backgroundColor: getPreviewColor() }} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4">
                       <div className="aspect-square rounded-2xl bg-muted/10 border border-black/5" />
                       <div className="aspect-square rounded-2xl bg-muted/10 border border-black/5" />
                    </div>
                  </div>
                </div>

                <div className="w-full mt-10">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full h-16 rounded-2xl font-black text-xl primary-gradient shadow-xl"
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-2 h-6 w-6" /> Salvar Configurações</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
