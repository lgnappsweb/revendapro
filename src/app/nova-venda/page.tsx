"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  CreditCard,
  Banknote,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  CheckCircle2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function NewSalePage() {
  const [items, setItems] = useState<{ id: number, name: string, price: number, qty: number }[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const [discount, setDiscount] = useState(0)
  const total = subtotal - discount

  const handleAddItem = () => {
    // Simulating adding a random item
    const newItem = {
      id: Math.random(),
      name: "Item Selecionado " + (items.length + 1),
      price: 49.90,
      qty: 1
    }
    setItems([...items, newItem])
  }

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(i => i.id !== id))
  }

  const handleFinalize = () => {
    if (items.length === 0) {
      toast({ title: "Carrinho Vazio", description: "Adicione pelo menos um produto.", variant: "destructive" })
      return
    }
    if (!paymentMethod) {
      toast({ title: "Pagamento", description: "Selecione a forma de pagamento.", variant: "destructive" })
      return
    }

    toast({ title: "Venda Registrada!", description: "A venda foi salva com sucesso." })
    router.push('/')
  }

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Nova Venda</h1>
          <p className="text-muted-foreground font-medium">Registre uma nova venda de forma rápida e organizada.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  Informações do Pedido
                </CardTitle>
                <CardDescription>Selecione o cliente e os produtos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-muted-foreground">Cliente</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none shadow-none focus:ring-primary/20">
                      <SelectValue placeholder="Selecione um cliente cadastrado..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1">Maria Silva</SelectItem>
                      <SelectItem value="2">Ana Oliveira</SelectItem>
                      <SelectItem value="3">Juliana Costa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-muted-foreground">Produtos</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddItem}
                      className="rounded-xl font-bold border-primary text-primary hover:bg-primary/5"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Buscar Produto
                    </Button>
                  </div>
                  
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">Nenhum produto adicionado ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border animate-in fade-in slide-in-from-left-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm">{item.name}</h4>
                            <span className="text-xs text-muted-foreground font-medium">R$ {item.price.toFixed(2)} / un</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg bg-muted/30">
                              <button className="px-2 py-1 text-muted-foreground hover:text-primary font-bold">-</button>
                              <span className="px-2 font-bold text-sm">{item.qty}</span>
                              <button className="px-2 py-1 text-muted-foreground hover:text-primary font-bold">+</button>
                            </div>
                            <span className="font-bold text-sm w-20 text-right">R$ {(item.price * item.qty).toFixed(2)}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  Pagamento e Entrega
                </CardTitle>
                <CardDescription>Como e quando a venda será paga.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">Forma de Pagamento</Label>
                    <Select onValueChange={setPaymentMethod}>
                      <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none shadow-none focus:ring-primary/20">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="pix">
                          <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-emerald-500" /> Pix</div>
                        </SelectItem>
                        <SelectItem value="dinheiro">
                          <div className="flex items-center gap-2"><Banknote className="h-4 w-4 text-emerald-500" /> Dinheiro</div>
                        </SelectItem>
                        <SelectItem value="cartao">
                          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-500" /> Cartão Crédito/Débito</div>
                        </SelectItem>
                        <SelectItem value="fiado">
                          <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Fiado / A Prazo</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {paymentMethod === "fiado" && (
                    <div className="space-y-2 animate-in zoom-in-95 duration-200">
                      <Label className="font-bold text-rose-600">Data de Vencimento</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="date" className="h-11 pl-10 rounded-xl bg-rose-50 border-rose-100 shadow-none focus:ring-rose-200" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold text-muted-foreground">Observações Adicionais</Label>
                  <Input placeholder="Ex: Entrega agendada para sábado às 14h" className="rounded-xl h-11 bg-muted/30 border-none shadow-none" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden primary-gradient text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl opacity-90">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-white/80 font-medium">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-white/80 font-medium">
                  <span>Desconto Aplicado</span>
                  <div className="flex items-center gap-2">
                    <button className="h-6 w-6 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center">-</button>
                    <span>R$ {discount.toFixed(2)}</span>
                    <button onClick={() => setDiscount(discount + 5)} className="h-6 w-6 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center">+</button>
                  </div>
                </div>
                <Separator className="bg-white/20" />
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Valor Final</span>
                    <span className="text-4xl font-black">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-white text-primary font-bold rounded-lg border-none animate-pulse">
                      Processando...
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-black/10">
                <Button 
                  onClick={handleFinalize}
                  className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-white/90 text-lg font-bold shadow-xl transition-all active:scale-95 group"
                >
                  Confirmar Venda
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>

            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 border">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Checklist da Venda
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Cliente Selecionado", checked: true },
                  { label: "Produtos Verificados", checked: items.length > 0 },
                  { label: "Forma de Pagamento", checked: !!paymentMethod },
                  { label: "Ponto de Fidelidade", checked: false },
                ].map((check, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center border ${check.checked ? 'bg-emerald-500 border-emerald-500' : 'border-muted'}`}>
                      {check.checked && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <span className={check.checked ? 'text-foreground' : 'text-muted-foreground'}>{check.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
