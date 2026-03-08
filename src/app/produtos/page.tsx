
"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Loader2,
  PackageSearch,
  ShoppingBag,
  Pencil
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, serverTimestamp, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  
  const db = useFirestore()
  const { toast } = useToast()

  const productsRef = useMemoFirebase(() => collection(db, "products"), [db])
  const { data: products, isLoading: isLoadingProducts } = useCollection(productsRef)

  const categoriesRef = useMemoFirebase(() => query(collection(db, "categories"), orderBy("name", "asc")), [db])
  const { data: categories } = useCollection(categoriesRef)

  const [formData, setFormData] = useState({
    name: "", brand: "Natura", category: "", price: "", cost: "", code: "", description: ""
  })

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const amount = parseInt(digits, 10) / 100;
    return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    setSelectedProduct(null)
    setTimeout(() => setIsDialogOpen(true), 100)
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" })
      return
    }
    setIsSaving(true)
    const parseCurrencyToNumber = (val: string) => val ? parseFloat(val.replace(/\./g, '').replace(',', '.')) : 0;
    const productData = { 
      ...formData, 
      price: parseCurrencyToNumber(formData.price), 
      cost: formData.cost ? parseCurrencyToNumber(formData.cost) : 0, 
      updatedAt: serverTimestamp() 
    }

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
      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">
              Produtos
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Catálogo e gestão de estoque.</p>
          </div>
          <Button onClick={handleOpenNewProduct} className="w-full max-w-md rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg">
            <Plus className="mr-2 h-6 w-6" /> Novo Produto
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full px-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou código..." 
              className="h-12 pl-10 rounded-2xl border border-primary/30 bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs defaultValue="todos" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="h-12 p-1.5 bg-card shadow-sm border border-primary/30 rounded-2xl w-full">
              <TabsTrigger value="todos" className="flex-1 rounded-xl font-bold">Todos</TabsTrigger>
              <TabsTrigger value="natura" className="flex-1 rounded-xl font-bold">Natura</TabsTrigger>
              <TabsTrigger value="avon" className="flex-1 rounded-xl font-bold">Avon</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="w-full overflow-x-hidden px-1">
          {isLoadingProducts ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-dashed border-primary/30">
              <PackageSearch className="h-16 w-16 text-primary/20 mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-10">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-primary/20 shadow-sm hover:border-primary transition-all">
                  <CardHeader className="bg-primary/5 border-b p-4">
                     <div className="flex justify-between items-center gap-2">
                        <Badge className={`rounded-lg font-bold py-1 border-none ${product.brand === 'Natura' ? 'bg-[#FF6A13]' : 'bg-[#622D91]'}`}>{product.brand}</Badge>
                        <Badge variant="secondary" className="bg-pink-50 text-primary border-none text-[10px] truncate">{product.category || "Geral"}</Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase">COD: {product.code || "S/ REF"}</div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 border-primary/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Venda</span>
                        <span className="text-lg font-black text-foreground">R$ {Number(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)} className="rounded-full h-9 w-9 hover:bg-primary/10 group-hover:text-primary"><ChevronRight className="h-5 w-5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl border-primary overflow-hidden p-0 flex flex-col max-h-[90vh]">
          {selectedProduct && (
            <>
              <div className="p-8 border-b bg-card">
                <DialogHeader className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-3xl">
                      <ShoppingBag className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <DialogTitle className="text-2xl font-black text-center text-primary leading-tight">
                    {selectedProduct.name}
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-2xl border border-primary/10 shadow-sm flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Preço Revista</span>
                    <span className="text-xl font-black text-primary">R$ {Number(selectedProduct.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="bg-card p-4 rounded-2xl border border-primary/10 shadow-sm flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Preço Custo</span>
                    <span className="text-xl font-black text-emerald-600">R$ {Number(selectedProduct.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-primary/5 min-h-[80px]">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedProduct.description || "Sem descrição."}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-card border-t flex gap-2">
                 <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-primary text-primary" onClick={() => handleEditProduct(selectedProduct)}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                 </Button>
                 <Button onClick={() => setSelectedProduct(null)} className="flex-1 h-14 rounded-2xl font-bold primary-gradient shadow-lg">Fechar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl border-primary max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-8 border-b bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary text-center uppercase tracking-tight">
                {editingProductId ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-background">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label className="font-bold text-muted-foreground">Nome</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Kaiak Aventura 100ml" className="rounded-xl border-primary/30 h-11 bg-card" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-muted-foreground">Marca</Label>
                  <Select value={formData.brand} onValueChange={v => setFormData({...formData, brand: v})}>
                    <SelectTrigger className="rounded-xl border-primary/30 h-11 bg-card"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Natura">Natura</SelectItem>
                      <SelectItem value="Avon">Avon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-muted-foreground">Categoria</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger className="rounded-xl border-primary/30 h-11 bg-card"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categories?.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-muted-foreground">Preço Revista</Label>
                  <Input value={formData.price} onChange={e => handlePriceChange(e, 'price')} className="rounded-xl border-primary/30 h-11 bg-card" />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-muted-foreground">Preço Custo</Label>
                  <Input value={formData.cost} onChange={e => handlePriceChange(e, 'cost')} className="rounded-xl border-primary/30 h-11 bg-card" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-muted-foreground">Descrição</Label>
                <Textarea 
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})} 
                   placeholder="Detalhes do produto..."
                   className="rounded-xl border-primary/30 min-h-[100px] bg-card"
                />
              </div>
              <Button onClick={handleSaveProduct} disabled={isSaving} className="w-full rounded-xl font-bold h-14 text-lg primary-gradient shadow-lg">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </LayoutWrapper>
  )
}
