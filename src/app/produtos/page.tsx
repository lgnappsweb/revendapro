"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Package, 
  Tag, 
  ChevronRight, 
  Filter, 
  Image as ImageIcon,
  MoreVertical,
  Layers,
  Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const mockProducts = [
  { id: 1, name: "Kaiak Aventura", brand: "Natura", category: "Perfume", price: "R$ 149,90", stock: 12, code: "NAT-102", image: PlaceHolderImages[0].imageUrl },
  { id: 2, name: "Creme Renew Ultimate", brand: "Avon", category: "Rosto", price: "R$ 89,90", stock: 5, code: "AVN-554", image: PlaceHolderImages[1].imageUrl },
  { id: 3, name: "Batom Power Stay", brand: "Avon", category: "Maquiagem", price: "R$ 35,00", stock: 24, code: "AVN-012", image: PlaceHolderImages[2].imageUrl },
  { id: 4, name: "Sérum Tododia", brand: "Natura", category: "Corpo", price: "R$ 54,00", stock: 8, code: "NAT-881", image: PlaceHolderImages[3].imageUrl },
]

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "todos" || p.brand.toLowerCase() === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Catálogo de Produtos</h1>
            <p className="text-muted-foreground font-medium">Controle seu estoque e preços de venda.</p>
          </div>
          <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md h-11 px-6">
            <Plus className="mr-2 h-5 w-5" /> Novo Produto
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, marca ou código..." 
              className="h-12 pl-10 rounded-2xl border border-primary/30 shadow-sm bg-white"
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

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image 
                  src={product.image} 
                  alt={product.name}
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
                   <Button variant="secondary" size="icon" className="rounded-full shadow-lg h-9 w-9">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <Badge variant="secondary" className="bg-white/90 text-primary font-bold border-none backdrop-blur-sm">
                    {product.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-col h-full justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                      <Tag className="h-3 w-3" /> COD: {product.code}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-foreground">{product.price}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">Preço Venda</span>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-bold text-muted-foreground block mb-0.5">Estoque</span>
                       <Badge variant="outline" className={`rounded-lg font-bold ${
                         product.stock < 10 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                       }`}>
                         {product.stock} un
                       </Badge>
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full rounded-xl font-bold bg-secondary/50 hover:bg-primary hover:text-white transition-all">
                    Editar Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button 
            variant="outline" 
            className="h-full min-h-[300px] border-2 border-dashed rounded-2xl border-primary/40 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary group transition-all"
          >
            <div className="p-4 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-10 w-10 text-primary/60 group-hover:text-primary" />
            </div>
            <div className="text-center">
              <span className="font-bold text-lg text-muted-foreground group-hover:text-primary block">Adicionar Produto</span>
              <span className="text-sm text-muted-foreground/60 font-medium">Cadastre um novo item no catálogo</span>
            </div>
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  )
}
