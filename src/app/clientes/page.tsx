
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
  Calendar,
  MapPin,
  Sparkles,
  Loader2,
  UserPlus,
  Trash2,
  MapPinned
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { generateWhatsappMarketingMessage } from "@/ai/flows/generate-whatsapp-marketing-message"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore"

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isGeneratingMessage, setIsGeneratingMessage] = useState<string | null>(null)
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são necessários.",
        variant: "destructive"
      })
      return
    }

    setIsAddingClient(true)
    try {
      await addDoc(clientsRef, {
        ...formData,
        createdAt: serverTimestamp()
      })
      
      toast({
        title: "Cliente Cadastrado",
        description: `${formData.name} foi adicionado à sua lista.`
      })
      
      setFormData({ name: "", phone: "", city: "", neighborhood: "", notes: "" })
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cliente.",
        variant: "destructive"
      })
    } finally {
      setIsAddingClient(false)
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, "clients", id))
      toast({ title: "Cliente removido" })
    } catch (error) {
      toast({ title: "Erro ao remover", variant: "destructive" })
    }
  }

  const handleGenerateMessage = async (client: any) => {
    setIsGeneratingMessage(client.id)
    try {
      const result = await generateWhatsappMarketingMessage({
        clientName: client.name,
        lastPurchasedProducts: [], 
        preferredCategories: ["beleza"]
      })
      
      const encodedMsg = encodeURIComponent(result.messageDraft)
      window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodedMsg}`, '_blank')
      
      toast({
        title: "Mensagem Gerada!",
        description: "Draft personalizado criado com IA.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a mensagem agora.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingMessage(null)
    }
  }

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  ) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 py-4">
          <div className="space-y-2 w-full text-center flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-primary lg:whitespace-nowrap">
              Meus Clientes
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Gerencie sua rede de contatos e vendas.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg">
                <UserPlus className="mr-2 h-6 w-6" /> Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl border-primary max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <div className="p-8 border-b bg-white">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-primary text-center uppercase tracking-tight">
                    Novo Cliente
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground text-center text-lg mt-1">
                    Cadastre os dados básicos para iniciar.
                  </DialogDescription>
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
                    <Button type="submit" disabled={isAddingClient} className="w-full rounded-xl font-bold h-14 text-lg primary-gradient shadow-lg">
                      {isAddingClient ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Cliente"}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por nome ou telefone..." 
            className="h-14 pl-12 rounded-2xl border-primary/30 shadow-sm bg-white text-base focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Clients List */}
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
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/10">
                            <AvatarFallback className="bg-secondary text-primary font-black text-lg">
                              {client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-foreground leading-tight">{client.name}</span>
                            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1 mt-1">
                              <Phone className="h-3.5 w-3.5 text-primary" /> {client.phone}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="font-bold gap-2" onClick={() => window.open(`tel:${client.phone.replace(/\D/g, '')}`)}>
                              <Phone className="h-4 w-4" /> Ligar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-bold gap-2 text-rose-600" onClick={() => handleDeleteClient(client.id)}>
                              <Trash2 className="h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 border-primary/5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Localização</span>
                          <span className="text-sm font-semibold truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" /> {client.neighborhood || "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cidade</span>
                          <span className="text-sm font-semibold truncate">{client.city || "N/A"}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <Badge variant="secondary" className="rounded-lg font-black bg-pink-100 text-primary border-none px-3 py-1 uppercase text-[10px]">
                          CLIENTE PRO
                        </Badge>
                        <Button 
                          onClick={() => handleGenerateMessage(client)}
                          disabled={isGeneratingMessage === client.id}
                          className="rounded-xl primary-gradient font-bold h-10 gap-2 flex-1 shadow-md"
                        >
                          {isGeneratingMessage === client.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          Marketing IA
                        </Button>
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
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs">Localização</TableHead>
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs">Bairro</TableHead>
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs text-center">Status</TableHead>
                      <TableHead className="px-6 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="group hover:bg-secondary/10 transition-colors border-b last:border-0 border-primary/5 h-20">
                        <TableCell className="px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/10">
                              <AvatarFallback className="bg-secondary text-primary font-bold">
                                {client.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors">{client.name}</span>
                              <span className="text-xs text-muted-foreground font-medium mt-0.5">{client.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{client.city || "Não inf."}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Cidade</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <MapPinned className="h-4 w-4 text-primary/60" /> {client.neighborhood || "Não inf."}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="rounded-lg font-black bg-pink-100 text-primary border-none text-[10px] uppercase">
                            CLIENTE ATIVO
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              disabled={isGeneratingMessage === client.id}
                              className="rounded-xl hover:bg-primary/10 text-primary font-bold gap-2 px-4 h-10 border border-primary/20"
                              onClick={() => handleGenerateMessage(client)}
                            >
                              {isGeneratingMessage === client.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                              Marketing IA
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="rounded-full h-10 w-10">
                                  <MoreVertical className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem className="font-bold gap-2" onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank')}>
                                  <MessageSquare className="h-4 w-4 text-emerald-600" /> WhatsApp
                                </DropdownMenuItem>
                                <DropdownMenuItem className="font-bold gap-2 text-rose-600" onClick={() => handleDeleteClient(client.id)}>
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

          {!isLoading && filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-primary/20">
              <UserPlus className="h-16 w-16 text-primary/20 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground font-medium max-w-xs mt-2">
                Busque por outro termo ou adicione um novo cliente.
              </p>
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}
