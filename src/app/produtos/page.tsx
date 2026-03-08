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
  PackageSearch
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase"
import { collection, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const db = useFirestore()
  const { toast } = useToast()

  // Firestore setup
  const productsRef = useMemoFirebase(() => collection(db, "products"), [db])
  const { data: products, isLoading } = useCollection(productsRef)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "Natura",
    category: "",
    price: "",
    cost: "",
    code: "",
    description: ""
  })

  // Helper to format currency string (e.g., 1234 -> 12,34)
  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const amount = parseInt(digits, 10) / 100;
    return amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'price' | 'cost') => {
    const formatted = formatCurrencyInput(e.target.value);
    setFormData({ ...formData, [field]: formatted });
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e o preço da revista.",
        variant: "destructive"
      })
      return
    }

    // Helper to parse currency string back to number for Firestore
    const parseCurrencyToNumber = (val: string) => {
      if (!val) return 0;
      // Remove dots and replace comma with dot
      return parseFloat(val.replace(/\./g, '').replace(',', '.'));
    }

    const newProduct = {
      ...formData,
      price: parseCurrencyToNumber(formData.price),
      cost: formData.cost ? parseCurrencyToNumber(formData.cost) : 0,
      image: PlaceHolderImages[Math.floor(Math.random() * (PlaceHolderImages?.length || 1))]?.imageUrl || "",
      createdAt: serverTimestamp()
    }

    addDocumentNonBlocking(productsRef, newProduct)
    
    toast({
      title: "Produto Salvo!",
      description: `${formData.name} foi adicionado ao catálogo.`
    })
    
    setIsDialogOpen(false)
    setFormData({
      name: "",
      brand: "Natura",
      category: "",
      price: "",
      cost: "",
      code: "",
      description: ""
    })
  }

  const filteredProducts = products?.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (p.code || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "todos" || (p.brand || "").toLowerCase() === activeTab
    return matchesSearch && matchesTab
  }) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Catálogo de Produtos</h1>
            <p className="text-muted-foreground font-medium">Controle seu estoque e preços de venda.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md h-11 px-6">
                <Plus className="mr-2 h-5 w-5" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl border-primary">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">Cadastrar Produto</DialogTitle>
                <DialogDescription className="font-medium">Adicione um novo item ao seu catálogo de revenda.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-bold">Nome do Produto</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Kaiak Aventura" 
                    className="rounded-xl border-primary/30" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="brand" className="font-bold">Marca</Label>
                    <Select value={formData.brand} onValueChange={(v) => setFormData({...formData, brand: v})}>
                      <SelectTrigger className="rounded-xl border-primary/30">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Natura">Natura</SelectItem>
                        <SelectItem value="Avon">Avon</SelectItem>
                        <SelectItem value="Outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="font-bold">Categoria</Label>
                    <Input 
                      id="category" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Ex: Perfumaria" 
                      className="rounded-xl border-primary/30" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price" className="font-bold">Preço da revista(R$)</Label>
                    <Input 
                      id="price" 
                      value={formData.price}
                      onChange={(e) => handlePriceChange(e, 'price')}
                      placeholder="0,00" 
                      className="rounded-xl border-primary/30" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost" className="font-bold">Preço da revendedora(R$)</Label>
                    <Input 
                      id="cost" 
                      value={formData.cost}
                      onChange={(e) => handlePriceChange(e, 'cost')}
                      placeholder="0,00" 
                      className="rounded-xl border-primary/30" 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code" className="font-bold">Código / Referência</Label>
                  <Input 
                    id="code" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Ex: NAT-123" 
                    className="rounded-xl border-primary/30" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="font-bold">Descrição (Opcional)</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detalhes sobre o produto..." 
                    className="rounded-xl border-primary/30 min-h-[100px]" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveProduct} className="w-full rounded-xl font-bold h-12 text-lg">
                  Salvar Produto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou código..." 
              className="h-12 pl-10 rounded-2xl border-primary/30 shadow-sm bg-white focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs defaultValue="todos" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="h-12 p-1.5 bg-white shadow-sm border border-primary/30 rounded-2xl w-full">
              <TabsTrigger value="todos" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Todos</TabsTrigger>
              <TabsTrigger value="natura" className="rounded-xl font-bold data-[state=active]:bg-[#FF6A13] data-[state=active]:text-white transition-all">Natura</TabsTrigger>
              <TabsTrigger value="avon" className="rounded-xl font-bold data-[state=active]:bg-[#622D91] data-[state=active]:text-white transition-all">Avon</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="font-bold text-muted-foreground">Carregando catálogo...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-primary/30">
            <PackageSearch className="h-16 w-16 text-primary/20 mb-4" />
            <h3 className="text-xl font-bold text-foreground">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground font-medium max-w-xs mt-2">
              Comece adicionando novos produtos ao seu catálogo para gerenciar suas vendas.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-xl border-primary text-primary font-bold hover:bg-primary/5"
              onClick={() => setIsDialogOpen(true)}
            >
              Adicionar Primeiro Produto
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-primary">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image 
                    src={product.image || PlaceHolderImages[0]?.imageUrl || ""} 
                    alt={product.name || "Produto"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge className={`rounded-lg font-bold shadow-md py-1 border-none ${
                      product.brand === 'Natura' ? 'bg-[#FF6A13] text-white' : 'bg-[#622D91] text-white'
                    }`}>
                      {product.brand}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-9 w-9 border-none">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <Badge variant="secondary" className="bg-white/90 text-primary font-bold border-none backdrop-blur-sm">
                      {product.category || "Geral"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                        <Tag className="h-3 w-3" /> COD: {product.code || "S/ REF"}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-foreground">
                          R$ {Number(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">Preço Venda</span>
                      </div>
                      <div className="text-right">
                         <span className="text-xs font-bold text-muted-foreground block mb-0.5">Rentabilidade</span>
                         <Badge variant="outline" className="rounded-lg font-bold border-emerald-200 bg-emerald-50 text-emerald-700">
                           {product.cost ? Math.round(((Number(product.price) - Number(product.cost)) / Number(product.price)) * 100) : 100}%
                         </Badge>
                      </div>
                    </div>

                    <Button variant="secondary" className="w-full rounded-xl font-bold bg-secondary/50 hover:bg-primary hover:text-white transition-all">
                      Ver Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  )
}
