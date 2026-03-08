
"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Search
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

const stats = [
  {
    title: "Vendas do Mês",
    value: "R$ 4.250,00",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Recebido",
    value: "R$ 3.100,00",
    change: "72% do total",
    trend: "neutral",
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Pendente (Fiado)",
    value: "R$ 1.150,00",
    change: "28% do total",
    trend: "down",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Total Clientes",
    value: "42",
    change: "+3 este mês",
    trend: "up",
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
]

const recentOrders = [
  {
    id: "1234",
    customer: "Maria Silva",
    date: "12 Mar, 2024",
    amount: "R$ 180,00",
    status: "Pago",
    method: "Pix",
  },
  {
    id: "1235",
    customer: "Ana Oliveira",
    date: "11 Mar, 2024",
    amount: "R$ 350,00",
    status: "Pendente",
    method: "Fiado",
  },
  {
    id: "1236",
    customer: "Juliana Costa",
    date: "10 Mar, 2024",
    amount: "R$ 95,50",
    status: "Atrasado",
    method: "Fiado",
  },
  {
    id: "1237",
    customer: "Fernanda Santos",
    date: "09 Mar, 2024",
    amount: "R$ 220,00",
    status: "Pago",
    method: "Dinheiro",
  },
]

export default function Dashboard() {
  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Olá, Bem-vinda! 👋</h1>
            <p className="text-muted-foreground font-medium">Aqui está o resumo da sua revenda hoje.</p>
          </div>
          
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar pedidos, clientes ou metas..." 
              className="h-12 pl-10 rounded-2xl border-none shadow-sm bg-white"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-none shadow-sm overflow-hidden rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  {stat.trend === "up" && (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold rounded-lg py-1 px-2">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> {stat.change}
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-white/50 px-6 py-5">
              <div className="space-y-1">
                <CardTitle className="text-xl">Pedidos Recentes</CardTitle>
                <CardDescription>Acompanhe suas últimas vendas realizadas.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl text-primary font-semibold">Ver todos</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 font-bold text-muted-foreground">Cliente</TableHead>
                    <TableHead className="font-bold text-muted-foreground">Data</TableHead>
                    <TableHead className="font-bold text-muted-foreground text-right">Valor</TableHead>
                    <TableHead className="font-bold text-muted-foreground">Status</TableHead>
                    <TableHead className="px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer group hover:bg-secondary/20 transition-colors">
                      <TableCell className="px-6">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{order.customer}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">#{order.id}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">{order.date}</TableCell>
                      <TableCell className="text-right font-bold text-foreground">{order.amount}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`rounded-lg font-bold px-2 py-1 ${
                            order.status === "Pago" 
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" 
                            : order.status === "Atrasado"
                            ? "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200"
                            : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary font-bold">
                      {i + 1}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-bold">{item.name}</span>
                      <span className="text-xs text-muted-foreground font-medium">{item.brand}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground">{item.count} un</span>
                      <div className="text-[10px] text-muted-foreground font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full rounded-xl border-dashed font-semibold mt-2 hover:bg-primary/5 hover:text-primary hover:border-primary">Ver Relatório Completo</Button>
              </CardContent>
            </Card>

            <Card className="border-none bg-rose-50 rounded-2xl shadow-sm border-l-4 border-rose-500">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-900">Alerta de Pagamento</h4>
                  <p className="text-sm text-rose-800 leading-tight">Você tem <b>3 pagamentos</b> vencidos de clientes que precisam de atenção.</p>
                  <Button variant="link" className="p-0 h-auto text-rose-700 font-bold underline decoration-2">Ver Detalhes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
