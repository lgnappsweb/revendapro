
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
  CheckCircle2,
  Package,
  Loader2,
  Tag,
  Zap
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
import { Switch } from "@/components/ui/switch"

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

  const [discount, setDiscount] = useState(0)
  const total = subtotal - discount

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
    toast({
      title: "Produto adicionado",
      description: `${product.name} no carrinho.`
    })
  }

  const toggleItemPriceMode = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, useCost: !item.useCost } : item
    ))
  }

  const toggleAllToCost = (useCost: boolean) => {
    setItems(items.map(item => ({ ...item, useCost })))
    toast({
      title: useCost ? "Preço de Custo Aplicado" : "Preço de Revista Aplicado",
      description: `Todos os itens foram atualizados.`
    })
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
      toast({
        title: "Item removido",
        description: "O produto foi removido do carrinho."
      })
    }
  }

  const handleFinalize = async () => {
    if (!selectedClientId) {
      toast({ title: "Cliente", description: "Selecione um cliente para a venda.", variant: "destructive" })
      return
    }
    if (items.length === 0) {
      toast({ title: "Carrinho Vazio", description: "Adicione pelo menos um produto.", variant: "destructive" })
      return
    }
    if (!paymentMethod) {
      toast({ title: "Pagamento", description: "Selecione a forma de pagamento.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const selectedClient = dbClients?.find(c => c.id === selectedClientId)
      
      const saleData = {
        clientId: selectedClientId,
        clientName: selectedClient?.name || "Cliente Desconhecido",
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.qty,
          unitPrice: item.useCost ? item.costPrice : item.magazinePrice,
          subtotal: (item.useCost ? item.costPrice : item.magazinePrice) * item.qty,
          isResellerPrice: item.useCost
        })),
        total: subtotal,
        discount,
        finalTotal: total,
        paymentMethod,
        paymentStatus: paymentMethod === 'fiado' ? 'Pendente' : 'Pago',
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, "orders"), saleData)
      
      toast({ title: "Venda Registrada!", description: "A venda foi salva com sucesso." })
      router.push('/pedidos')
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Não foi possível salvar a venda.", 
        variant: "destructive" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredProducts = dbProducts?.filter(p => {
    const name = p.name || ""
    const code = p.code || ""
    const brand = p.brand || ""
    
    const matchesSearch = name.toLowerCase().includes(productSearch.toLowerCase()) ||
                         code.toLowerCase().includes(productSearch.toLowerCase())
    
    const matchesBrand = dialogActiveTab === "todos" || brand.toLowerCase() === dialogActiveTab.toLowerCase()
    
    return matchesSearch && matchesBrand
  }) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden">
        <div className="space-y-1 text-center py-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary text-center break-words w-full px-2">Nova Venda</h1>
          <p className="text-muted-foreground font-medium text-lg">Registre uma nova venda de forma rápida e organizada.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 px-1">
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-tight">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  Informações do Pedido
                </CardTitle>
                <CardDescription className="font-medium">Selecione o cliente e os produtos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label className="font-bold text-muted-foreground">Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none shadow-none focus:ring-primary/20">
                      <SelectValue placeholder={loadingClients ? "Carregando clientes..." : "Selecione um cliente..."} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {dbClients?.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                      {dbClients?.length === 0 && (
                        <SelectItem value="none" disabled>Nenhum cliente cadastrado</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-muted-foreground">Produtos no Carrinho</Label>
                    
                    <Dialog open={isProductPickerOpen} onOpenChange={setIsProductPickerOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl font-bold border-primary text-primary hover:bg-primary/5 h-10 px-4"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Buscar Produto
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl border-primary max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-0">
                          <DialogTitle className="text-2xl font-black text-primary uppercase text-center whitespace-nowrap overflow-hidden text-ellipsis">Selecionar Produto</DialogTitle>
                        </DialogHeader>
                        
                        <div className="px-6 py-4 space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Pesquisar por nome ou código..." 
                              className="pl-10 rounded-xl bg-muted/30 border-none"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                            />
                          </div>

                          <Tabs defaultValue="todos" className="w-full" onValueChange={setDialogActiveTab}>
                            <TabsList className="w-full bg-muted/30 rounded-xl h-10 p-1">
                              <TabsTrigger value="todos" className="flex-1 rounded-lg font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Todos</TabsTrigger>
                              <TabsTrigger value="natura" className="flex-1 rounded-lg font-bold text-xs data-[state=active]:bg-[#FF6A13] data-[state=active]:text-white">Natura</TabsTrigger>
                              <TabsTrigger value="avon" className="flex-1 rounded-lg font-bold text-xs data-[state=active]:bg-[#622D91] data-[state=active]:text-white">Avon</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        <ScrollArea className="flex-1 px-6 pb-6">
                          <div className="space-y-2">
                            {loadingProducts ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : filteredProducts.length === 0 ? (
                              <div className="text-center py-10">
                                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm font-medium text-muted-foreground">Nenhum produto encontrado.</p>
                              </div>
                            ) : (
                              filteredProducts.map(product => (
                                <button
                                  key={product.id}
                                  onClick={() => handleAddProductToCart(product)}
                                  className="w-full text-left p-4 rounded-2xl bg-card border border-primary/10 hover:border-primary hover:bg-primary/5 transition-all flex justify-between items-center group"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-foreground group-hover:text-primary">{product.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{product.brand} • {product.category}</span>
                                  </div>
                                  <span className="font-black text-primary">R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">O carrinho está vazio.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex flex-col p-4 bg-card rounded-xl shadow-sm border border-primary/10 animate-in fade-in slide-in-from-left-4 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`rounded-md text-[9px] font-black uppercase px-1.5 py-0.5 ${item.useCost ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                  {item.useCost ? 'Preço Custo' : 'Preço Revista'}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-medium">R$ {(item.useCost ? item.costPrice : item.magazinePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / un</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setItemToRemove(item)}
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-dashed">
                            <div className="flex items-center gap-2">
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 onClick={() => toggleItemPriceMode(item.id)}
                                 className={`h-8 rounded-lg font-bold text-[10px] px-2 uppercase ${item.useCost ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' : 'border-primary/20 text-primary'}`}
                               >
                                 <Tag className="mr-1 h-3 w-3" /> {item.useCost ? 'Usar Revista' : 'Usar Custo'}
                               </Button>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border rounded-lg bg-muted/30 h-8">
                                <button 
                                  onClick={() => updateQty(item.id, -1)}
                                  className="px-3 text-muted-foreground hover:text-primary font-bold h-full"
                                >-</button>
                                <span className="px-2 font-bold text-sm min-w-[24px] text-center">{item.qty}</span>
                                <button 
                                  onClick={() => updateQty(item.id, 1)}
                                  className="px-3 text-muted-foreground hover:text-primary font-bold h-full"
                                >+</button>
                              </div>
                              <span className="font-black text-sm w-20 text-right text-primary">R$ {((item.useCost ? item.costPrice : item.magazinePrice) * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-tight">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  Pagamento e Entrega
                </CardTitle>
                <CardDescription className="font-medium">Como e quando a venda será paga.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-bold text-muted-foreground">Forma de Pagamento</Label>
                    <Select onValueChange={setPaymentMethod} value={paymentMethod}>
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
                        <Input type="date" className="h-11 pl-10 rounded-xl bg-rose-500/10 border-rose-500/20 shadow-none focus:ring-rose-500/20 font-bold" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold text-muted-foreground">Observações Adicionais</Label>
                  <Input placeholder="Ex: Entrega agendada para sábado às 14h" className="rounded-xl h-11 bg-muted/30 border-none shadow-none focus-visible:ring-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-[2.5rem] p-8 shadow-sm space-y-4 border border-primary/10">
              <h4 className="font-black text-foreground flex items-center gap-2 uppercase tracking-tight text-primary">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Checklist da Venda
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Cliente Selecionado", checked: !!selectedClientId },
                  { label: "Produtos no Carrinho", checked: items.length > 0 },
                  { label: "Forma de Pagamento", checked: !!paymentMethod },
                ].map((check, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold">
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${check.checked ? 'bg-emerald-500 border-emerald-500' : 'border-muted'}`}>
                      {check.checked && <CheckCircle2 className="h-3.3 w-3.3 text-white" strokeWidth={4} />}
                    </div>
                    <span className={check.checked ? 'text-foreground' : 'text-muted-foreground'}>{check.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="shadow-lg rounded-[2.5rem] overflow-hidden primary-gradient text-white border-none">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl opacity-90 font-black uppercase tracking-tight">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-8 pt-0">
                <div className="flex justify-between items-center text-white/80 font-bold">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center text-white/80 font-bold py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-black opacity-80 uppercase tracking-widest flex items-center gap-1.5">Preço de Custo <Zap className="h-3 w-3 fill-yellow-400 text-yellow-400" /></span>
                    <span className="text-[10px] opacity-70 font-black uppercase tracking-widest">Usar valor da revendedora</span>
                  </div>
                  <Switch 
                    checked={items.length > 0 && items.every(i => i.useCost)}
                    onCheckedChange={toggleAllToCost}
                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white/20"
                  />
                </div>

                <div className="flex justify-between items-center text-white/80 font-bold">
                  <span>Desconto</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setDiscount(Math.max(0, discount - 1))}
                      className="h-6 w-6 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center font-black"
                    >-</button>
                    <span className="min-w-[60px] text-center">R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <button 
                      onClick={() => setDiscount(discount + 1)}
                      className="h-6 w-6 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center font-black"
                    >+</button>
                  </div>
                </div>
                <Separator className="bg-white/20" />
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-black opacity-80 uppercase tracking-widest">Valor Final</span>
                    <span className="text-4xl font-black">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-black/10">
                <Button 
                  onClick={handleFinalize}
                  disabled={isSubmitting || items.length === 0}
                  className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 text-lg font-bold shadow-xl transition-all active:scale-95 group"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <>
                      Finalizar Venda
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent className="rounded-3xl border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-primary">Remover do Carrinho?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-lg">
              Deseja remover <b className="text-foreground">{itemToRemove?.name}</b> do seu pedido?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} className="rounded-xl font-bold bg-rose-600">
              Confirmar Remoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutWrapper>
  )
}
