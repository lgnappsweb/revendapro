"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2,
  AlertCircle,
  Search,
  Loader2,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function Dashboard() {
  const db = useFirestore()

  const ordersRef = useMemoFirebase(() => collection(db, "orders"), [db])
  const { data: allOrders } = useCollection(ordersRef)

  const recentOrdersRef = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5)), 
    [db]
  )
  const { data: recentOrders, isLoading: loadingOrders } = useCollection(recentOrdersRef)

  const clientsRef = useMemoFirebase(() => collection(db, "clients"), [db])
  const { data: clients } = useCollection(clientsRef)

  const totalSales = allOrders?.reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0
  const totalReceived = allOrders?.filter(o => o.paymentStatus === 'Pago').reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0
  const totalPending = allOrders?.filter(o => o.paymentStatus === 'Pendente').reduce((acc, o) => acc + (o.finalTotal || 0), 0) || 0
  const clientsCount = clients?.length || 0

  const stats = [
    {
      title: "Vendas Totais",
      value: `R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "Faturamento Bruto",
      trend: "up",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      href: "/pedidos"
    },
    {
      title: "Recebido",
      value: `R$ ${totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "Pagamentos Confirmados",
      trend: "neutral",
      icon: CheckCircle2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/financeiro"
    },
    {
      title: "Pendente",
      value: `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: "Vendas em Aberto",
      trend: "down",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      href: "/financeiro"
    },
    {
      title: "Total Clientes",
      value: clientsCount.toString(),
      change: "Base de Contatos",
      trend: "up",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/clientes"
    },
  ]

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-10 pt-12 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary">RevendaPro</h1>
            <p className="text-muted-foreground font-bold text-lg">Aqui está o resumo da sua revenda hoje.</p>
          </div>
          
          <div className="relative w-full max-w-2xl px-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar pedidos, clientes ou metas..." 
              className="h-14 pl-12 rounded-2xl border border-primary/20 shadow-sm bg-card text-base focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href} className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Card className="shadow-sm overflow-hidden rounded-3xl h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    {stat.trend === "up" && (
                      <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-black rounded-lg py-1 px-2 uppercase text-[10px]">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> Ativo
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                    <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                    <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tight">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 px-1">
          <Card className="lg:col-span-2 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-6 py-5">
              <div className="space-y-1">
                <CardTitle className="text-xl">Pedidos Recentes</CardTitle>
                <CardDescription>Acompanhe suas últimas vendas realizadas.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl text-primary font-black uppercase text-xs" asChild>
                <Link href="/pedidos">Ver todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOrders ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-6 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Cliente</TableHead>
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Data</TableHead>
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px] text-right">Valor</TableHead>
                      <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Status</TableHead>
                      <TableHead className="px-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders?.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer group hover:bg-muted/50 transition-colors border-b border-muted/20 last:border-0">
                        <TableCell className="px-6 py-4">
                          <span className="font-black text-foreground group-hover:text-primary transition-colors text-sm">{order.clientName}</span>
                          <div className="text-[10px] text-muted-foreground font-bold mt-0.5">#{order.id.slice(-6).toUpperCase()}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-bold text-xs">
                          {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Hoje'}
                        </TableCell>
                        <TableCell className="text-right font-black text-foreground text-sm">
                          R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`rounded-lg font-black px-2 py-1 text-[10px] uppercase border-none ${
                              order.paymentStatus === "Pago" 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                            <Link href="/pedidos">
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                {[
                  { name: "Kaiak Aventura", brand: "Natura", count: 12, value: "R$ 1.200" },
                  { name: "Batom Matte Avon", brand: "Avon", count: 8, value: "R$ 240" },
                  { name: "Creme Tododia", brand: "Natura", count: 6, value: "R$ 300" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/20 text-primary font-black">
                      {i + 1}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-black">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.brand}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-foreground">{item.count} un</span>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{item.value}</div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full rounded-2xl border-dashed font-black uppercase text-xs mt-2 hover:bg-primary/5 hover:text-primary hover:border-primary" asChild>
                  <Link href="/pedidos">Ver Histórico Completo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-rose-500/10 rounded-3xl shadow-sm border-l-4 border-rose-500">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-2 bg-rose-500/20 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-rose-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-rose-500 uppercase text-sm tracking-tight">Alerta de Pagamento</h4>
                  <p className="text-xs text-muted-foreground leading-tight font-bold">Você possui pagamentos pendentes que podem ser acompanhados no financeiro.</p>
                  <Button variant="link" className="p-0 h-auto text-rose-500 font-black uppercase text-[10px] underline decoration-2" asChild>
                    <Link href="/financeiro">Ir para Financeiro</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
