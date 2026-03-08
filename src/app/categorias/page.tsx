
"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Layers, 
  MoreVertical,
  Loader2,
  Trash2,
  Pencil,
  Tag,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, serverTimestamp, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"

const SUGGESTED_CATEGORIES = [
  "Perfumaria Feminina",
  "Perfumaria Masculina",
  "Perfumaria Infantil",
  "Maquiagem (Rosto)",
  "Maquiagem (Olhos)",
  "Maquiagem (Boca)",
  "Esmaltes e Unhas",
  "Cuidados com o Rosto",
  "Hidratação Facial",
  "Antisinais (Chronos/Renew)",
  "Cuidados com o Corpo",
  "Hidratação Corporal",
  "Óleos Corporais",
  "Banho e Sabonetes",
  "Sabonetes em Barra",
  "Sabonetes Líquidos",
  "Cabelos (Shampoo/Cond)",
  "Cabelos (Tratamento)",
  "Desodorantes",
  "Proteção Solar",
  "Infantil (Mamãe e Bebê)",
  "Linha Masculina / Barba",
  "Presentes e Kits",
  "Acessórios e Pincéis",
  "Necessaires e Bolsas",
  "Crer para Ver (Papelaria)",
  "Casa e Estilo",
  "Suplementos e Bem-estar",
  "Linha Ekos",
  "Linha Tododia",
  "Linha Una",
  "Linha Faces",
  "Linha Renew",
  "Linha Color Trend",
  "Linha Avon Care",
  "Cremes para Mãos",
  "Cuidados para os Pés"
]

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [accordionValue, setAccordionValue] = useState<string>("")
  
  const db = useFirestore()
  const { toast } = useToast()

  const categoriesRef = useMemoFirebase(() => query(collection(db, "categories"), orderBy("name", "asc")), [db])
  const { data: categories, isLoading } = useCollection(categoriesRef)

  const [formData, setFormData] = useState({ name: "" })

  const handleOpenNewCategory = () => {
    setEditingCategoryId(null)
    setFormData({ name: "" })
    setAccordionValue("")
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.id)
    setFormData({ name: category.name || "" })
    setAccordionValue("")
    setTimeout(() => setIsDialogOpen(true), 150)
  }

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return
    const docRef = doc(db, "categories", categoryToDelete.id)
    deleteDoc(docRef)
      .then(() => toast({ title: "Categoria removida" }))
      .catch(async () => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })))
    setCategoryToDelete(null)
  }

  const handleSaveCategory = () => {
    if (!formData.name) {
      toast({ title: "Nome da categoria é obrigatório", variant: "destructive" })
      return
    }
    setIsSaving(true)
    const categoryData = { name: formData.name, updatedAt: serverTimestamp() }

    if (editingCategoryId) {
      const docRef = doc(db, "categories", editingCategoryId)
      updateDoc(docRef, categoryData)
        .then(() => { 
          toast({ title: "Categoria atualizada!" }); 
          setIsDialogOpen(false); 
        })
        .finally(() => setIsSaving(false))
    } else {
      addDoc(collection(db, "categories"), { ...categoryData, createdAt: serverTimestamp() })
        .then(() => { 
          toast({ title: "Categoria salva!" }); 
          setIsDialogOpen(false); 
        })
        .finally(() => setIsSaving(false))
    }
  }

  const filteredCategories = categories?.filter(c => 
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-10 pt-16 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary text-center break-words w-full px-2 uppercase">
              Categorias
            </h1>
            <p className="text-muted-foreground font-medium text-lg text-center">Organize seus produtos por categorias personalizadas.</p>
          </div>
          <Button onClick={handleOpenNewCategory} className="w-full max-w-md rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg">
            <Plus className="mr-2 h-6 w-6" /> Nova Categoria
          </Button>
        </div>

        <div className="relative w-full px-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar categoria..." 
            className="h-14 pl-12 rounded-2xl border border-primary/30 shadow-sm bg-card text-base focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full overflow-x-hidden px-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <Layers className="h-6 w-6" /> Suas Categorias
                </CardTitle>
                <CardDescription className="font-medium">Gerencie as categorias para organizar seu estoque.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <Layers className="h-16 w-16 text-primary/20 mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhuma categoria encontrada.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 pb-10 w-full">
                    {filteredCategories.map((category) => (
                      <Card key={category.id} className="group overflow-hidden rounded-3xl border-primary/20 w-full shadow-sm hover:border-primary transition-all">
                        <CardContent className="p-6 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            <div className="p-3 bg-primary/5 rounded-2xl text-primary shrink-0">
                              <Tag className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-lg leading-tight text-foreground break-words pt-1">{category.name}</h3>
                          </div>
                          <div className="shrink-0 pt-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl w-48">
                                <DropdownMenuItem 
                                  className="font-bold gap-2 cursor-pointer" 
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleEditCategory(category);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 text-blue-500" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="font-bold gap-2 text-rose-600 cursor-pointer" 
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setTimeout(() => setCategoryToDelete(category), 150);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] w-[95vw] rounded-3xl border-primary max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-8 border-b bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary text-center uppercase tracking-tight">
                {editingCategoryId ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-background">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label className="font-bold text-muted-foreground ml-1">Nome da Categoria</Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Perfumaria, Maquiagem..." 
                  className="rounded-xl border-primary/30 h-12 bg-card text-lg font-medium" 
                />
              </div>

              <Accordion 
                type="single" 
                collapsible 
                value={accordionValue} 
                onValueChange={(val) => setAccordionValue(val)} 
                className="w-full"
              >
                <AccordionItem value="suggestions" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 px-1 rounded-xl hover:bg-primary/5 transition-all group">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm">Sugestões de Categorias</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {SUGGESTED_CATEGORIES.map(cat => (
                        <Button 
                          key={cat}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-primary/20 hover:border-primary hover:bg-primary/5 text-xs font-bold h-10 px-2 justify-start"
                          onClick={() => {
                            setFormData({ ...formData, name: cat });
                            setAccordionValue(""); 
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1 shrink-0" />
                          <span className="text-left break-words line-clamp-2">{cat}</span>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button onClick={handleSaveCategory} disabled={isSaving} className="w-full rounded-xl font-bold h-14 text-lg primary-gradient shadow-lg mt-2">
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Categoria"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={o => !o && setCategoryToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-primary">Excluir Categoria?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-lg text-muted-foreground">
              Tem certeza que deseja remover <b className="text-foreground">{categoryToDelete?.name}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutWrapper>
  )
}
