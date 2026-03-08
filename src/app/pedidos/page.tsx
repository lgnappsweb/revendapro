
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
  Receipt
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

  const getPaymentIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'pix': return <Smartphone className="h-3 w-3 text-emerald-500" />;
      case 'dinheiro': return <Banknote className="h-3 w-3 text-emerald-500" />;
      case 'cartao': return <CreditCard className="h-3 w-3 text-blue-500" />;
      case 'fiado': return <AlertTriangle className="h-3 w-3 text-amber-500" />;
      default: return <CreditCard className="h-3 w-3" />;
    }
  }

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-10 pt-16 w-full max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-primary text-center break-words w-full px-2 uppercase">
              Meus Pedidos
            </h1>
            <p className="text-muted-foreground font-medium text-lg text-center">Histórico completo de todas as vendas realizadas.</p>
          </div>
        </div>

        <div className="relative w-full px-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por cliente ou ID..." 
            className="h-14 pl-12 rounded-2xl border border-primary/30 shadow-sm bg-card text-base focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full overflow-x-hidden px-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="font-bold text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
               <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <PackageSearch className="h-16 w-16 text-primary/20 mb-4" />
                <h3 className="text-xl font-bold text-foreground">Nenhum pedido encontrado</h3>
                <p className="text-muted-foreground font-medium max-w-xs mt-2">
                  As vendas que você finalizar aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-[2.5rem] border-primary/20 overflow-hidden shadow-sm">
              <CardHeader className="bg-primary/5 border-b px-8 py-6">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                   <Receipt className="h-6 w-6" /> Lista de Pedidos
                </CardTitle>
                <CardDescription className="font-medium">Confira os detalhes de cada transação realizada.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Mobile View: Cards */}
                <div className="grid gap-4 md:hidden w-full p-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="rounded-3xl border-primary/20 shadow-sm overflow-hidden w-full">
                      <CardContent className="p-4 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                            <span className="font-bold text-lg text-foreground block break-words">{order.clientName}</span>
                            <span className="text-xs text-muted-foreground font-medium">
                              {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Recentemente'}
                            </span>
                          </div>
                          <Badge 
                            className={`rounded-lg font-bold px-3 py-1 shrink-0 ${
                              order.paymentStatus === "Pago" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-primary/5 pt-3">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-muted-foreground uppercase">Valor Total</span>
                            <span className="text-lg font-black text-primary truncate">
                              R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-xl font-bold bg-secondary/50 hover:bg-primary hover:text-white transition-all shrink-0 h-10 px-4"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block w-full">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-none h-14">
                        <TableHead className="px-8 font-black text-muted-foreground uppercase tracking-widest text-xs">Informações do Pedido</TableHead>
                        <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs text-center">Data</TableHead>
                        <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs text-center">Status</TableHead>
                        <TableHead className="font-black text-muted-foreground uppercase tracking-widest text-xs text-right">Valor Final</TableHead>
                        <TableHead className="px-8 text-right font-black text-muted-foreground uppercase tracking-widest text-xs">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="group hover:bg-secondary/10 transition-colors border-b last:border-0 border-primary/5 h-24">
                          <TableCell className="px-8">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-primary/10">
                                  <AvatarFallback className="bg-secondary text-primary font-bold">
                                    {order.clientName.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-foreground group-hover:text-primary transition-colors text-base truncate max-w-[200px]">{order.clientName}</span>
                                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 uppercase tracking-tight">
                                    {getPaymentIcon(order.paymentMethod)} {order.paymentMethod}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-muted-foreground text-sm">
                              {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Hoje'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              className={`rounded-lg font-bold px-3 py-1 border-none ${
                                order.paymentStatus === "Pago" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {order.paymentStatus.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-black text-primary text-xl tracking-tight">
                                R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-8 text-right">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-xl font-bold bg-secondary/50 hover:bg-primary hover:text-white transition-all h-10 px-4"
                            >
                              Detalhes <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
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

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-3xl border-primary overflow-hidden p-0 flex flex-col max-h-[90vh]">
          {selectedOrder && (
            <>
              <div className="p-8 border-b bg-card">
                <DialogHeader className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-3xl">
                      <ShoppingCart className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <DialogTitle className="text-2xl sm:text-3xl font-black text-center text-primary leading-tight">
                    Pedido #{selectedOrder.id.slice(-6).toUpperCase()}
                  </DialogTitle>
                  <div className="flex items-center justify-center gap-3">
                    <Badge variant="secondary" className="bg-pink-100 text-primary font-bold border-none rounded-lg px-3 py-1">
                      {selectedOrder.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto bg-background p-6 sm:p-8 space-y-8">
                <div className="flex flex-col gap-4">
                  <div className="bg-card p-5 rounded-2xl border border-primary/10 shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Cliente</span>
                    <span className="text-lg font-bold text-foreground break-words">{selectedOrder.clientName}</span>
                  </div>
                  <div className="bg-card p-5 rounded-2xl border border-primary/10 shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Pagamento</span>
                    <span className="text-lg font-bold text-foreground capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                    <PackageSearch className="h-5 w-5" /> Itens Vendidos
                  </h4>
                  <Separator className="bg-primary/10" />
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-card rounded-xl border border-primary/5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.productName}</span>
                          <span className="text-xs text-muted-foreground">{item.quantity}un x R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <span className="font-black text-sm">R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary text-white p-6 rounded-3xl shadow-lg space-y-2">
                  <div className="flex justify-between items-center opacity-80 text-xs font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>R$ {selectedOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center opacity-80 text-xs font-bold uppercase tracking-widest">
                    <span>Desconto</span>
                    <span>R$ {selectedOrder.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-black text-lg">Total Final</span>
                    <span className="text-2xl font-black">R$ {selectedOrder.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card border-t">
                <Button 
                  onClick={() => setSelectedOrder(null)} 
                  className="w-full h-14 rounded-2xl font-bold text-lg primary-gradient shadow-xl"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </LayoutWrapper>
  )
}
