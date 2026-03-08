
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
  CalendarDays,
  FileText,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { format, isSameDay, isSameMonth, isSameYear, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes")
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const db = useFirestore()

  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const ordersRef = useMemoFirebase(() => query(collection(db, "orders"), orderBy("createdAt", "desc")), [db])
  const { data: orders, isLoading } = useCollection(ordersRef)

  const todayLabel = useMemo(() => {
    if (!currentDate) return "Hoje"
    return format(currentDate, 'dd/MM/yyyy')
  }, [currentDate])

  const monthLabel = useMemo(() => {
    if (!currentDate) return "Este Mês"
    const month = format(currentDate, 'MMMM', { locale: ptBR })
    return month.charAt(0).toUpperCase() + month.slice(1)
  }, [currentDate])

  const filteredOrdersByPeriod = useMemo(() => {
    if (!orders || !currentDate) return []
    return orders.filter(order => {
      const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(order.createdAt)
      if (selectedPeriod === "hoje") return isSameDay(orderDate, currentDate)
      if (selectedPeriod === "mes") return isSameMonth(orderDate, currentDate) && isSameYear(orderDate, currentDate)
      return true
    })
  }, [orders, selectedPeriod, currentDate])

  const totalReceived = filteredOrdersByPeriod?.filter(o => o.paymentStatus === 'Pago').reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0
  const totalPending = filteredOrdersByPeriod?.filter(o => o.paymentStatus === 'Pendente').reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0
  
  const totalOverdue = filteredOrdersByPeriod?.filter(o => {
    if (o.paymentStatus !== 'Pendente' || !o.dueDate) return false
    const dDate = o.dueDate.seconds ? new Date(o.dueDate.seconds * 1000) : new Date(o.dueDate)
    return dDate < (currentDate || new Date())
  }).reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  const stats = [
    { title: "Recebido", value: totalReceived, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: DollarSign },
    { title: "Pendente", value: totalPending, color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
    { title: "Vencido", value: totalOverdue, color: "text-rose-500", bg: "bg-rose-500/10", icon: AlertCircle },
    { title: "Total Geral", value: totalReceived + totalPending, color: "text-primary", bg: "bg-primary/10", icon: TrendingUp },
  ]

  const chartData = useMemo(() => {
    if (!currentDate || !orders) return []
    
    // Gráfico dos últimos 7 dias ou do mês atual? Vamos fazer do mês atual se for "mes"
    if (selectedPeriod === "mes") {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      const days = eachDayOfInterval({ start, end })

      return days.map(day => {
        const dayTotal = orders
          .filter(o => {
            const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt)
            return isSameDay(oDate, day)
          })
          .reduce((acc, o) => acc + (o.finalTotal || 0), 0)
        
        return {
          day: format(day, 'dd'),
          total: dayTotal
        }
      }).filter(d => d.total > 0 || d.day === '01' || d.day === '15' || d.day === format(end, 'dd'))
    }

    return [
      { name: 'Recebido', value: totalReceived, color: '#10b981' },
      { name: 'Pendente', value: totalPending, color: '#f59e0b' }
    ]
  }, [orders, currentDate, selectedPeriod, totalReceived, totalPending])

  const handleExportPDF = () => {
    if (!filteredOrdersByPeriod.length) return
    setIsExporting(true)

    try {
      const doc = new jsPDF()
      const title = `Relatorio_Financeiro_${selectedPeriod}_${format(new Date(), 'dd-MM-yyyy')}`
      
      doc.setFontSize(18)
      doc.text("RevendaPro - Relatório Financeiro", 14, 20)
      doc.setFontSize(11)
      doc.text(`Período: ${selectedPeriod === 'hoje' ? todayLabel : selectedPeriod === 'mes' ? monthLabel : 'Todo o Período'}`, 14, 30)
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 37)

      const tableData = filteredOrdersByPeriod.map(order => [
        format(order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(order.createdAt), 'dd/MM/yy'),
        order.clientName,
        order.paymentMethod?.toUpperCase() || 'S/ INFO',
        order.paymentStatus,
        `R$ ${order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ])

      // @ts-ignore
      doc.autoTable({
        startY: 45,
        head: [['Data', 'Cliente', 'Pagamento', 'Status', 'Valor']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [194, 24, 91] }
      })

      const finalY = (doc as any).lastAutoTable.finalY || 150
      doc.setFontSize(12)
      doc.text(`Resumo Financeiro:`, 14, finalY + 15)
      doc.text(`Total Recebido: R$ ${totalReceived.toLocaleString('pt-BR')}`, 14, finalY + 25)
      doc.text(`Total Pendente: R$ ${totalPending.toLocaleString('pt-BR')}`, 14, finalY + 32)
      doc.text(`Total Geral: R$ ${(totalReceived + totalPending).toLocaleString('pt-BR')}`, 14, finalY + 39)

      doc.save(`${title}.pdf`)
      toast({ title: "PDF Gerado!", description: "O relatório foi baixado com sucesso." })
    } catch (error) {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">
              Financeiro
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Controle total de suas entradas e lucros.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl px-4">
             <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:flex-1 rounded-2xl font-bold border-primary/20 bg-card h-14 shadow-sm text-lg">
                  <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl font-bold">
                  <SelectItem value="hoje">Hoje ({todayLabel})</SelectItem>
                  <SelectItem value="mes">Este Mês ({monthLabel})</SelectItem>
                  <SelectItem value="todos">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleExportPDF} 
                disabled={isExporting || filteredOrdersByPeriod.length === 0}
                className="w-full sm:w-auto rounded-2xl font-black bg-primary hover:bg-primary/90 shadow-lg h-14 px-8 text-lg flex items-center gap-2"
              >
                {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
                EXPORTAR PDF
              </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
          {stats.map((stat, i) => (
            <Card key={i} className="shadow-sm rounded-[2rem] border-primary/10 hover:border-primary transition-all">
              <CardContent className="p-6">
                <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <h3 className={`text-2xl font-black mt-1 ${stat.color}`}>R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 px-1">
          <Card className="lg:col-span-2 shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 border-b px-8 py-6 flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                   <BarChart3 className="h-5 w-5" /> Desempenho
                 </CardTitle>
                 <CardDescription className="font-medium">Volume de vendas no período selecionado.</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="p-8">
               <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis 
                        dataKey={selectedPeriod === 'mes' ? 'day' : 'name'} 
                        axisLine={false} 
                        tickLine={false} 
                        fontSize={10} 
                        fontWeight="bold" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey={selectedPeriod === 'mes' ? 'total' : 'value'} radius={[6, 6, 0, 0]}>
                        {chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || 'hsl(var(--primary))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 border-b px-8 py-6">
               <CardTitle className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                 <FileText className="h-5 w-5" /> Fluxo de Caixa
               </CardTitle>
               <CardDescription className="font-medium">Últimas transações realizadas.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[450px] overflow-y-auto custom-scrollbar">
               {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                ) : (
                  <TransactionList transactions={filteredOrdersByPeriod} />
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  )
}

function TransactionList({ transactions }: { transactions: any[] }) {
  if (transactions.length === 0) return (
    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
      <FileText className="h-12 w-12 text-primary/10 mb-4" />
      <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Sem registros no período</p>
    </div>
  )
  
  return (
    <div className="divide-y divide-primary/5">
      {transactions.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-6 hover:bg-secondary/10 transition-colors group">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${item.paymentStatus === 'Pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
               {item.paymentStatus === 'Pago' ? <ArrowUpRight className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">{item.clientName}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                {item.createdAt ? format(new Date(item.createdAt.seconds * 1000), "dd/MM/yy") : 'Hoje'} • {item.paymentMethod?.toUpperCase() || 'PAGTO'}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`font-black text-base ${item.paymentStatus === 'Pago' ? 'text-emerald-500' : 'text-foreground'}`}>
              R$ {item.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${item.paymentStatus === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {item.paymentStatus}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
