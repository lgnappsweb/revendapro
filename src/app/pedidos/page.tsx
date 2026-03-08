
"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ShoppingCart, 
  MoreVertical, 
  Loader2, 
  PackageSearch,
  ChevronRight,
  CreditCard,
  Banknote,
  Smartphone,
  AlertTriangle,
  Sparkles,
  Receipt,
  Package,
  Calendar,
  Clock,
  User
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const db = useFirestore()

  const ordersRef = useMemoFirebase(() => 
    query(collection(db, "orders"), orderBy("createdAt", "desc")), 
    [db]
  )
  const { data: orders, isLoading } = useCollection(ordersRef)

  const filteredOrders = orders?.filter(order => 
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-primary uppercase text-center">
              Meus Pedidos
            </h1>
            <p className="text-muted-foreground font-medium text-lg">Histórico completo das vendas.</p>
          </div>
        </div>

        <div className="relative w-full px-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por cliente ou ID..." 
            className="h-14 pl-12 rounded-2xl border border-primary/30 shadow-sm bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full overflow-x-hidden px-1">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : filteredOrders.length === 0 ? (
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                   <Receipt className="h-6 w-6" /> Pedidos
                </CardTitle>
              </CardHeader>
               <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <PackageSearch className="h-16 w-16 text-primary/20 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum pedido encontrado.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                   <Receipt className="h-6 w-6" /> Lista de Pedidos
                </CardTitle>
                <CardDescription className="font-medium">Confira os detalhes das vendas realizadas.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid gap-4 md:hidden w-full p-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="rounded-3xl border-primary/10 shadow-sm overflow-hidden w-full">
                      <CardContent className="p-4 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                            <span className="font-bold text-lg text-foreground block break-words">{order.clientName}</span>
                          </div>
                          <Badge className={`rounded-lg font-bold px-2 py-0.5 shrink-0 ${order.paymentStatus === "Pago" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-lg font-black text-primary">R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)} className="rounded-xl font-bold bg-secondary/50 h-10 px-4">Detalhes</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="hidden md:block w-full">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none h-14">
                        <TableHead className="px-8 font-black text-muted-foreground uppercase tracking-widest text-[10px]">Informações</TableHead>
                        <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px] text-center">Data</TableHead>
                        <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px] text-center">Status</TableHead>
                        <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-[10px] text-right">Valor Final</TableHead>
                        <TableHead className="px-8 text-right font-black text-muted-foreground uppercase tracking-widest text-[10px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="group hover:bg-secondary/10 transition-colors border-b last:border-0 border-primary/5 h-20">
                          <TableCell className="px-8">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-primary/10">
                                <AvatarFallback className="bg-secondary text-primary font-bold">{order.clientName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]">{order.clientName}</span>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-muted-foreground text-sm">
                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Hoje'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`rounded-lg font-bold px-3 py-1 border-none ${order.paymentStatus === "Pago" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {order.paymentStatus.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-black text-primary text-xl tracking-tight">R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)} className="rounded-xl font-bold bg-secondary/50 h-10 px-4">Detalhes <ChevronRight className="ml-1 h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-3xl border-primary overflow-hidden p-0 flex flex-col max-h-[90vh]">
          {selectedOrder && (
            <>
              <div className="p-8 border-b bg-card">
                <DialogHeader className="space-y-4">
                  <DialogTitle className="text-2xl font-black text-center text-primary uppercase">Pedido #{selectedOrder.id.slice(-6).toUpperCase()}</DialogTitle>
                </DialogHeader>
              </div>
              <div className="flex-1 overflow-y-auto bg-background p-6 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card p-5 rounded-2xl border border-primary/10 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary">
                      <User className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Cliente</span>
                    </div>
                    <span className="text-lg font-bold text-foreground truncate">{selectedOrder.clientName}</span>
                  </div>
                  <div className="bg-card p-5 rounded-2xl border border-primary/10 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Data do Pedido</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Hoje'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-5 w-5" />
                    <h4 className="font-bold text-lg uppercase tracking-tight">Itens do Pedido</h4>
                  </div>
                  <Separator className="bg-primary/10" />
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-card border border-primary/5 hover:border-primary/20 transition-all">
                        <div className="flex flex-col min-w-0 pr-4">
                          <span className="font-bold text-sm truncate">{item.productName}</span>
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                            {item.quantity}un x R$ {Number(item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <span className="font-black text-primary shrink-0">
                          R$ {Number(item.subtotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card p-5 rounded-2xl border border-primary/10 shadow-sm space-y-4">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Informações de Pagamento</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-bold text-muted-foreground uppercase">Método</span>
                         <span className="font-black uppercase text-xs">{selectedOrder.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col text-right">
                         <span className="text-[9px] font-bold text-muted-foreground uppercase">Status</span>
                         <span className={`font-black uppercase text-xs ${selectedOrder.paymentStatus === 'Pago' ? 'text-emerald-500' : 'text-amber-500'}`}>
                           {selectedOrder.paymentStatus}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="bg-primary text-white p-6 rounded-[2rem] shadow-xl space-y-4">
                  <div className="flex justify-between items-center opacity-80 text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal Bruto</span>
                    <span>R$ {selectedOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between items-center text-pink-200 text-[10px] font-black uppercase tracking-widest">
                      <span>Desconto Aplicado</span>
                      <span>- R$ {selectedOrder.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <Separator className="bg-white/20" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-black text-lg uppercase tracking-tighter">Total do Pedido</span>
                    <span className="text-3xl font-black">R$ {selectedOrder.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-card border-t">
                <Button onClick={() => setSelectedOrder(null)} className="w-full h-16 rounded-2xl font-black text-xl primary-gradient shadow-xl active:scale-95 transition-all">
                  FECHAR DETALHES
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </LayoutWrapper>
  )
}
