
"use client"

import { useState, useMemo } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  CheckCircle2,
  Search,
  ChevronRight,
  Sparkles,
  CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FinancePage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("mes")
  const { toast } = useToast()
  const db = useFirestore()

  const ordersRef = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc")), 
    [db]
  )
  const { data: orders, isLoading } = useCollection(ordersRef)

  // Filtro de ordens pelo período selecionado
  const filteredOrdersByPeriod = useMemo(() => {
    if (!orders) return []
    const now = new Date()
    
    return orders.filter(order => {
      const orderDate = order.createdAt?.seconds 
        ? new Date(order.createdAt.seconds * 1000) 
        : new Date(order.createdAt)
      
      if (selectedPeriod === "hoje") {
        return isSameDay(orderDate, now)
      }
      if (selectedPeriod === "mes") {
        return isSameMonth(orderDate, now) && isSameYear(orderDate, now)
      }
      return true // "todos"
    })
  }, [orders, selectedPeriod])

  // Cálculos financeiros baseados no período filtrado
  const now = new Date()
  
  const totalReceived = filteredOrdersByPeriod?.filter(o => o.paymentStatus === 'Pago')
    .reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  const pendingOrders = filteredOrdersByPeriod?.filter(o => o.paymentStatus === 'Pendente') || []
  
  const totalPending = pendingOrders.reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  const totalOverdue = pendingOrders.filter(o => {
    if (!o.dueDate) return false
    const dDate = o.dueDate.seconds ? new Date(o.dueDate.seconds * 1000) : new Date(o.dueDate)
    return dDate < now
  }).reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  // Filtro para o diálogo de registrar entrada
  const ordersToReceive = orders?.filter(o => o.paymentStatus === 'Pendente' && (
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  )) || []

  const handleReceivePayment = async (order: any) => {
    setIsUpdating(true)
    try {
      const orderRef = doc(db, "orders", order.id)
      await updateDoc(orderRef, {
        paymentStatus: 'Pago',
        paidAt: serverTimestamp()
      })
      toast({
        title: "Entrada registrada!",
        description: `O pagamento de ${order.clientName} foi confirmado.`
      })
      setIsRegisterOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar",
        description: "Não foi possível confirmar o pagamento."
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const exportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seu relatório financeiro está sendo gerado."
    })
  }

  const stats = [
    { title: "Saldo Recebido", value: totalReceived, color: "text-emerald-600", bg: "bg-emerald-50", icon: DollarSign, sub: "Confirmados no período" },
    { title: "Contas a Receber", value: totalPending, color: "text-amber-600", bg: "bg-amber-50", icon: Clock, sub: "Aguardando no período" },
    { title: "Total Vencido", value: totalOverdue, color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle, sub: "Vencidos no período" },
    { title: "Faturamento", value: totalReceived + totalPending, color: "text-primary", bg: "bg-primary/5", icon: TrendingUp, sub: "Total bruto no período" },
  ]

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-10 pt-12 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary text-center break-words w-full px-2 uppercase">
              Financeiro
            </h1>
            <p className="text-muted-foreground font-medium text-lg text-center">Controle total de entradas, pendentes e lucros.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl px-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <CalendarDays className="h-5 w-5 text-primary" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-[200px] rounded-xl font-bold border-primary/20 bg-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="hoje">Hoje ({format(new Date(), 'dd/MM')})</SelectItem>
                  <SelectItem value="mes">Este Mês</SelectItem>
                  <SelectItem value="todos">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
              <Button onClick={exportData} variant="outline" className="rounded-xl font-bold h-12 border-primary text-primary hover:bg-primary/5 transition-all px-6">
                <Download className="mr-2 h-5 w-5" /> Exportar
              </Button>
              
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl font-bold primary-gradient hover:opacity-90 h-12 px-8 shadow-lg transition-all active:scale-95">
                    <Plus className="mr-2 h-5 w-5" /> Registrar Entrada
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl border-primary overflow-hidden p-0 flex flex-col max-h-[85vh]">
                  <DialogHeader className="p-8 pb-4 bg-white">
                    <DialogTitle className="text-2xl font-black text-primary uppercase text-center">Confirmar Pagamento</DialogTitle>
                  </DialogHeader>
                  
                  <div className="px-8 pb-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Pesquisar cliente ou pedido..." 
                        className="pl-10 rounded-xl border-primary/20 bg-muted/30"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1 px-8 pb-8 bg-[#FDFBFB]">
                    <div className="space-y-3">
                      {ordersToReceive.length === 0 ? (
                        <div className="text-center py-10">
                          <CheckCircle2 className="h-12 w-12 text-emerald-500/30 mx-auto mb-2" />
                          <p className="text-sm font-bold text-muted-foreground">Nenhum pagamento pendente encontrado.</p>
                        </div>
                      ) : (
                        ordersToReceive.map((order) => (
                          <div key={order.id} className="p-4 rounded-2xl bg-white border border-primary/10 hover:border-primary transition-all group flex items-center justify-between">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-foreground truncate">{order.clientName}</span>
                              <span className="text-[10px] font-black text-primary uppercase">R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <Button 
                              size="sm" 
                              disabled={isUpdating}
                              onClick={() => handleReceivePayment(order)}
                              className="rounded-lg font-bold bg-emerald-500 hover:bg-emerald-600 h-9"
                            >
                              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
          {stats.map((stat, i) => (
            <Card key={i} className="shadow-sm rounded-[2rem] overflow-hidden border-primary/20 bg-white transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                  <h3 className={`text-2xl font-black mt-1 ${stat.color}`}>R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 px-1">
          <Card className="lg:col-span-2 shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20 bg-white">
            <Tabs defaultValue="todos" className="w-full">
              <CardHeader className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b bg-white gap-4">
                <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">Fluxo de Caixa</CardTitle>
                <TabsList className="bg-muted/50 rounded-xl p-1 h-10">
                  <TabsTrigger value="todos" className="rounded-lg font-bold text-xs px-4">Todos</TabsTrigger>
                  <TabsTrigger value="pagos" className="rounded-lg font-bold text-xs px-4">Confirmados</TabsTrigger>
                  <TabsTrigger value="pendentes" className="rounded-lg font-bold text-xs px-4">Pendentes</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                ) : (
                  <>
                    <TabsContent value="todos" className="m-0">
                      <TransactionList transactions={filteredOrdersByPeriod} />
                    </TabsContent>
                    <TabsContent value="pagos" className="m-0">
                      <TransactionList transactions={filteredOrdersByPeriod.filter(o => o.paymentStatus === 'Pago')} />
                    </TabsContent>
                    <TabsContent value="pendentes" className="m-0">
                      <TransactionList transactions={filteredOrdersByPeriod.filter(o => o.paymentStatus === 'Pendente')} />
                    </TabsContent>
                  </>
                )}
              </CardContent>
            </Tabs>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-primary flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Metas Mensais
                </CardTitle>
                <CardDescription className="font-medium text-xs">Seu desempenho comercial no mês atual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                    <span>Meta de Vendas</span>
                    <span className="text-primary">R$ {totalReceived.toLocaleString('pt-BR')} / R$ 5.000</span>
                  </div>
                  <Progress value={(totalReceived / 5000) * 100} className="h-3 bg-pink-50" />
                  <p className="text-[10px] text-muted-foreground font-bold text-right italic">
                    {totalReceived >= 5000 ? "Meta batida! Parabéns! 🎉" : `Faltam R$ ${(Math.max(0, 5000 - totalReceived)).toLocaleString('pt-BR')} para o seu objetivo.`}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                    <span>Eficiência de Cobrança</span>
                    <span className="text-emerald-600">
                      {filteredOrdersByPeriod.length ? Math.round((totalReceived / (totalReceived + totalPending)) * 100) : 0}% Recebido
                    </span>
                  </div>
                  <Progress 
                    value={filteredOrdersByPeriod.length ? (totalReceived / (totalReceived + totalPending)) * 100 : 0} 
                    className="h-3 bg-emerald-50 [&>div]:bg-emerald-500" 
                  />
                  <p className="text-[10px] text-muted-foreground font-bold text-right italic">
                    R$ {totalReceived.toLocaleString('pt-BR')} recebidos de R$ {(totalReceived + totalPending).toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="primary-gradient rounded-[2.5rem] overflow-hidden border-none text-white shadow-xl">
              <CardContent className="p-8 space-y-4">
                <h4 className="font-black flex items-center gap-2 uppercase tracking-tighter text-xl">
                  <Sparkles className="h-6 w-6" />
                  Insight do RevendaPro
                </h4>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  {totalPending > 0 ? (
                    `Você tem R$ ${totalPending.toLocaleString('pt-BR')} em aberto neste período. Cobrar seus clientes hoje pode ser uma ótima ideia!`
                  ) : (
                    "Incrível! Todos os seus clientes estão em dia neste período. Que tal registrar novas vendas hoje?"
                  )}
                </p>
                <Button className="w-full rounded-2xl font-bold bg-white text-primary hover:bg-white/90 shadow-lg h-12">Analisar Tendências</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

function TransactionList({ transactions }: { transactions: any[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <DollarSign className="h-12 w-12 text-muted-foreground/20 mb-2" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Nenhuma transação neste período</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-primary/5">
      {transactions.map((item, i) => (
        <div key={item.id} className="flex items-center justify-between p-6 hover:bg-secondary/10 transition-colors group cursor-pointer">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`p-3 rounded-2xl shrink-0 ${
              item.paymentStatus === 'Pago' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {item.paymentStatus === 'Pago' ? <ArrowUpRight className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{item.clientName}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                {item.createdAt ? format(new Date(item.createdAt.seconds * 1000), "dd 'de' MMM, HH:mm", { locale: ptBR }) : 'Recentemente'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`font-black text-lg ${item.paymentStatus === 'Pago' ? 'text-emerald-600' : 'text-foreground'}`}>
              R$ {item.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <Badge 
              variant="outline" 
              className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 border-none ${
                item.paymentStatus === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              {item.paymentStatus}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
