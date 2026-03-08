"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useAuth } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: "Verifique seu e-mail e senha e tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F6F0F2]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl primary-gradient text-white shadow-xl mb-4">
            <Sparkles className="h-12 w-12" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-primary">RevendaPro</h1>
          <p className="text-muted-foreground font-medium">Gestão profissional para consultoras.</p>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6 pt-8 text-center">
            <CardTitle className="text-2xl font-bold">Bem-vinda de volta!</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Acesse sua conta para gerenciar suas vendas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-muted-foreground">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  required 
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-none focus-visible:ring-primary/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-bold text-muted-foreground">Senha</Label>
                  <Button variant="link" className="px-0 font-bold text-primary h-auto">Esqueceu?</Button>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    required 
                    className="h-12 rounded-xl bg-muted/30 border-none shadow-none focus-visible:ring-primary/20 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl font-bold text-lg primary-gradient shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar agora"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8 border-t bg-muted/10 pt-6">
            <p className="text-sm font-medium text-muted-foreground text-center">
              Ainda não tem uma conta?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Cadastre-se como administradora
              </Link>
            </p>
            <div className="pt-2 border-t border-primary/5 w-full flex justify-center">
              <p className="text-[10px] font-black text-muted-foreground/60 text-center uppercase tracking-widest whitespace-nowrap">
                Desenvolvedor: <span className="text-primary/70">Lucas Gregório do Nascimento</span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
