
"use client"

import { useState, useMemo, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Download,
  ArrowUpRight,
  Loader2,
  Sparkles,
  CalendarDays,
  MessageSquare,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("hoje")
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const { toast } = useToast()
  const db = useFirestore()

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const ordersRef = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc")), 
    [db]
  )
  const { data: orders, isLoading } = useCollection(ordersRef)

  const todayLabel = useMemo(() => {
    if (!currentDate) return "Carregando..."
    const day = format(currentDate, 'dd')
    const month = format(currentDate, 'MMMM', { locale: ptBR })
    const year = format(currentDate, 'yyyy')
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
    return `${day}/ ${capitalizedMonth}/ ${year}`
  }, [currentDate])

  const monthLabel = useMemo(() => {
    if (!currentDate) return "Carregando..."
    const month = format(currentDate, 'MMMM', { locale: ptBR })
    const year = format(currentDate, 'yyyy')
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1)
    return `${capitalizedMonth}/ ${year}`
  }, [currentDate])

  const filteredOrdersByPeriod = useMemo(() => {
    if (!orders || !currentDate) return []
    
    return orders.filter(order => {
      const orderDate = order.createdAt?.seconds 
        ? new Date(order.createdAt.seconds * 1000) 
        : new Date(order.createdAt)
      
      if (selectedPeriod === "hoje") {
        return isSameDay(orderDate, currentDate)
      }
      if (selectedPeriod === "mes") {
        return isSameMonth(orderDate, currentDate) && isSameYear(orderDate, currentDate)
      }
      return true
    })
  }, [orders, selectedPeriod, currentDate])

  const totalReceived = filteredOrdersByPeriod?.filter(o => o.paymentStatus === 'Pago')
    .reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  const pendingOrders = filteredOrdersByPeriod?.filter(o => o.paymentStatus === 'Pendente') || []
  
  const totalPending = pendingOrders.reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  const totalOverdue = pendingOrders.filter(o => {
    if (!o.dueDate || !currentDate) return false
    const dDate = o.dueDate.seconds ? new Date(o.dueDate.seconds * 1000) : new Date(o.dueDate)
    return dDate < currentDate
  }).reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  const exportToWhatsApp = () => {
    const periodName = selectedPeriod === "hoje" ? todayLabel : selectedPeriod === "mes" ? monthLabel : "Todo o Período"
    
    let message = `*Relatório Financeiro - RevendaPro*\n`
    message += `*Período:* ${periodName}\n\n`
    message += `💰 *Saldo Recebido:* R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    message += `⏳ *Contas a Receber:* R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    message += `⚠️ *Total Vencido:* R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    message += `📈 *Faturamento:* R$ ${(totalReceived + totalPending).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`
    
    message += `*Fluxo de Caixa (Últimos registros):*\n`
    filteredOrdersByPeriod.slice(0, 10).forEach(order => {
      const status = order.paymentStatus === 'Pago' ? '✅' : '⏳'
      message += `${status} ${order.clientName}: R$ ${order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
    })
    
    if (filteredOrdersByPeriod.length > 10) {
      message += `... e mais ${filteredOrdersByPeriod.length - 10} registros.`
    }

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
  }

  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')
      
      const doc = new jsPDF()
      const periodName = selectedPeriod === "hoje" ? todayLabel : selectedPeriod === "mes" ? monthLabel : "Todo o Período"
      
      doc.setFillColor(194, 24, 91)
      doc.rect(0, 0, 210, 45, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.text('REVENDAPRO', 105, 25, { align: 'center' })
      doc.setFontSize(12)
      doc.text('Gestão Profissional para Consultoras', 105, 35, { align: 'center' })
      
      doc.setTextColor(40, 40, 40)
      doc.setFontSize(14)
      doc.text('RELATÓRIO FINANCEIRO DETALHADO', 14, 55)
      doc.setFontSize(10)
      doc.text(`Período Selecionado: ${periodName}`, 14, 62)
      doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 67)
      
      autoTable(doc, {
        startY: 75,
        head: [['Indicador Financeiro', 'Valor']],
        body: [
          ['Saldo Recebido (Pagos)', `R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
          ['Contas a Receber (Pendentes)', `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
          ['Total Vencido', `R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
          ['Faturamento Bruto Total', `R$ ${(totalReceived + totalPending).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ],
        headStyles: { fillColor: [194, 24, 91], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        theme: 'grid'
      })
      
      doc.setFontSize(12)
      doc.text('DETALHAMENTO DO FLUXO DE CAIXA', 14, (doc as any).lastAutoTable.finalY + 15)
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Data', 'Cliente', 'Status', 'Valor']],
        body: filteredOrdersByPeriod.map(order => [
          order.createdAt ? format(new Date(order.createdAt.seconds * 1000), "dd/MM/yyyy") : '---',
          order.clientName,
          order.paymentStatus === 'Pago' ? 'CONFIRMADO' : 'PENDENTE',
          `R$ ${order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]),
        headStyles: { fillColor: [194, 24, 91], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: { fontSize: 9 },
        columnStyles: {
          3: { halign: 'right', fontStyle: 'bold' }
        },
        theme: 'striped'
      })
      
      const fileName = `relatorio-revendapro-${selectedPeriod}-${format(new Date(), 'ddMMyy')}.pdf`
      doc.save(fileName)
      
      toast({
        title: "Relatório Gerado",
        description: "O seu PDF profissional foi baixado com sucesso."
      })
    } catch (e) {
      console.error(e)
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo PDF."
      })
    }
  }

  const stats = [
    { title: "Saldo Recebido", value: totalReceived, color: "text-emerald-600", bg: "bg-emerald-50", icon: DollarSign, sub: "Recebimentos confirmados" },
    { title: "Contas a Receber", value: totalPending, color: "text-amber-600", bg: "bg-amber-50", icon: Clock, sub: "Aguardando pagamento" },
    { title: "Total Vencido", value: totalOverdue, color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle, sub: "Pagamentos em atraso" },
    { title: "Faturamento Total", value: totalReceived + totalPending, color: "text-primary", bg: "bg-primary/5", icon: TrendingUp, sub: "Vendas brutas" },
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
          
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl px-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <CalendarDays className="h-5 w-5 text-primary shrink-0" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full rounded-xl font-bold border-primary/20 bg-white h-12 shadow-sm">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="hoje">{todayLabel}</SelectItem>
                  <SelectItem value="mes">{monthLabel}</SelectItem>
                  <SelectItem value="todos">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center w-full max-w-sm">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full rounded-xl font-bold h-12 border-primary text-primary hover:bg-primary/5 transition-all px-4 text-sm">
                    <Download className="mr-2 h-5 w-5" /> Exportar Relatório
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="rounded-xl font-bold w-56">
                  <DropdownMenuItem onClick={exportToWhatsApp} className="gap-2 cursor-pointer py-3">
                    <MessageSquare className="h-4 w-4 text-emerald-600" /> Exportar WhatsApp (Texto)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer py-3">
                    <FileText className="h-4 w-4 text-primary" /> Exportar PDF Profissional
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      {(totalReceived + totalPending) > 0 ? Math.round((totalReceived / (totalReceived + totalPending)) * 100) : 0}% Recebido
                    </span>
                  </div>
                  <Progress 
                    value={(totalReceived + totalPending) > 0 ? (totalReceived / (totalReceived + totalPending)) * 100 : 0} 
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
      {transactions.map((item) => (
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
