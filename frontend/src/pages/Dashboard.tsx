import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  CreditCard,
  Truck,
  FileText,
  Plus,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  DollarSign,
  ChevronDown,
  Download,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DBOrderItem {
  id: string;
  quantity: number;
  unitPriceUsd: string;
  totalPriceUsd: string;
  Product: {
    id: string;
    name: string;
    sku: string;
  };
}

interface DBInstallment {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amountUsd: string;
  amountBs: string;
  status: "pendiente" | "pagado" | "vencido";
}

interface DBPayment {
  id: string;
  paymentType: "efectivo" | "transferencia" | "pago_movil";
  referenceNumber: string;
  amountUsd: string;
  amountBs: string;
  status: "pendiente" | "confirmado" | "rechazado";
  paidAt: string;
}

interface DBShipment {
  id: string;
  status: "preparando" | "enviado" | "en_transito" | "entregado";
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
}

interface DBOrder {
  id: string;
  invoiceNumber: string;
  status: "pendiente" | "pagado" | "preparando_envio" | "enviado" | "entregado" | "cancelado";
  subtotalUsd: string;
  taxUsd: string;
  shippingUsd: string;
  totalUsd: string;
  bcvRate: string;
  paymentType: "contado" | "cuotas";
  billingData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    phone?: string;
  };
  createdAt: string;
  OrderItems: DBOrderItem[];
  Installments: DBInstallment[];
  Payments: DBPayment[];
  Shipment: DBShipment | null;
}

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  
  // Payment reporting form state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [reportingOrder, setReportingOrder] = useState<DBOrder | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentType: "pago_movil",
    bankFrom: "",
    bankTo: "",
    accountOrPhone: "",
    referenceNumber: "",
    amountUsd: "",
    installmentId: "global",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get<{ ok: boolean; data: DBOrder[] }>("/api/orders/me");
      if (response.ok && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const handleDownloadInvoice = async (orderId: string, invoiceNumber: string) => {
    try {
      toast({
        title: "Descargando Factura",
        description: `Generando PDF para factura #${invoiceNumber}...`,
      });
      // Abrimos el PDF de la factura en una pestaña nueva
      window.open(`/api/invoices/${orderId}/pdf`, "_blank");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al descargar",
        description: "No se pudo generar el documento PDF en este momento.",
      });
    }
  };

  const handleOpenPaymentDialog = (order: DBOrder) => {
    setReportingOrder(order);
    setPaymentForm({
      paymentType: "pago_movil",
      bankFrom: "",
      bankTo: "",
      accountOrPhone: "",
      referenceNumber: "",
      amountUsd: order.paymentType === "contado" ? order.totalUsd : "",
      installmentId: "global",
    });
    setIsPaymentDialogOpen(true);
  };

  const handleReportPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingOrder) return;
    setIsSubmittingPayment(true);

    try {
      const payload: {
        orderId: string;
        paymentType: string;
        bankFrom?: string;
        bankTo?: string;
        accountOrPhone?: string;
        referenceNumber: string;
        amountUsd: number;
        installmentId?: string;
      } = {
        orderId: reportingOrder.id,
        paymentType: paymentForm.paymentType,
        bankFrom: paymentForm.bankFrom || undefined,
        bankTo: paymentForm.bankTo || undefined,
        accountOrPhone: paymentForm.accountOrPhone || undefined,
        referenceNumber: paymentForm.referenceNumber,
        amountUsd: Number(paymentForm.amountUsd),
      };

      if (paymentForm.installmentId !== "global") {
        payload.installmentId = paymentForm.installmentId;
      }

      const response = await api.post<{ ok: boolean }>("/api/payments", payload);
      if (response.ok) {
        toast({
          title: "Pago Reportado",
          description: "Tu pago ha sido registrado y está en proceso de verificación.",
        });
        setIsPaymentDialogOpen(false);
        fetchOrders();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Por favor verifica los datos ingresados.";
      toast({
        variant: "destructive",
        title: "Error al reportar pago",
        description: errorMsg,
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendiente: { label: "Pendiente", className: "bg-amber-100 text-amber-800" },
      pagado: { label: "Pagado", className: "bg-emerald-100 text-green-800" },
      preparando_envio: { label: "Preparando envío", className: "bg-blue-100 text-blue-800" },
      enviado: { label: "Enviado", className: "bg-indigo-100 text-indigo-800" },
      entregado: { label: "Entregado", className: "bg-green-100 text-green-800" },
      cancelado: { label: "Cancelado", className: "bg-rose-100 text-rose-800" },
    };

    const current = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={cn("px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-none", current.className)}>
        {current.label}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendiente: { label: "Pendiente", className: "bg-amber-100 text-amber-800" },
      confirmado: { label: "Confirmado", className: "bg-emerald-100 text-green-800" },
      rechazado: { label: "Rechazado", className: "bg-rose-100 text-rose-800" },
    };

    const current = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <span className={cn("px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-none", current.className)}>
        {current.label}
      </span>
    );
  };

  return (
    <Layout>
      <section className="py-12 md:py-16 bg-background">
        <div className="container-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-8 mb-10 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tu Cuenta</p>
              <h1 className="font-serif text-3xl md:text-4xl mt-1">¡Hola, {user?.name}!</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Consulta tus pedidos, cuotas pendientes, despachos y reporta tus transferencias bancarias.
              </p>
            </div>
            <div className="flex gap-4">
              {user?.role === "admin" || user?.role === "vendedor" ? (
                <Button asChild variant="outline" className="rounded-none border-foreground tracking-wide text-xs">
                  <Link to="/admin">Panel Administrativo</Link>
                </Button>
              ) : null}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-linen border border-border">
              <Package className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">No tienes pedidos registrados</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm">
                Parece que aún no has realizado ninguna compra en nuestra tienda.
              </p>
              <Button asChild className="rounded-none px-8 text-xs tracking-widest uppercase btn-premium">
                <Link to="/products">Visitar Catálogo</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Orders List */}
              <div className="lg:col-span-4 space-y-4">
                <h2 className="font-serif text-xl border-b border-border pb-3 mb-4">Tus Pedidos</h2>
                <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={cn(
                        "w-full text-left p-5 border transition-all duration-300 rounded-none flex flex-col gap-3",
                        selectedOrder?.id === order.id
                          ? "bg-linen border-primary ring-1 ring-primary"
                          : "bg-white hover:bg-linen/30 border-border"
                      )}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-serif font-semibold text-lg text-foreground">
                          #{order.invoiceNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="font-semibold text-foreground">
                          ${Number(order.totalUsd).toLocaleString()} (BCV: {Number(order.bcvRate).toFixed(2)})
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-border/50 pt-2 mt-1">
                        <span className="capitalize">Tipo: {order.paymentType}</span>
                        <span className="text-primary hover:underline font-semibold uppercase tracking-wider text-[10px]">
                          Ver detalles
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Detail View */}
              <div className="lg:col-span-8">
                {selectedOrder ? (
                  <motion.div
                    key={selectedOrder.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-border p-6 md:p-8 bg-white space-y-8"
                  >
                    {/* Detail Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="font-serif text-2xl font-bold">Pedido #{selectedOrder.invoiceNumber}</h2>
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Realizado el {new Date(selectedOrder.createdAt).toLocaleDateString()} a las{" "}
                          {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrder.status === "pendiente" && (
                          <Button
                            onClick={() => handleOpenPaymentDialog(selectedOrder)}
                            className="rounded-none text-xs bg-primary hover:bg-primary/95 text-white tracking-wider uppercase h-10 px-4"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Reportar Pago
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDownloadInvoice(selectedOrder.id, selectedOrder.invoiceNumber)}
                          variant="outline"
                          className="rounded-none border-foreground text-xs h-10 px-4"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF Factura
                        </Button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" /> Artículos
                      </h3>
                      <div className="border border-border/60 divide-y divide-border/60">
                        {selectedOrder.OrderItems.map((item) => (
                          <div key={item.id} className="p-4 flex justify-between items-center gap-4 bg-linen/10">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.Product?.name || "Pieza Artesanal"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.Product?.sku || "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Qty: {item.quantity}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                ${Number(item.unitPriceUsd).toLocaleString()} c/u
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid md:grid-cols-2 gap-6 bg-linen/20 p-5 border border-border/40">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Dirección de Despacho
                        </h4>
                        <p className="text-sm font-medium text-foreground">
                          {selectedOrder.billingData.firstName} {selectedOrder.billingData.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">
                          {selectedOrder.billingData.address}, {selectedOrder.billingData.city},{" "}
                          {selectedOrder.billingData.country}
                        </p>
                        {selectedOrder.billingData.phone && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Teléfono: {selectedOrder.billingData.phone}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 text-sm border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          Resumen Financiero
                        </h4>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Subtotal:</span>
                          <span>${Number(selectedOrder.subtotalUsd).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Impuestos:</span>
                          <span>${Number(selectedOrder.taxUsd).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Envío:</span>
                          <span>
                            {Number(selectedOrder.shippingUsd) === 0
                              ? "Gratuito"
                              : `$${Number(selectedOrder.shippingUsd).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between font-serif text-base border-t border-border/40 pt-2 mt-1">
                          <span>Total USD:</span>
                          <span className="font-semibold">${Number(selectedOrder.totalUsd).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground/80">
                          <span>Total en Bolívares:</span>
                          <span className="font-medium">
                            Bs {(Number(selectedOrder.totalUsd) * Number(selectedOrder.bcvRate)).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Installments Plan (If applicable) */}
                    {selectedOrder.paymentType === "cuotas" && selectedOrder.Installments?.length > 0 && (
                      <div>
                        <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" /> Plan de Financiamiento (Cuotas)
                        </h3>
                        <div className="overflow-x-auto border border-border/50">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-linen/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/50">
                              <tr>
                                <th className="p-3"># Cuota</th>
                                <th className="p-3">Vencimiento</th>
                                <th className="p-3">Monto USD</th>
                                <th className="p-3">Monto Bs (BCV)</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {selectedOrder.Installments.map((inst) => (
                                <tr key={inst.id} className="bg-white">
                                  <td className="p-3 font-semibold">Cuota #{inst.installmentNumber}</td>
                                  <td className="p-3 text-xs">{new Date(inst.dueDate).toLocaleDateString()}</td>
                                  <td className="p-3 font-medium">${Number(inst.amountUsd).toLocaleString()}</td>
                                  <td className="p-3 text-xs">Bs {Number(inst.amountBs).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td className="p-3">
                                    <span
                                      className={cn(
                                        "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                        inst.status === "pagado"
                                          ? "bg-emerald-100 text-green-800"
                                          : inst.status === "vencido"
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-amber-100 text-amber-800"
                                      )}
                                    >
                                      {inst.status}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    {inst.status !== "pagado" && selectedOrder.status !== "cancelado" && (
                                      <Button
                                        onClick={() => {
                                          handleOpenPaymentDialog(selectedOrder);
                                          setPaymentForm((prev) => ({
                                            ...prev,
                                            installmentId: inst.id,
                                            amountUsd: inst.amountUsd,
                                          }));
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-8 rounded-none px-2 text-[10px] tracking-wider uppercase border-primary text-primary hover:bg-primary hover:text-white"
                                      >
                                        Pagar Cuota
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Shipment Tracker */}
                    {selectedOrder.Shipment ? (
                      <div>
                        <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                          <Truck className="w-5 h-5" /> Seguimiento de Envío
                        </h3>
                        <div className="border border-border/60 p-5 bg-linen/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-foreground flex items-center gap-2">
                              <span>Estado del despacho:</span>
                              <span className="capitalize text-primary">{selectedOrder.Shipment.status.replace("_", " ")}</span>
                            </p>
                            {selectedOrder.Shipment.carrier && (
                              <p className="text-xs text-muted-foreground">Courier: {selectedOrder.Shipment.carrier}</p>
                            )}
                            {selectedOrder.Shipment.trackingNumber && (
                              <p className="text-xs text-muted-foreground font-mono">
                                Guía # {selectedOrder.Shipment.trackingNumber}
                              </p>
                            )}
                            {selectedOrder.Shipment.estimatedDeliveryDate && (
                              <p className="text-xs text-muted-foreground">
                                Estimado de entrega: {new Date(selectedOrder.Shipment.estimatedDeliveryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          {/* Tracker Timeline */}
                          <div className="flex items-center gap-2 flex-1 max-w-xs md:justify-end">
                            {["preparando", "enviado", "en_transito", "entregado"].map((step, idx, arr) => {
                              const steps = ["preparando", "enviado", "en_transito", "entregado"];
                              const currIdx = steps.indexOf(selectedOrder.Shipment?.status || "preparando");
                              const isPassed = steps.indexOf(step) <= currIdx;
                              
                              return (
                                <div key={step} className="flex items-center gap-1">
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                      isPassed ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"
                                    )}
                                    title={step.replace("_", " ")}
                                  >
                                    {idx + 1}
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <div
                                      className={cn(
                                        "h-0.5 w-6",
                                        steps.indexOf(step) < currIdx ? "bg-primary" : "bg-border"
                                      )}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Payments History */}
                    {selectedOrder.Payments?.length > 0 && (
                      <div>
                        <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Historial de Transacciones Reportadas
                        </h3>
                        <div className="overflow-x-auto border border-border/50">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-linen/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/50">
                              <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Método</th>
                                <th className="p-3">Referencia</th>
                                <th className="p-3">Monto USD</th>
                                <th className="p-3">Monto Bs</th>
                                <th className="p-3 text-right">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {selectedOrder.Payments.map((pay) => (
                                <tr key={pay.id} className="bg-white">
                                  <td className="p-3 text-xs">
                                    {new Date(pay.paidAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-3 text-xs capitalize">
                                    {pay.paymentType.replace("_", " ")}
                                  </td>
                                  <td className="p-3 font-mono text-xs">{pay.referenceNumber}</td>
                                  <td className="p-3 font-medium">${Number(pay.amountUsd).toLocaleString()}</td>
                                  <td className="p-3 text-xs">Bs {Number(pay.amountBs).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td className="p-3 text-right">{getPaymentBadge(pay.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center p-12 border border-dashed border-border bg-linen/10 min-h-[40vh]">
                    <div className="text-center text-muted-foreground">
                      <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-60" />
                      <p className="font-serif text-xl mb-1">Ningún pedido seleccionado</p>
                      <p className="text-xs">Por favor, selecciona un pedido de la lista lateral para ver todos sus detalles.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Payment Reporting Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-none bg-linen p-8 border border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground text-center">Reportar Pago Transferencia</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReportPaymentSubmit} className="space-y-5 mt-4">
            {reportingOrder?.paymentType === "cuotas" && (
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Destinar Pago A:
                </label>
                <Select
                  value={paymentForm.installmentId}
                  onValueChange={(val) => {
                    const inst = reportingOrder.Installments.find((i) => i.id === val);
                    setPaymentForm((prev) => ({
                      ...prev,
                      installmentId: val,
                      amountUsd: val === "global" ? reportingOrder.totalUsd : inst ? inst.amountUsd : prev.amountUsd,
                    }));
                  }}
                >
                  <SelectTrigger className="rounded-none bg-white h-11 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="global">Monto Total del Pedido (${Number(reportingOrder.totalUsd).toLocaleString()})</SelectItem>
                    {reportingOrder.Installments.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id} disabled={inst.status === "pagado"}>
                        Cuota #{inst.installmentNumber} (${Number(inst.amountUsd).toLocaleString()}) - {inst.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Método de Pago *
                </label>
                <Select
                  value={paymentForm.paymentType}
                  onValueChange={(val) => setPaymentForm((prev) => ({ ...prev, paymentType: val }))}
                >
                  <SelectTrigger className="rounded-none bg-white h-11 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="efectivo">Efectivo (Divisas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Monto USD a Reportar *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amountUsd}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amountUsd: e.target.value }))}
                  className="rounded-none bg-white h-11"
                  placeholder="Monto en USD"
                />
              </div>
            </div>

            {paymentForm.paymentType !== "efectivo" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                      Banco Origen
                    </label>
                    <Input
                      value={paymentForm.bankFrom}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, bankFrom: e.target.value }))}
                      className="rounded-none bg-white h-11"
                      placeholder="Ej. Banesco"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                      Banco Destino Receptivo
                    </label>
                    <Input
                      value={paymentForm.bankTo}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, bankTo: e.target.value }))}
                      className="rounded-none bg-white h-11"
                      placeholder="Ej. Mercantil"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                      Teléfono o Cuenta
                    </label>
                    <Input
                      value={paymentForm.accountOrPhone}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, accountOrPhone: e.target.value }))}
                      className="rounded-none bg-white h-11"
                      placeholder="Teléfono emisor"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                      Número Referencia *
                    </label>
                    <Input
                      required
                      value={paymentForm.referenceNumber}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                      className="rounded-none bg-white h-11"
                      placeholder="6 u 8 últimos dígitos"
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isSubmittingPayment}
              className="w-full rounded-none py-6 text-sm font-semibold tracking-widest uppercase btn-premium mt-3"
            >
              {isSubmittingPayment ? "Registrando Pago..." : "Enviar Reporte de Pago"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
