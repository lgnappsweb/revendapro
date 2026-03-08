
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  MoreVertical, 
  Loader2, 
  PackageSearch,
  ChevronRight,
  CreditCard,
  Banknote,
  Smartphone,
  AlertTriangle,
  Receipt,
  Package,
  Calendar,
  User,
  Info,
  Trash2,
  Eye,
  Pencil,
  Save,
  DollarSign
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, orderBy, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function OrdersPage() {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderToDelete, setOrderToDelete] = useState<any>(null)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const db = useFirestore()
  const { toast } = useToast()

  const ordersRef = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "orders"), orderBy("createdAt", "desc"))
  }, [db, user])
  const { data: orders, isLoading } = useCollection(ordersRef)

  const [editFormData, setEditFormData] = useState({
    paymentStatus: "",
    paymentMethod: "",
    notes: "",
    discount: 0,
    date: ""
  })

  const filteredOrders = orders?.filter(order => 
    order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleOpenEdit = (order: any) => {
    if (isProcessing) return
    setEditingOrder(order)
    setEditFormData({
      paymentStatus: order.paymentStatus || "Pendente",
      paymentMethod: order.paymentMethod || "pix",
      notes: order.notes || "",
      discount: order.discount || 0,
      date: order.createdAt?.seconds 
        ? new Date(order.createdAt.seconds * 1000).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0]
    })
  }

  const handleSaveEdit = async () => {
    if (!editingOrder || isProcessing) return
    setIsProcessing(true)
    
    const currentOrder = editingOrder
    const docRef = doc(db, "orders", currentOrder.id)
    const subtotal = currentOrder.total || 0
    const newFinalTotal = Math.max(0, subtotal - Number(editFormData.discount))

    const updateData: any = {
      paymentStatus: editFormData.paymentStatus,
      paymentMethod: editFormData.paymentMethod,
      notes: editFormData.notes,
      discount: Number(editFormData.discount),
      finalTotal: newFinalTotal,
      updatedAt: serverTimestamp()
    }

    if (editFormData.date) {
      updateData.createdAt = new Date(editFormData.date)
    }

    try {
      await updateDoc(docRef, updateData)
      toast({ title: "Pedido atualizado!" })
      setEditingOrder(null)
    } catch (error: any) {
      console.error("Erro ao salvar pedido:", error)
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: updateData
      }))
      toast({ title: "Erro ao salvar", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete || isProcessing) return
    setIsProcessing(true)
    const orderId = orderToDelete.id
    setOrderToDelete(null)

    try {
      const docRef = doc(db, "orders", orderId)
      await deleteDoc(docRef)
      toast({ title: "Pedido removido!" })
    } catch (error: any) {
      console.error("Erro ao excluir pedido:", error)
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `orders/${orderId}`,
        operation: 'delete'
      }))
      toast({ title: "Erro ao excluir", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'pix': return <Smartphone className="h-4 w-4" />
      case 'cartao': return <CreditCard className="h-4 w-4" />
      case 'dinheiro': return <Banknote className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <LayoutWrapper>
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 border-2 border-primary">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-black text-primary uppercase tracking-widest text-sm animate-pulse">Processando...</p>
          </div>
        </div>
      )}

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
                          <div className="flex items-center gap-2">
                            <Badge className={`rounded-lg font-bold px-2 py-0.5 shrink-0 ${order.paymentStatus === "Pago" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {order.paymentStatus}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={isProcessing}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem 
                                  className="font-bold gap-2" 
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedOrder(order);
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-blue-500" /> Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="font-bold gap-2" 
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleOpenEdit(order);
                                  }}
                                >
                                  <Pencil className="h-4 w-4 text-amber-500" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="font-bold gap-2 text-rose-600" 
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setOrderToDelete(order);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                          <span className="text-lg font-black text-primary">R$ {order.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)} className="rounded-xl font-bold bg-secondary/50 h-10 px-4" disabled={isProcessing}>Detalhes</Button>
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
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)} className="rounded-xl font-bold bg-secondary/50 h-10 px-4" disabled={isProcessing}>Detalhes <ChevronRight className="ml-1 h-4 w-4" /></Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" disabled={isProcessing}>
                                    <MoreVertical className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">
                                  <DropdownMenuItem 
                                    className="font-bold gap-2" 
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setSelectedOrder(order);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 text-blue-500" /> Visualizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="font-bold gap-2" 
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      handleOpenEdit(order);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 text-amber-500" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="font-bold gap-2 text-rose-600" 
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setOrderToDelete(order);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
                      <Info className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Informações de Pagamento</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-muted-foreground uppercase">Método</span>
                         <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-primary/5 rounded-lg text-primary">{getMethodIcon(selectedOrder.paymentMethod)}</div>
                           <span className="font-black uppercase text-xs">{selectedOrder.paymentMethod || 'N/A'}</span>
                         </div>
                      </div>
                      <div className="flex flex-col text-right gap-1">
                         <span className="text-[9px] font-bold text-muted-foreground uppercase">Status</span>
                         <span className={`font-black uppercase text-xs px-2 py-1 rounded-lg w-fit ml-auto ${selectedOrder.paymentStatus === 'Pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
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

      <Dialog open={!!editingOrder} onOpenChange={(open) => !isProcessing && setEditingOrder(null)}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl border-primary overflow-hidden p-0 flex flex-col max-h-[90vh]">
          {editingOrder && (
            <>
              <div className="p-8 border-b bg-card">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-center text-primary uppercase">Editar Pedido</DialogTitle>
                </DialogHeader>
              </div>
              <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6">
                <div className="bg-muted/10 p-4 rounded-2xl border border-primary/5 mb-2">
                   <div className="flex items-center gap-2 text-primary mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Cliente</span>
                   </div>
                   <p className="font-bold text-lg">{editingOrder.clientName}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-muted-foreground ml-1">Data da Venda</Label>
                    <Input 
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                      className="rounded-xl h-12 bg-card border-primary/30 font-bold"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-muted-foreground ml-1">Desconto (R$)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-black text-sm">R$</span>
                      <Input 
                        type="number"
                        value={editFormData.discount}
                        onChange={(e) => setEditFormData({...editFormData, discount: Number(e.target.value)})}
                        className="rounded-xl h-12 bg-card border-primary/30 pl-10 font-bold"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-muted-foreground ml-1">Status do Pagamento</Label>
                    <Select 
                      value={editFormData.paymentStatus} 
                      onValueChange={(v) => setEditFormData({...editFormData, paymentStatus: v})}
                      disabled={isProcessing}
                    >
                      <SelectTrigger className="rounded-xl h-12 bg-card border-primary/30 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Pago" className="font-bold text-emerald-600">PAGO</SelectItem>
                        <SelectItem value="Pendente" className="font-bold text-amber-600">PENDENTE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-bold text-muted-foreground ml-1">Método de Pagamento</Label>
                    <Select 
                      value={editFormData.paymentMethod} 
                      onValueChange={(v) => setEditFormData({...editFormData, paymentMethod: v})}
                      disabled={isProcessing}
                    >
                      <SelectTrigger className="rounded-xl h-12 bg-card border-primary/30 font-bold uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">DINHEIRO</SelectItem>
                        <SelectItem value="cartao">CARTÃO</SelectItem>
                        <SelectItem value="fiado">FIADO / OUTRO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-bold text-muted-foreground ml-1">Observações / Notas</Label>
                  <Textarea 
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    placeholder="Alguma nota sobre este pedido..."
                    className="rounded-xl border-primary/30 min-h-[100px] bg-card"
                    disabled={isProcessing}
                  />
                </div>

                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-primary">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Novo Total Final</span>
                   </div>
                   <span className="text-xl font-black text-primary">
                     R$ {(editingOrder.total - editFormData.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </span>
                </div>
              </div>
              <div className="p-6 bg-card border-t">
                <Button 
                  onClick={handleSaveEdit} 
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl font-black text-xl primary-gradient shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                  {isProcessing ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!orderToDelete} onOpenChange={(o) => !isProcessing && setOrderToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-primary uppercase">Excluir Pedido?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-muted-foreground">
              Tem certeza que deseja remover o pedido de <b className="text-foreground">{orderToDelete?.clientName}</b>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold" disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrder} 
              disabled={isProcessing}
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700"
            >
              {isProcessing ? "Excluindo..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutWrapper>
  )
}
