
"use client"

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
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function FinancePage() {
  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-10 pt-12 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary text-center break-words w-full px-2 uppercase">
              Gestão Financeira
            </h1>
            <p className="text-muted-foreground font-medium text-lg text-center">Controle total de entradas, pendentes e lucros.</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" className="rounded-xl font-bold h-11 border-primary text-primary hover:bg-primary/5">
              <Download className="mr-2 h-4 w-4" /> Exportar
            </Button>
            <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 h-11 px-6 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Registrar Entrada
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-1">
          {[
            { title: "Saldo Disponível", value: "R$ 3.240,00", color: "text-emerald-600", bg: "bg-emerald-50", icon: DollarSign },
            { title: "Contas a Receber", value: "R$ 1.150,00", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
            { title: "Total Vencido", value: "R$ 380,00", color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle },
            { title: "Lucro Estimado", value: "R$ 1.420,00", color: "text-primary", bg: "bg-primary/5", icon: TrendingUp },
          ].map((stat, i) => (
            <Card key={i} className="shadow-sm rounded-3xl overflow-hidden border-primary/20 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-lg font-bold">+4.2%</Badge>
                </div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 px-1">
          <Card className="lg:col-span-2 shadow-sm rounded-3xl overflow-hidden border-primary/20 bg-white">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b bg-white/50">
              <CardTitle className="text-xl">Histórico de Transações</CardTitle>
              <div className="flex gap-2">
                <Tabs defaultValue="todos">
                  <TabsList className="bg-muted/50 rounded-xl h-9">
                    <TabsTrigger value="todos" className="text-xs font-bold rounded-lg px-3">Todos</TabsTrigger>
                    <TabsTrigger value="entradas" className="text-xs font-bold rounded-lg px-3">Entradas</TabsTrigger>
                    <TabsTrigger value="pendentes" className="text-xs font-bold rounded-lg px-3">Pendentes</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-primary/5">
                {[
                  { name: "Venda #1234 - Maria Silva", type: "entrada", value: "R$ 180,00", date: "Hoje, 14:20", status: "Confirmado" },
                  { name: "Venda #1235 - Ana Oliveira", type: "pendente", value: "R$ 350,00", date: "Ontem, 09:15", status: "Aguardando" },
                  { name: "Venda #1232 - Juliana Costa", type: "vencido", value: "R$ 95,50", date: "10 Mar, 2024", status: "Atrasado" },
                  { name: "Venda #1231 - Fernanda Santos", type: "entrada", value: "R$ 220,00", date: "09 Mar, 2024", status: "Confirmado" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/10 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-2.5 rounded-full shrink-0 ${
                        item.type === 'entrada' ? 'bg-emerald-100 text-emerald-600' : 
                        item.type === 'vencido' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {item.type === 'entrada' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black text-lg ${item.type === 'entrada' ? 'text-emerald-600' : 'text-foreground'}`}>{item.value}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm rounded-3xl overflow-hidden border-primary/20 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Metas do Mês</CardTitle>
                <CardDescription className="font-medium">Acompanhe seu progresso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Meta de Vendas</span>
                    <span className="text-primary">R$ 4.250 / R$ 6.000</span>
                  </div>
                  <Progress value={70} className="h-3 bg-muted/50" />
                  <p className="text-xs text-muted-foreground font-medium text-right">Faltam R$ 1.750 para bater a meta!</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Meta de Cobrança</span>
                    <span className="text-emerald-600">72% Recebido</span>
                  </div>
                  <Progress value={72} className="h-3 bg-muted/50" />
                  <p className="text-xs text-muted-foreground font-medium text-right">R$ 3.100 recebidos de R$ 4.250</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 rounded-3xl overflow-hidden border-primary/10">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-black text-primary flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Projeção Mensal
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Baseado no seu ritmo atual, você deve fechar o mês com <b>R$ 5.800</b> em vendas, um aumento de <b>15%</b>.
                </p>
                <Button className="w-full rounded-xl font-bold primary-gradient shadow-lg">Ver Projeção Detalhada</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}
