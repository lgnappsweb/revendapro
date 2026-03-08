
"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  CheckCircle2,
  Package,
  Loader2,
  Tag,
  Zap,
  Minus,
  Percent,
  TrendingUp,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CartItem {
  id: string
  name: string
  magazinePrice: number
  costPrice: number
  useCost: boolean
  qty: number
}

export default function NewSalePage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [productSearch, setProductSearch] = useState("")
  const [dialogActiveTab, setDialogActiveTab] = useState("todos")
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null)
  const [discount, setDiscount] = useState(0)
  const [showProfit, setShowProfit] = useState(true)
  
  const { toast } = useToast()
  const router = useRouter()
  const db = useFirestore()

  const productsRef = useMemoFirebase(() => collection(db, "products"), [db])
  const clientsRef = useMemoFirebase(() => collection(db, "clients"), [db])
  
  const { data: dbProducts, isLoading: loadingProducts } = useCollection(productsRef)
  const { data: dbClients, isLoading: loadingClients } = useCollection(clientsRef)

  const subtotal = items.reduce((acc, item) => {
    const price = item.useCost ? item.costPrice : item.magazinePrice
    return acc + (price * item.qty)
  }, 0)

  const total = Math.max(0, subtotal - discount)
  
  const totalCost = items.reduce((acc, item) => acc + (item.costPrice * item.qty), 0)
  const profit = Math.max(0, total - totalCost)

  const handleAddProductToCart = (product: any) => {
    const existingItem = items.find(i => i.id === product.id)
    if (existingItem) {
      setItems(items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setItems([...items, { 
        id: product.id, 
        name: product.name, 
        magazinePrice: Number(product.price || 0), 
        costPrice: Number(product.cost || 0),
        useCost: false,
        qty: 1 
      }])
    }
    setIsProductPickerOpen(false)
    toast({ title: "Produto adicionado", description: product.name })
  }

  const toggleItemPriceMode = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, useCost: !item.useCost } : item))
  }

  const updateQty = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta)
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      setItems(items.filter(i => i.id !== itemToRemove.id))
      setItemToRemove(null)
    }
  }

  const handleFinalize = async () => {
    if (!selectedClientId) {
      toast({ title: "Selecione um cliente", variant: "destructive" })
      return
    }
    if (items.length === 0) {
      toast({ title: "Adicione produtos ao pedido", variant: "destructive" })
      return
    }
    if (!paymentMethod) {
      toast({ title: "Selecione o método de pagamento", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const selectedClient = dbClients?.find(c => c.id === selectedClientId)
      const saleData = {
        clientId: selectedClientId,
        clientName: selectedClient?.name || "Cliente",
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.qty,
          unitPrice: item.useCost ? item.costPrice : item.magazinePrice,
          subtotal: (item.useCost ? item.costPrice : item.magazinePrice) * item.qty,
        })),
        total: subtotal,
        discount,
        finalTotal: total,
        paymentMethod,
        paymentStatus: paymentMethod === 'fiado' ? 'Pendente' : 'Pago',
        createdAt: serverTimestamp()
      }
      await addDoc(collection(db, "orders"), saleData)
      toast({ title: "Venda Registrada!" })
      router.push('/pedidos')
    } catch (error) { 
      toast({ title: "Erro ao salvar", variant: "destructive" }) 
    }
    finally { setIsSubmitting(false) }
  }

  const filteredProducts = dbProducts?.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) || (p.code || "").toLowerCase().includes(productSearch.toLowerCase())
    const matchesBrand = dialogActiveTab === "todos" || (p.brand || "").toLowerCase() === dialogActiveTab.toLowerCase()
    return matchesSearch && matchesBrand
  }) || []

  const totalItemsCount = items.reduce((acc, item) => acc + item.qty, 0)
  const selectedClientName = dbClients?.find(c => c.id === selectedClientId)?.name || "cliente não selecionado"

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-2 items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase">Nova Venda</h1>
          <p className="text-muted-foreground font-medium text-lg">Registre um novo pedido para seus clientes.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 px-1 pb-20">
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <ShoppingCart className="h-6 w-6" /> Dados do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label className="font-bold text-muted-foreground text-base">Selecione o Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none text-base font-medium">
                      <SelectValue placeholder="Escolha um cliente..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {dbClients?.map(client => (
                        <SelectItem key={client.id} value={client.id} className="font-medium">{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Label className="font-bold text-muted-foreground text-base">Produtos no Carrinho</Label>
                  <Button 
                    onClick={() => setIsProductPickerOpen(true)} 
                    className="w-full sm:w-auto rounded-xl font-bold border-primary text-primary h-12 px-6"
                    variant="outline"
                  >
                    <Plus className="h-5 w-5 mr-2" /> Buscar Produtos
                  </Button>
                </div>

                <Separator className="bg-primary/10" />

                {items.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed border-primary/10 rounded-3xl">
                    <Package className="h-12 w-12 text-primary/20" />
                    <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Carrinho vazio</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="p-4 bg-card rounded-2xl border border-primary/10 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-lg truncate leading-tight">{item.name}</span>
                            <div className="flex items-center gap-2 mt-1">
                               <button 
                                 onClick={() => toggleItemPriceMode(item.id)}
                                 className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md transition-colors ${item.useCost ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}
                               >
                                 {item.useCost ? 'PREÇO CUSTO' : 'PREÇO REVISTA'}
                               </button>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-rose-500 hover:bg-rose-50"
                            onClick={() => setItemToRemove(item)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQty(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                            <span className="w-10 text-center font-black text-sm">{item.qty}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQty(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                          </div>
                          <span className="font-black text-xl text-primary">
                            R$ {((item.useCost ? item.costPrice : item.magazinePrice) * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <CreditCard className="h-6 w-6" /> Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {[
                     { id: 'pix', label: 'PIX', icon: Smartphone, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                     { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                     { id: 'cartao', label: 'Cartão', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
                     { id: 'fiado', label: 'Fiado', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                   ].map(method => (
                     <button
                       key={method.id}
                       onClick={() => setPaymentMethod(method.id)}
                       className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/20 hover:bg-muted/30'}`}
                     >
                        <method.icon className={`h-6 w-6 ${method.color}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                     </button>
                   ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20 bg-primary/5 border-dashed">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-primary uppercase tracking-tight">Check-in do Pedido</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {items.length === 0 
                      ? "Aguardando adição de produtos para confirmar os dados da venda." 
                      : `Você está registrando um pedido de ${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'itens'} para ${selectedClientId ? selectedClientName : 'o cliente selecionado'}.`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg rounded-[2.5rem] overflow-hidden primary-gradient text-white border-none sticky top-24">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center opacity-80 font-bold">
                    <span className="text-sm">Subtotal</span>
                    <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="opacity-80 font-bold text-sm">Desconto</span>
                    </div>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm text-primary">R$</span>
                      <Input 
                        type="number" 
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="h-10 pl-10 rounded-xl bg-white/20 border-none text-white font-black placeholder:text-white/50 text-right focus-visible:ring-white/30" 
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 text-emerald-300" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Lucro Consultora</span>
                    </div>
                    <Switch 
                      checked={showProfit} 
                      onCheckedChange={setShowProfit}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  {showProfit && (
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2">
                         <Zap className="h-4 w-4 text-emerald-300" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Ganhos Reais</span>
                      </div>
                      <span className="font-black text-emerald-300 text-lg">
                        + R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 mt-6">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Final (Cliente)</span>
                  <div className="text-5xl font-black tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <Button 
                  onClick={handleFinalize} 
                  disabled={isSubmitting || items.length === 0} 
                  className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 mt-4 text-xl font-black uppercase tracking-tight shadow-xl active:scale-95 transition-all"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Finalizar Venda"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={isProductPickerOpen} onOpenChange={setIsProductPickerOpen}>
         <DialogContent className="sm:max-w-[550px] w-[95vw] rounded-[2rem] p-0 overflow-hidden border-primary">
            <div className="p-6 bg-card border-b flex flex-col gap-4">
                <DialogTitle className="text-xl font-black text-primary uppercase text-center tracking-tight">Selecionar Produtos</DialogTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Nome ou código do produto..." 
                    className="h-12 pl-10 rounded-xl bg-muted/30 border-none font-medium"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <Tabs value={dialogActiveTab} onValueChange={setDialogActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 h-10 bg-muted/30 rounded-xl p-1">
                    <TabsTrigger value="todos" className="rounded-lg font-bold text-xs uppercase">Todos</TabsTrigger>
                    <TabsTrigger value="natura" className="rounded-lg font-bold text-xs uppercase">Natura</TabsTrigger>
                    <TabsTrigger value="avon" className="rounded-lg font-bold text-xs uppercase">Avon</TabsTrigger>
                  </TabsList>
                </Tabs>
            </div>
            <ScrollArea className="max-h-[60vh] p-4">
               {filteredProducts.length === 0 ? (
                 <div className="py-20 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Nenhum produto encontrado</div>
               ) : (
                 <div className="grid gap-2">
                    {filteredProducts.map(p => (
                       <button 
                         key={p.id} 
                         onClick={() => handleAddProductToCart(p)} 
                         className="p-4 rounded-2xl border border-primary/10 text-left hover:bg-primary/5 transition-all flex justify-between items-center group"
                       >
                          <div className="flex flex-col min-w-0 pr-4">
                            <span className="font-bold text-base group-hover:text-primary truncate">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{p.brand} | {p.category}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-lg font-black text-primary block">R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="text-[9px] text-muted-foreground font-bold">Custo: R$ {Number(p.cost).toLocaleString('pt-BR')}</span>
                          </div>
                       </button>
                    ))}
                 </div>
               )}
            </ScrollArea>
         </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent className="rounded-3xl border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-primary uppercase">Remover Item?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-muted-foreground">
              Deseja remover <b>{itemToRemove?.name}</b> do carrinho?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutWrapper>
  )
}
