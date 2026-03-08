
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
  }

  const toggleItemPriceMode = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, useCost: !item.useCost } : item))
  }

  const toggleAllToCost = (useCost: boolean) => {
    setItems(items.map(item => ({ ...item, useCost })))
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
    if (!selectedClientId || items.length === 0 || !paymentMethod) {
      toast({ title: "Atenção", description: "Verifique os dados da venda.", variant: "destructive" })
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
    } catch (error) { toast({ title: "Erro", variant: "destructive" }) }
    finally { setIsSubmitting(false) }
  }

  const filteredProducts = dbProducts?.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) || (p.code || "").toLowerCase().includes(productSearch.toLowerCase())
    const matchesBrand = dialogActiveTab === "todos" || (p.brand || "").toLowerCase() === dialogActiveTab.toLowerCase()
    return matchesSearch && matchesBrand
  }) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">Nova Venda</h1>
            <p className="text-muted-foreground font-medium text-lg">Registre um novo pedido.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 px-1">
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <ShoppingCart className="h-6 w-6" /> Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label className="font-bold text-muted-foreground">Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {dbClients?.map(client => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-muted-foreground">Produtos</Label>
                  <Button variant="outline" size="sm" onClick={() => setIsProductPickerOpen(true)} className="rounded-xl font-bold border-primary text-primary">Buscar</Button>
                </div>
                {items.length > 0 && (
                   <div className="space-y-2">
                      {items.map(item => (
                         <div key={item.id} className="p-3 bg-card rounded-xl border border-primary/10 flex justify-between items-center">
                            <span className="font-bold text-sm truncate max-w-[150px]">{item.name}</span>
                            <span className="font-black text-primary">R$ {(item.useCost ? item.costPrice : item.magazinePrice).toLocaleString('pt-BR')}</span>
                         </div>
                      ))}
                   </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg rounded-[2.5rem] overflow-hidden primary-gradient text-white border-none">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Total</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="text-4xl font-black">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <Button onClick={handleFinalize} disabled={isSubmitting || items.length === 0} className="w-full h-16 rounded-2xl bg-white text-primary mt-6 text-lg font-bold">Finalizar</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={isProductPickerOpen} onOpenChange={setIsProductPickerOpen}>
         <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl p-0 overflow-hidden">
            <div className="p-6 bg-card border-b"><DialogTitle className="text-xl font-black text-primary uppercase text-center">Selecionar</DialogTitle></div>
            <ScrollArea className="max-h-[60vh] p-6">
               <div className="grid gap-2">
                  {filteredProducts.map(p => (
                     <button key={p.id} onClick={() => handleAddProductToCart(p)} className="p-4 rounded-xl border border-primary/10 text-left hover:bg-primary/5">
                        <span className="font-bold block">{p.name}</span>
                        <span className="text-xs text-primary font-black">R$ {Number(p.price).toLocaleString('pt-BR')}</span>
                     </button>
                  ))}
               </div>
            </ScrollArea>
         </DialogContent>
      </Dialog>
    </LayoutWrapper>
  )
}
