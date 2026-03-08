
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
    if (o.paymentStatus !== 'Pendente' || !o.dueDate || !currentDate) return false
    const dDate = o.dueDate.seconds ? new Date(o.dueDate.seconds * 1000) : new Date(o.dueDate)
    return dDate < currentDate
  }).reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0

  const stats = [
    { title: "Recebido", value: totalReceived, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: DollarSign },
    { title: "Pendente", value: totalPending, color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
    { title: "Vencido", value: totalOverdue, color: "text-rose-500", bg: "bg-rose-500/10", icon: AlertCircle },
    { title: "Total", value: totalReceived + totalPending, color: "text-primary", bg: "bg-primary/10", icon: TrendingUp },
  ]

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">
              Financeiro
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Controle de entradas e pendentes.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md px-4">
             <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full rounded-xl font-bold border-primary/20 bg-card h-12">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="hoje">{todayLabel}</SelectItem>
                  <SelectItem value="mes">{monthLabel}</SelectItem>
                  <SelectItem value="todos">Todo o Período</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
          {stats.map((stat, i) => (
            <Card key={i} className="shadow-sm rounded-[2rem] border-primary/10">
              <CardContent className="p-6">
                <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-4`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <h3 className={`text-xl font-black mt-1 ${stat.color}`}>R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 px-1">
          <Card className="lg:col-span-2 shadow-sm rounded-[2.5rem] overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 border-b px-8 py-6">
               <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
  if (transactions.length === 0) return <div className="py-20 text-center text-muted-foreground font-bold uppercase text-[10px]">Sem registros</div>
  return (
    <div className="divide-y divide-primary/5">
      {transactions.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-6 hover:bg-secondary/10 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg shrink-0 ${item.paymentStatus === 'Pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
               {item.paymentStatus === 'Pago' ? <ArrowUpRight className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{item.clientName}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                {item.createdAt ? format(new Date(item.createdAt.seconds * 1000), "dd/MM/yy") : 'Hoje'}
              </p>
            </div>
          </div>
          <p className={`font-black text-base ${item.paymentStatus === 'Pago' ? 'text-emerald-500' : 'text-foreground'}`}>
            R$ {item.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </div>
  )
}
