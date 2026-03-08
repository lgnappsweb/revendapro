"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Tag, 
  ChevronRight, 
  MoreVertical,
  Loader2,
  PackageSearch,
  DollarSign,
  Info,
  Layers,
  ShoppingBag,
  Pencil,
  Trash2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, serverTimestamp, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

const PRODUCT_CATEGORIES = [
  "Perfumaria", "Maquiagem", "Rosto", "Corpo", "Cabelos", "Cuidados Diários",
  "Desodorantes", "Sabonetes", "Infantil", "Masculino", "Moda e Casa",
  "Promoções", "Kits e Presentes"
]

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  
  const db = useFirestore()
  const { toast } = useToast()

  const productsRef = useMemoFirebase(() => collection(db, "products"), [db])
  const { data: products, isLoading } = useCollection(productsRef)

  const [formData, setFormData] = useState({
    name: "", brand: "Natura", category: "", price: "", cost: "", code: "", description: ""
  })

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const amount = parseInt(digits, 10) / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'price' | 'cost') => {
    const formatted = formatCurrencyInput(e.target.value);
    setFormData({ ...formData, [field]: formatted });
  }

  const handleOpenNewProduct = () => {
    setEditingProductId(null)
    setFormData({ name: "", brand: "Natura", category: "", price: "", cost: "", code: "", description: "" })
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id)
    setFormData({
      name: product.name || "",
      brand: product.brand || "Natura",
      category: product.category || "",
      price: product.price ? Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "",
      cost: product.cost ? Number(product.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "",
      code: product.code || "",
      description: product.description || ""
    })
    setTimeout(() => setIsDialogOpen(true), 100)
  }

  const handleDeleteConfirm = () => {
    if (!productToDelete) return
    const docRef = doc(db, "products", productToDelete.id)
    deleteDoc(docRef)
      .then(() => toast({ title: "Produto removido" }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })))
    setProductToDelete(null)
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ title: "Campos obrigatórios", variant: "destructive" })
      return
    }
    setIsSaving(true)
    const parseCurrencyToNumber = (val: string) => val ? parseFloat(val.replace(/\./g, '').replace(',', '.')) : 0;
    const productData = { ...formData, price: parseCurrencyToNumber(formData.price), cost: formData.cost ? parseCurrencyToNumber(formData.cost) : 0, updatedAt: serverTimestamp() }

    if (editingProductId) {
      const docRef = doc(db, "products", editingProductId)
      updateDoc(docRef, productData).then(() => { toast({ title: "Atualizado!" }); setIsDialogOpen(false); }).finally(() => setIsSaving(false))
    } else {
      addDoc(productsRef, { ...productData, createdAt: serverTimestamp() }).then(() => { toast({ title: "Salvo!" }); setIsDialogOpen(false); }).finally(() => setIsSaving(false))
    }
  }

  const filteredProducts = products?.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "todos" || (p.brand || "").toLowerCase() === activeTab
    return matchesSearch && matchesTab
  }) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-2 w-full text-center flex flex-col items-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary text-center break-words w-full px-2">
              Produtos
            </h1>
            <p className="text-muted-foreground font-medium text-base sm:text-lg text-center">Gestão de estoque e catálogo.</p>
          </div>
          <Button onClick={handleOpenNewProduct} className="w-full rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg">
            <Plus className="mr-2 h-6 w-6" /> Novo Produto
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou código..." 
              className="h-12 pl-10 rounded-2xl border-primary/30 shadow-sm bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs defaultValue="todos" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="h-12 p-1.5 bg-white shadow-sm border border-primary/30 rounded-2xl w-full">
              <TabsTrigger value="todos" className="flex-1 rounded-xl font-bold transition-all">Todos</TabsTrigger>
              <TabsTrigger value="natura" className="flex-1 rounded-xl font-bold transition-all">Natura</TabsTrigger>
              <TabsTrigger value="avon" className="flex-1 rounded-xl font-bold transition-all">Avon</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="w-full overflow-x-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-primary/30">
              <PackageSearch className="h-16 w-16 text-primary/20 mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-10 w-full">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden rounded-2xl shadow-sm border-primary bg-white w-full">
                  <CardContent className="p-4 flex flex-col h-full gap-4">
                    <div className="flex justify-between items-start">
                      <Badge className={`rounded-lg font-bold py-1 border-none ${product.brand === 'Natura' ? 'bg-[#FF6A13] text-white' : 'bg-[#622D91] text-white'}`}>{product.brand}</Badge>
                      <Badge variant="secondary" className="bg-pink-50 text-primary font-bold border-none truncate max-w-[100px]">{product.category || "Geral"}</Badge>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase truncate">COD: {product.code || "S/ REF"}</div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 border-primary/10">
                      <span className="text-xl font-black text-foreground">R$ {Number(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)} className="rounded-full h-8 w-8"><ChevronRight className="h-5 w-5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Rest of the dialogs/popups... */}
    </LayoutWrapper>
  )
}
