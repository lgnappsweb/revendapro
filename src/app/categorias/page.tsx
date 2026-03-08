
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
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, serverTimestamp, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useToast } from "@/hooks/use-toast"

const SUGGESTED_CATEGORIES = [
  "Perfumaria Feminina", "Perfumaria Masculina", "Maquiagem", "Cuidados com o Rosto",
  "Cuidados com o Corpo", "Cabelos", "Desodorantes", "Proteção Solar", "Infantil",
  "Linha Masculina", "Presentes e Kits", "Acessórios", 
  "Cozinha e Preparação", "Potes e Armazenagem", "Utensílios de Cozinha",
  "Cama, Mesa e Banho", "Decoração", "Organização Doméstica",
  "Moda e Acessórios", "Lingerie e Calçados", "Casa e Estilo Geral"
]

export default function CategoriesPage() {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [accordionValue, setAccordionValue] = useState<string>("")
  
  const db = useFirestore()
  const { toast } = useToast()

  const categoriesRef = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "categories"), orderBy("name", "asc"))
  }, [db, user])
  
  const { data: categories, isLoading } = useCollection(categoriesRef)

  const [formData, setFormData] = useState({ name: "" })

  const handleOpenNewCategory = () => {
    if (isProcessing) return
    setEditingCategoryId(null)
    setFormData({ name: "" })
    setAccordionValue("")
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: any) => {
    if (isProcessing) return
    setEditingCategoryId(category.id)
    setFormData({ name: category.name || "" })
    setAccordionValue("")
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete || isProcessing) return
    const categoryId = categoryToDelete.id
    const categoryName = categoryToDelete.name
    setIsProcessing(true)
    setCategoryToDelete(null)

    try {
      const docRef = doc(db, "categories", categoryId)
      await deleteDoc(docRef)
      toast({ title: "Categoria removida", description: categoryName })
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error)
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `categories/${categoryId}`, operation: 'delete' }))
      toast({ title: "Erro ao excluir", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveCategory = async () => {
    if (!formData.name || isProcessing) {
      toast({ title: "Nome obrigatório", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    const categoryData = { name: formData.name, updatedAt: serverTimestamp() }

    try {
      if (editingCategoryId) {
        const docRef = doc(db, "categories", editingCategoryId)
        await updateDoc(docRef, categoryData)
        toast({ title: "Atualizada!" })
      } else {
        await addDoc(collection(db, "categories"), { ...categoryData, createdAt: serverTimestamp() })
        toast({ title: "Salva!" })
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error)
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: editingCategoryId ? `categories/${editingCategoryId}` : 'categories', 
        operation: editingCategoryId ? 'update' : 'create', 
        requestResourceData: categoryData 
      }))
      toast({ title: "Erro ao salvar", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredCategories = categories?.filter(c => 
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <LayoutWrapper>
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 border-2 border-primary">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-black text-primary uppercase tracking-widest text-sm animate-pulse">Processando...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">
              Categorias
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Organize seus produtos por categorias.</p>
          </div>
          <Button onClick={handleOpenNewCategory} disabled={isProcessing} className="w-full max-w-md rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg">
            <Plus className="mr-2 h-6 w-6" /> Nova Categoria
          </Button>
        </div>

        <div className="relative w-full px-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar categoria..." 
            className="h-14 pl-12 rounded-2xl border border-primary/30 shadow-sm bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full overflow-x-hidden px-1">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                  <Layers className="h-6 w-6" /> Suas Categorias
                </CardTitle>
                <CardDescription className="font-medium">Gerencie as categorias de produtos.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <Layers className="h-16 w-16 text-primary/20 mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhuma categoria encontrada.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map((category) => (
                      <div key={category.id} className="p-4 rounded-2xl border border-primary/10 bg-card flex items-center justify-between group hover:border-primary transition-all">
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-primary" />
                          <span className="font-bold text-foreground truncate">{category.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" disabled={isProcessing}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem 
                              className="font-bold gap-2" 
                              onSelect={(e) => {
                                e.preventDefault()
                                handleEditCategory(category)
                              }}
                            >
                              <Pencil className="h-4 w-4 text-blue-500" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="font-bold gap-2 text-rose-600" 
                              onSelect={(e) => {
                                e.preventDefault()
                                setCategoryToDelete(category)
                              }}
                            >
                              <Trash2 className="h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(o) => !isProcessing && setIsDialogOpen(o)}>
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
                <Label className="font-bold text-muted-foreground">Nome da Categoria</Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Perfumaria, Maquiagem..." 
                  className="rounded-xl border-primary/30 h-12 bg-card" 
                  disabled={isProcessing}
                />
              </div>

              <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue} className="w-full">
                <AccordionItem value="suggestions" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-2 px-1 rounded-xl hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm">Sugestões</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTED_CATEGORIES.map(cat => (
                        <Button 
                          key={cat}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-primary/20 text-xs font-bold h-10 px-2 justify-start"
                          onClick={() => { setFormData({ ...formData, name: cat }); setAccordionValue(""); }}
                          disabled={isProcessing}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          <span className="truncate">{cat}</span>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button onClick={handleSaveCategory} disabled={isProcessing} className="w-full rounded-xl font-bold h-14 text-lg primary-gradient shadow-lg">
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={o => !isProcessing && setCategoryToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-primary">Excluir?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              Deseja remover <b className="text-foreground">{categoryToDelete?.name}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold" disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl font-bold bg-rose-600" disabled={isProcessing}>
              {isProcessing ? "Removendo..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutWrapper>
  )
}
