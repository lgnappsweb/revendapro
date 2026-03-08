
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
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
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, serverTimestamp, addDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"

const PRODUCT_CATEGORIES = [
  "Perfumaria",
  "Maquiagem",
  "Rosto",
  "Corpo",
  "Cabelos",
  "Cuidados Diários",
  "Desodorantes",
  "Sabonetes",
  "Infantil",
  "Masculino",
  "Moda e Casa",
  "Promoções",
  "Kits e Presentes"
]

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const db = useFirestore()
  const { toast } = useToast()

  const productsRef = useMemoFirebase(() => collection(db, "products"), [db])
  const { data: products, isLoading } = useCollection(productsRef)

  const [formData, setFormData] = useState({
    name: "",
    brand: "Natura",
    category: "",
    price: "",
    cost: "",
    code: "",
    description: ""
  })

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
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome, categoria e o preço da revista.",
        variant: "destructive"
      })
      return
    }

    const parseCurrencyToNumber = (val: string) => {
      if (!val) return 0;
      return parseFloat(val.replace(/\./g, '').replace(',', '.'));
    }

    const newProduct = {
      ...formData,
      price: parseCurrencyToNumber(formData.price),
      cost: formData.cost ? parseCurrencyToNumber(formData.cost) : 0,
      image: "", // We are no longer using images
      createdAt: serverTimestamp()
    }

    addDoc(productsRef, newProduct)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: productsRef.path,
          operation: 'create',
          requestResourceData: newProduct,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
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
    const nameStr = p.name || "";
    const codeStr = p.code || "";
    const brandStr = p.brand || "";
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         codeStr.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "todos" || brandStr.toLowerCase() === activeTab
    return matchesSearch && matchesTab
  }) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="space-y-2 w-full text-center flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-primary text-center lg:whitespace-nowrap">
              Catálogo de Produtos
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Controle seu estoque e preços de venda.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg">
                <Plus className="mr-2 h-6 w-6" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-2xl border-primary max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <div className="p-8 pb-4 border-b">
                <DialogHeader>
                  <DialogTitle className="text-4xl font-black text-primary text-center uppercase tracking-tight">Cadastrar Produto</DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground text-center text-xl mt-1">
                    Adicione um novo item ao seu catálogo de revenda.
                  </DialogDescription>
                </DialogHeader>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#FDFBFB]">
                <div className="grid gap-6 pb-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="font-bold text-muted-foreground text-base">Nome do Produto</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Kaiak Aventura" 
                      className="rounded-xl border-primary/30 h-11 bg-white" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="brand" className="font-bold text-muted-foreground text-base">Marca</Label>
                      <Select value={formData.brand} onValueChange={(v) => setFormData({...formData, brand: v})}>
                        <SelectTrigger className="rounded-xl border-primary/30 h-11 bg-white">
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
                      <Label htmlFor="category" className="font-bold text-muted-foreground text-base">Categoria</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                        <SelectTrigger className="rounded-xl border-primary/30 h-11 bg-white">
                          <SelectValue placeholder="Selecione categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="font-bold text-muted-foreground text-base">Preço da revista (R$)</Label>
                      <Input 
                        id="price" 
                        value={formData.price}
                        onChange={(e) => handlePriceChange(e, 'price')}
                        placeholder="0,00" 
                        className="rounded-xl border-primary/30 h-11 bg-white" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost" className="font-bold text-muted-foreground text-base">Preço da revendedora (R$)</Label>
                      <Input 
                        id="cost" 
                        value={formData.cost}
                        onChange={(e) => handlePriceChange(e, 'cost')}
                        placeholder="0,00" 
                        className="rounded-xl border-primary/30 h-11 bg-white" 
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="code" className="font-bold text-muted-foreground text-base">Código / Referência</Label>
                    <Input 
                      id="code" 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="Ex: NAT-123" 
                      className="rounded-xl border-primary/30 h-11 bg-white" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-bold text-muted-foreground text-base">Descrição (Opcional)</Label>
                    <Textarea 
                      id="description" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detalhes sobre o produto..." 
                      className="rounded-xl border-primary/30 min-h-[120px] bg-white" 
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveProduct} className="w-full rounded-xl font-bold h-14 text-lg primary-gradient shadow-lg">
                      Salvar Produto
                    </Button>
                  </div>
                </div>
              </div>
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
              <Card key={product.id} className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border-primary bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full gap-4">
                    <div className="flex justify-between items-start">
                      <Badge className={`rounded-lg font-bold py-1 border-none ${
                        product.brand === 'Natura' ? 'bg-[#FF6A13] text-white' : 'bg-[#622D91] text-white'
                      }`}>
                        {product.brand}
                      </Badge>
                      <Badge variant="secondary" className="bg-pink-50 text-primary font-bold border-none">
                        {product.category || "Geral"}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        <Tag className="h-3 w-3" /> COD: {product.code || "S/ REF"}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t pt-4 border-primary/10">
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

                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="secondary" className="flex-1 rounded-xl font-bold bg-secondary/50 hover:bg-primary hover:text-white transition-all">
                        Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 shrink-0">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
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
