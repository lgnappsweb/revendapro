
"use client"

import { useMemo } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2,
  Search,
  Loader2,
  ChevronRight,
  Package,
  ShoppingBag,
  AlertCircle,
  Sparkles
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

  const topProducts = useMemo(() => {
    if (!allOrders) return [];
    const stats: Record<string, { name: string; count: number; value: number }> = {};
    allOrders.forEach(order => {
      order.items?.forEach((item: any) => {
        const name = item.productName || "Produto";
        if (!stats[name]) stats[name] = { name, count: 0, value: 0 };
        stats[name].count += (item.quantity || 0);
        stats[name].value += (item.subtotal || 0);
      });
    });
    return Object.values(stats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [allOrders]);

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
      <div className="flex flex-col gap-6 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl primary-gradient text-white shadow-xl animate-in zoom-in-95 duration-500">
              <Sparkles className="h-10 w-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">RevendaPro</h1>
              <p className="text-muted-foreground font-bold text-lg">Resumo da sua revenda hoje.</p>
            </div>
          </div>
          
          <div className="relative w-full max-w-2xl px-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar pedidos ou clientes..." 
              className="h-14 pl-12 rounded-2xl border border-primary/20 shadow-sm bg-card text-base focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href} className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Card className="shadow-sm overflow-hidden rounded-[2rem] h-full border-primary/10">
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
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                    <h3 className="text-xl font-black">{stat.value}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 px-1">
          <Card className="lg:col-span-2 shadow-sm rounded-[2.5rem] overflow-hidden border-primary/10">
            <CardHeader className="bg-primary/5 border-b px-8 py-6 flex flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl text-primary font-black uppercase tracking-tight">Pedidos Recentes</CardTitle>
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
              ) : recentOrders?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/20 mb-2" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Sem pedidos ainda</p>
                </div>
              ) : (
                <>
                  <div className="md:hidden divide-y divide-primary/5">
                    {recentOrders?.map((order) => (
                      <Link key={order.id} href="/pedidos" className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col min-w-0 pr-4">
                          <span className="font-black text-foreground text-sm truncate">{order.clientName}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">
                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Hoje'}
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-black text-primary text-sm">R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <Badge 
                            className={`rounded-lg font-black px-1.5 py-0 text-[8px] uppercase border-none ${
                              order.paymentStatus === "Pago" 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="px-8 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Cliente</TableHead>
                          <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Data</TableHead>
                          <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px] text-right">Valor</TableHead>
                          <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Status</TableHead>
                          <TableHead className="px-8"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrders?.map((order) => (
                          <TableRow key={order.id} className="cursor-pointer group hover:bg-muted/50 transition-colors border-b border-muted/20 last:border-0">
                            <TableCell className="px-8 py-5">
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
                            <TableCell className="px-8 text-right">
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
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm rounded-[2.5rem] overflow-hidden border-primary/10">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-lg text-primary font-black flex items-center gap-2 uppercase tracking-tight">
                  <ShoppingBag className="h-5 w-5" />
                  Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-8">
                {topProducts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Aguardando vendas...</p>
                  </div>
                ) : (
                  topProducts.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/20 text-primary font-black">
                        {i + 1}
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <span className="text-sm font-black truncate">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">DADOS REAIS</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-foreground">{item.count} un</span>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                          R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full rounded-2xl border-dashed font-black uppercase text-[10px] mt-2 hover:bg-primary/5 hover:text-primary hover:border-primary h-12" asChild>
                  <Link href="/pedidos">Ver Histórico</Link>
                </Button>
              </CardContent>
            </Card>

            {totalPending > 0 ? (
              <Card className="bg-rose-500/10 rounded-[2.5rem] shadow-sm border-l-4 border-rose-500 overflow-hidden">
                <CardContent className="p-8 flex items-start gap-4">
                  <div className="p-3 bg-rose-500/20 rounded-xl shrink-0">
                    <AlertCircle className="h-6 w-6 text-rose-500" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-black text-rose-500 uppercase text-xs tracking-tight">Pagamentos Pendentes</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight font-bold">
                      Existem R$ {totalPending.toLocaleString('pt-BR')} em aberto.
                    </p>
                    <Button variant="link" className="p-0 h-auto text-rose-500 font-black uppercase text-[10px] underline decoration-2" asChild>
                      <Link href="/financeiro">Ver Detalhes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-emerald-500/10 rounded-[2.5rem] shadow-sm border-l-4 border-emerald-500 overflow-hidden">
                <CardContent className="p-8 flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-black text-emerald-500 uppercase text-xs tracking-tight">Tudo em Dia!</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight font-bold">Excelente! Não há cobranças pendentes no momento.</p>
                    <Button variant="link" className="p-0 h-auto text-emerald-500 font-black uppercase text-[10px] underline decoration-2" asChild>
                      <Link href="/financeiro">Relatório Completo</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
