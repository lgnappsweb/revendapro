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
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  MessageSquare, 
  Calendar,
  MapPin,
  Sparkles,
  Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { generateWhatsappMarketingMessage } from "@/ai/flows/generate-whatsapp-marketing-message"
import { useToast } from "@/hooks/use-toast"

const initialClients = [
  { id: 1, name: "Maria Clara Silva", phone: "11999999999", city: "São Paulo", neighborhood: "Centro", totalPurchases: 15, lastPurchase: "05 Mar 2024", history: ["Perfume Kaiak", "Batom Avon Red"] },
  { id: 2, name: "Ana Beatriz Oliveira", phone: "11988888888", city: "São Paulo", neighborhood: "Jardins", totalPurchases: 8, lastPurchase: "28 Fev 2024", history: ["Creme Tododia", "Sabonete Natura"] },
  { id: 3, name: "Juliana Santos", phone: "11977777777", city: "Guarulhos", neighborhood: "Vila Augusta", totalPurchases: 3, lastPurchase: "15 Jan 2024", history: ["Delineador Avon"] },
]

export default function ClientsPage() {
  const [clients] = useState(initialClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [isGeneratingMessage, setIsGeneratingMessage] = useState<number | null>(null)
  const { toast } = useToast()

  const handleGenerateMessage = async (client: typeof initialClients[0]) => {
    setIsGeneratingMessage(client.id)
    try {
      const result = await generateWhatsappMarketingMessage({
        clientName: client.name,
        lastPurchasedProducts: client.history,
        preferredCategories: ["perfumaria", "cuidados pessoais"]
      })
      
      // Simulating opening WhatsApp with the draft
      const encodedMsg = encodeURIComponent(result.messageDraft)
      window.open(`https://wa.me/${client.phone}?text=${encodedMsg}`, '_blank')
      
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  )

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Meus Clientes</h1>
            <p className="text-muted-foreground font-medium">Gerencie sua rede de contatos e histórico de vendas.</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md h-11 px-6">
                <Plus className="mr-2 h-5 w-5" /> Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">Novo Cliente</DialogTitle>
                <DialogDescription className="font-medium">Cadastre os dados básicos para iniciar as vendas.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right font-bold">Nome</Label>
                  <Input id="name" placeholder="Ex: Maria Santos" className="col-span-3 rounded-xl" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right font-bold">WhatsApp</Label>
                  <Input id="phone" placeholder="11 99999-9999" className="col-span-3 rounded-xl" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="city" className="text-right font-bold">Cidade</Label>
                  <Input id="city" className="col-span-3 rounded-xl" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="neighborhood" className="text-right font-bold">Bairro</Label>
                  <Input id="neighborhood" className="col-span-3 rounded-xl" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right font-bold">Notas</Label>
                  <Textarea id="notes" className="col-span-3 rounded-xl" placeholder="Observações importantes..." />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-xl font-bold h-11">Salvar Cliente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por nome ou telefone..." 
            className="h-12 pl-10 rounded-2xl border-none shadow-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-4 font-bold text-muted-foreground">Cliente</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground">Localização</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground">Última Venda</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground text-center">Compras</TableHead>
                <TableHead className="px-6 py-4 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer group hover:bg-secondary/10 transition-colors border-b last:border-0">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarFallback className="bg-secondary text-primary font-bold">
                          {client.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{client.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mt-0.5">
                          <Phone className="h-3 w-3" /> {client.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <MapPin className="h-3 w-3 text-primary" /> {client.neighborhood}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{client.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" /> {client.lastPurchase}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="rounded-lg font-bold bg-pink-100 text-primary border-none">
                      {client.totalPurchases} itens
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full hover:bg-emerald-50 hover:text-emerald-600 h-9 w-9"
                        onClick={() => window.open(`https://wa.me/${client.phone}`, '_blank')}
                      >
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        disabled={isGeneratingMessage === client.id}
                        className="rounded-xl hover:bg-primary/10 text-primary font-bold gap-2 px-3 h-9"
                        onClick={() => handleGenerateMessage(client)}
                      >
                        {isGeneratingMessage === client.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        <span className="hidden md:inline">Marketing IA</span>
                      </Button>
                      <Button size="icon" variant="ghost" className="rounded-full h-9 w-9">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </LayoutWrapper>
  )
}
