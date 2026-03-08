
"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  MoreVertical, 
  Phone, 
  MessageSquare, 
  MapPin,
  Loader2,
  UserPlus,
  Trash2,
  Pencil,
  ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const { toast } = useToast()
  const db = useFirestore()

  const clientsRef = useMemoFirebase(() => collection(db, "clients"), [db])
  const { data: clients, isLoading } = useCollection(clientsRef)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    neighborhood: "",
    notes: ""
  })

  const formatPhone = (value: string) => {
    const input = value.replace(/\D/g, "").substring(0, 11);
    let formatted = input;
    if (input.length > 0) {
      formatted = "(" + input.substring(0, 2);
      if (input.length > 2) {
        formatted += ") " + input.substring(2, 7);
        if (input.length > 7) {
          formatted += "-" + input.substring(7, 11);
        }
      }
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleOpenAdd = () => {
    setEditingClient(null)
    setFormData({ name: "", phone: "", city: "", neighborhood: "", notes: "" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (client: any) => {
    setEditingClient(client)
    setFormData({
      name: client.name || "",
      phone: client.phone || "",
      city: client.city || "",
      neighborhood: client.neighborhood || "",
      notes: client.notes || ""
    })
    setIsDialogOpen(true)
  }

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são necessários.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    const clientData = {
      ...formData,
      updatedAt: serverTimestamp()
    }

    if (editingClient) {
      const clientDocRef = doc(db, "clients", editingClient.id)
      updateDoc(clientDocRef, clientData)
        .then(() => {
          toast({ title: "Cliente Atualizado" })
          setIsDialogOpen(false)
        })
        .catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: clientDocRef.path,
            operation: 'update',
            requestResourceData: clientData,
          }))
        })
        .finally(() => setIsSaving(false))
    } else {
      const newClient = {
        ...clientData,
        createdAt: serverTimestamp()
      }
      addDoc(clientsRef, newClient)
        .then(() => {
          toast({ title: "Cliente Cadastrado" })
          setIsDialogOpen(false)
        })
        .catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: clientsRef.path,
            operation: 'create',
            requestResourceData: newClient,
          }))
        })
        .finally(() => setIsSaving(false))
    }
  }

  const handleDeleteClient = () => {
    if (!clientToDelete) return
    const clientDocRef = doc(db, "clients", clientToDelete.id)
    deleteDoc(clientDocRef)
      .then(() => {
        toast({ title: "Cliente removido" })
        setClientToDelete(null)
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: clientDocRef.path,
          operation: 'delete',
        }))
      })
  }

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  ) || []

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`https://wa.me/55${cleanPhone}`, '_blank')
  }

  const openDialer = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    window.open(`tel:${cleanPhone}`)
  }

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-2 w-full text-center flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-primary">
              Meus Clientes
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Gerencie sua rede de contatos e vendas.</p>
          </div>
          
          <Button onClick={handleOpenAdd} className="w-full rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg">
            <UserPlus className="mr-2 h-6 w-6" /> Adicionar Cliente
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl border-primary max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <div className="p-8 border-b bg-white">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-primary text-center uppercase tracking-tight">
                    {editingClient ? "Editar Cliente" : "Novo Cliente"}
                  </DialogTitle>
                </DialogHeader>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#FDFBFB]">
                <form onSubmit={handleSaveClient} className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="font-bold text-muted-foreground text-base">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Maria Santos" 
                      className="rounded-xl border-primary/30 h-11 bg-white" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="font-bold text-muted-foreground text-base">WhatsApp</Label>
                    <Input 
                      id="phone" 
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999" 
                      className="rounded-xl border-primary/30 h-11 bg-white" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city" className="font-bold text-muted-foreground text-base">Cidade</Label>
                      <Input 
                        id="city" 
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="rounded-xl border-primary/30 h-11 bg-white" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="neighborhood" className="font-bold text-muted-foreground text-base">Bairro</Label>
                      <Input 
                        id="neighborhood" 
                        value={formData.neighborhood}
                        onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                        className="rounded-xl border-primary/30 h-11 bg-white" 
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes" className="font-bold text-muted-foreground text-base">Notas</Label>
                    <Textarea 
                      id="notes" 
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="rounded-xl border-primary/30 min-h-[100px] bg-white" 
                      placeholder="Observações importantes..." 
                    />
                  </div>
                  
                  <div className="pt-2 pb-6">
                    <Button type="submit" disabled={isSaving} className="w-full rounded-xl font-bold h-14 text-lg primary-gradient shadow-lg">
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Cliente"}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-2xl mx-auto w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por nome ou telefone..." 
            className="h-14 pl-12 rounded-2xl border-primary/30 shadow-sm bg-white text-base focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Mobile View: Cards */}
              <div className="grid gap-4 md:hidden">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="rounded-3xl border-primary/20 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-12 w-12 border-2 border-primary/10 shrink-0">
                            <AvatarFallback className="bg-secondary text-primary font-black text-lg">
                              {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-lg text-foreground leading-tight truncate">
                              {client.name}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium mt-1 truncate">
                              {client.phone}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-semibold">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate">{client.neighborhood}{client.neighborhood && client.city ? ', ' : ''}{client.city}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openDialer(client.phone)} className="rounded-full h-10 w-10 text-primary hover:bg-primary/10">
                            <Phone className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openWhatsApp(client.phone)} className="rounded-full h-10 w-10 text-emerald-600 hover:bg-emerald-50">
                            <MessageSquare className="h-5 w-5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem className="font-bold gap-2" onClick={() => handleOpenEdit(client)}>
                                <Pencil className="h-4 w-4 text-blue-500" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="font-bold gap-2 text-rose-600" onClick={() => setClientToDelete(client)}>
                                <Trash2 className="h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block rounded-3xl border border-primary/20 bg-white shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none h-14">
                      <TableHead className="px-6 font-black text-muted-foreground uppercase tracking-widest text-xs">Cliente</TableHead>
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs">Telefone</TableHead>
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs">Status</TableHead>
                      <TableHead className="px-6 text-right font-black text-muted-foreground uppercase tracking-widest text-xs">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="group hover:bg-secondary/10 transition-colors border-b last:border-0 border-primary/5 h-24">
                        <TableCell className="px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/10">
                              <AvatarFallback className="bg-secondary text-primary font-bold">
                                {client.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]">{client.name}</span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-black uppercase tracking-wider mt-0.5">
                                <MapPin className="h-3 w-3 text-primary/60" />
                                {client.neighborhood || 'S/ Bairro'}{client.city ? `, ${client.city}` : ''}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-muted-foreground">
                          {client.phone}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-lg font-black bg-pink-100 text-primary border-none text-[10px] uppercase">
                            CLIENTE ATIVO
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDialer(client.phone)} className="rounded-xl font-bold border-primary text-primary hover:bg-primary hover:text-white h-9 px-3">
                              <Phone className="h-4 w-4 mr-2" /> Ligar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openWhatsApp(client.phone)} className="rounded-xl font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white h-9 px-3">
                              <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="rounded-full h-9 w-9">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem className="font-bold gap-2" onClick={() => handleOpenEdit(client)}>
                                  <Pencil className="h-4 w-4 text-blue-500" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="font-bold gap-2 text-rose-600" onClick={() => setClientToDelete(client)}>
                                  <Trash2 className="h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={!!clientToDelete} onOpenChange={(o) => !o && setClientToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-primary">Excluir Cliente?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-lg text-muted-foreground">
              Tem certeza que deseja remover <b className="text-foreground">{clientToDelete?.name}</b>? Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutWrapper>
  )
}
