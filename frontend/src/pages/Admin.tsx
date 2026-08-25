import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Package,
  CreditCard,
  Truck,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  TrendingUp,
  Boxes,
  Activity,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface DBProduct {
  id: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  sku: string;
  supplierPriceUsd: string | number;
  salePriceUsd: string | number;
  stockCurrent: number;
  stockMinAlert: number;
  status: "activo" | "inactivo";
  categoryId?: string;
}

interface DBPayment {
  id: string;
  paymentType: string;
  referenceNumber: string;
  amountUsd: string;
  amountBs: string;
  status: "pendiente" | "confirmado" | "rechazado";
  paidAt: string;
  Order: {
    id: string;
    invoiceNumber: string;
    totalUsd: string;
  };
  Installment?: {
    id: string;
    installmentNumber: number;
    dueDate: string;
  };
}

interface DBShipment {
  id: string;
  status: "preparando" | "enviado" | "en_transito" | "entregado";
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
  Order: {
    id: string;
    invoiceNumber: string;
  };
}

interface DBConfig {
  id: string;
  key: string;
  value: unknown;
}

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"metrics" | "products" | "payments" | "shipments" | "config">("metrics");
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [payments, setPayments] = useState<DBPayment[]>([]);
  const [shipments, setShipments] = useState<DBShipment[]>([]);
  const [configs, setConfigs] = useState<DBConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for creating/editing products
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    shortDescription: "",
    longDescription: "",
    supplierPriceUsd: "",
    salePriceUsd: "",
    stockCurrent: "",
    stockMinAlert: "",
    status: "activo" as "activo" | "inactivo",
  });

  // Form states for shipment tracking
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<DBShipment | null>(null);
  const [shipmentForm, setShipmentForm] = useState({
    status: "preparando" as "preparando" | "enviado" | "en_transito" | "entregado",
    carrier: "",
    trackingNumber: "",
  });

  // Config editor state
  const [taxPercent, setTaxPercent] = useState("16");
  const [interestPercent, setInterestPercent] = useState("5");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodsRes, paysRes, shipsRes, configsRes] = await Promise.all([
        api.get<{ ok: boolean; data: DBProduct[] }>("/api/products"),
        api.get<{ ok: boolean; data: DBPayment[] }>("/api/payments/pending"),
        api.get<{ ok: boolean; data: DBShipment[] }>("/api/shipments"),
        api.get<{ ok: boolean; data: DBConfig[] }>("/api/configurations"),
      ]);

      if (prodsRes.ok) setProducts(prodsRes.data);
      if (paysRes.ok) setPayments(paysRes.data);
      if (shipsRes.ok) setShipments(shipsRes.data);
      if (configsRes.ok) {
        setConfigs(configsRes.data);
        const tax = configsRes.data.find((c) => c.key === "tax_percent")?.value;
        const interest = configsRes.data.find((c) => c.key === "installment_interest_percent")?.value;
        if (tax !== undefined) setTaxPercent(String(tax));
        if (interest !== undefined) setInterestPercent(String(interest));
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "vendedor")) {
      navigate("/");
      return;
    }
    loadData();
  }, [isAuthenticated, user, navigate]);

  // Product management actions
  const handleOpenProductCreate = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      sku: "",
      shortDescription: "",
      longDescription: "",
      supplierPriceUsd: "10",
      salePriceUsd: "19.99",
      stockCurrent: "15",
      stockMinAlert: "3",
      status: "activo",
    });
    setIsProductDialogOpen(true);
  };

  const handleOpenProductEdit = (product: DBProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      shortDescription: product.shortDescription || "",
      longDescription: product.longDescription || "",
      supplierPriceUsd: String(product.supplierPriceUsd),
      salePriceUsd: String(product.salePriceUsd),
      stockCurrent: String(product.stockCurrent),
      stockMinAlert: String(product.stockMinAlert),
      status: product.status,
    });
    setIsProductDialogOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        sku: productForm.sku,
        shortDescription: productForm.shortDescription,
        longDescription: productForm.longDescription,
        supplierPriceUsd: Number(productForm.supplierPriceUsd),
        salePriceUsd: Number(productForm.salePriceUsd),
        stockCurrent: Number(productForm.stockCurrent),
        stockMinAlert: Number(productForm.stockMinAlert),
        status: productForm.status,
      };

      if (editingProduct) {
        await api.patch(`/api/products/${editingProduct.id}`, payload);
        toast({ title: "Producto Actualizado", description: "El producto se actualizó con éxito." });
      } else {
        await api.post("/api/products", payload);
        toast({ title: "Producto Creado", description: "El nuevo producto ha sido agregado al catálogo." });
      }
      setIsProductDialogOpen(false);
      loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ variant: "destructive", title: "Error en el producto", description: errorMsg });
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto del inventario?")) return;
    try {
      await api.delete(`/api/products/${productId}`);
      toast({ title: "Producto Eliminado", description: "El producto fue removido permanentemente." });
      loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ variant: "destructive", title: "Error al eliminar", description: errorMsg });
    }
  };

  // Payment Verification actions
  const handleVerifyPayment = async (paymentId: string, actionStatus: "confirmado" | "rechazado") => {
    try {
      await api.patch(`/api/payments/${paymentId}/verify`, { status: actionStatus });
      toast({
        title: actionStatus === "confirmado" ? "Pago Confirmado" : "Pago Rechazado",
        description: `El comprobante de pago fue ${actionStatus === "confirmado" ? "verificado con éxito" : "rechazado"}.`,
      });
      loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ variant: "destructive", title: "Error al verificar pago", description: errorMsg });
    }
  };

  // Shipment logistics actions
  const handleOpenShipmentDialog = (shipment: DBShipment) => {
    setSelectedShipment(shipment);
    setShipmentForm({
      status: shipment.status,
      carrier: shipment.carrier || "",
      trackingNumber: shipment.trackingNumber || "",
    });
    setIsShipmentDialogOpen(true);
  };

  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await api.patch(`/api/shipments/${selectedShipment.id}/status`, {
        status: shipmentForm.status,
        carrier: shipmentForm.carrier || undefined,
        trackingNumber: shipmentForm.trackingNumber || undefined,
      });
      toast({ title: "Logística Actualizada", description: "El estado del despacho ha sido actualizado." });
      setIsShipmentDialogOpen(false);
      loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ variant: "destructive", title: "Error en logística", description: errorMsg });
    }
  };

  // Global Config actions
  const handleSaveConfigs = async () => {
    try {
      await Promise.all([
        api.post("/api/configurations", { key: "tax_percent", value: Number(taxPercent) }),
        api.post("/api/configurations", { key: "installment_interest_percent", value: Number(interestPercent) }),
      ]);
      toast({ title: "Parámetros Guardados", description: "Los valores operativos globales fueron actualizados." });
      loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast({ variant: "destructive", title: "Error al guardar", description: errorMsg });
    }
  };

  // Mock static data for charts
  const salesChartData = [
    { name: "Lun", ventas: 1200, pedidos: 8 },
    { name: "Mar", ventas: 2100, pedidos: 14 },
    { name: "Mié", ventas: 1800, pedidos: 11 },
    { name: "Jue", ventas: 3400, pedidos: 22 },
    { name: "Vie", ventas: 4000, pedidos: 25 },
    { name: "Sáb", ventas: 5200, pedidos: 34 },
    { name: "Dom", ventas: 4500, pedidos: 28 },
  ];

  const categoryChartData = [
    { name: "Cotidianos", valor: 4500 },
    { name: "Vasos", valor: 2800 },
    { name: "Termos", valor: 3900 },
    { name: "Colección Premium", valor: 6400 },
  ];

  return (
    <Layout>
      <section className="py-12 bg-background">
        <div className="container-full">
          {/* Backoffice Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Portal Backoffice</p>
              <h1 className="font-serif text-3xl md:text-4xl mt-1">Panel de Administración</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Bienvenido {user?.name}. Supervisa métricas de venta, audita pagos, gestiona inventario y programa despachos logísticos.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => loadData()} variant="outline" className="rounded-none text-xs">
                Sincronizar Datos
              </Button>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-border mb-8 overflow-x-auto">
            {[
              { id: "metrics", label: "Métricas y Ventas", icon: BarChart },
              { id: "products", label: "Inventario Catálogo", icon: Boxes },
              { id: "payments", label: "Aprobación de Pagos", icon: CreditCard },
              { id: "shipments", label: "Gestión Despachos", icon: Truck },
              { id: "config", label: "Ajustes de Tienda", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "metrics" | "products" | "payments" | "shipments" | "config")}
                className={cn(
                  "flex items-center gap-2 py-4 px-6 border-b-2 text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-foreground bg-linen/25"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Tab: METRICS */}
              {activeTab === "metrics" && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-linen/30 border border-border/60 flex flex-col justify-between">
                      <div className="flex justify-between items-start text-muted-foreground mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider">Ventas Totales (Semana)</span>
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-3xl font-serif font-bold">$22,200</span>
                        <p className="text-xs text-green-700 font-medium mt-1">+14.2% vs. semana anterior</p>
                      </div>
                    </div>
                    <div className="p-6 bg-linen/30 border border-border/60 flex flex-col justify-between">
                      <div className="flex justify-between items-start text-muted-foreground mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider">Pedidos Registrados</span>
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-3xl font-serif font-bold">142</span>
                        <p className="text-xs text-green-700 font-medium mt-1">+8.1% vs. semana anterior</p>
                      </div>
                    </div>
                    <div className="p-6 bg-linen/30 border border-border/60 flex flex-col justify-between">
                      <div className="flex justify-between items-start text-muted-foreground mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider">Pagos por Verificar</span>
                        <CreditCard className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <span className="text-3xl font-serif font-bold text-amber-600">{payments.length}</span>
                        <p className="text-xs text-muted-foreground mt-1">Requieren atención administrativa</p>
                      </div>
                    </div>
                    <div className="p-6 bg-linen/30 border border-border/60 flex flex-col justify-between">
                      <div className="flex justify-between items-start text-muted-foreground mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider">Nivel Stock Crítico</span>
                        <Boxes className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <span className="text-3xl font-serif font-bold text-rose-600">
                          {products.filter((p) => Number(p.stockCurrent) <= Number(p.stockMinAlert)).length}
                        </span>
                        <p className="text-xs text-rose-700 font-medium mt-1">Artículos con stock mínimo</p>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-12 gap-8">
                    {/* Line Chart */}
                    <div className="lg:col-span-8 border border-border p-6 bg-white">
                      <h3 className="font-serif text-lg mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Rendimiento de Ventas Diarias
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="ventas" stroke="#c09f80" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="lg:col-span-4 border border-border p-6 bg-white">
                      <h3 className="font-serif text-lg mb-6 flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-primary" /> Ventas por Categoría
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                            <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                            <RechartsTooltip />
                            <Bar dataKey="valor" fill="#2d2d2d" radius={[0, 0, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: PRODUCTS */}
              {activeTab === "products" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl">Gestión de Catálogo e Inventario</h3>
                    <Button onClick={handleOpenProductCreate} className="rounded-none text-xs btn-premium uppercase tracking-wider h-10">
                      <Plus className="w-4 h-4 mr-2" /> Agregar Pieza
                    </Button>
                  </div>

                  <div className="border border-border/60 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-linen/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/50">
                        <tr>
                          <th className="p-4">SKU / Modelo</th>
                          <th className="p-4">Nombre Pieza</th>
                          <th className="p-4">Precio Proveedor</th>
                          <th className="p-4">Precio Venta</th>
                          <th className="p-4">Stock Actual</th>
                          <th className="p-4">Alerta Mín.</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 bg-white">
                        {products.map((prod) => {
                          const isLowStock = Number(prod.stockCurrent) <= Number(prod.stockMinAlert);
                          return (
                            <tr key={prod.id} className={cn("hover:bg-linen/10", isLowStock && "bg-rose-50/20")}>
                              <td className="p-4 font-mono text-xs font-semibold">{prod.sku}</td>
                              <td className="p-4 font-medium">{prod.name}</td>
                              <td className="p-4 text-xs">${Number(prod.supplierPriceUsd).toFixed(2)}</td>
                              <td className="p-4 font-semibold">${Number(prod.salePriceUsd).toFixed(2)}</td>
                              <td className="p-4">
                                <span className={cn("font-bold px-2 py-1 text-xs rounded-none", isLowStock ? "bg-rose-100 text-rose-800" : "bg-linen text-foreground")}>
                                  {prod.stockCurrent}
                                </span>
                              </td>
                              <td className="p-4 text-xs font-mono">{prod.stockMinAlert}</td>
                              <td className="p-4 capitalize">
                                <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase", prod.status === "activo" ? "bg-emerald-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                                  {prod.status}
                                </span>
                              </td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                <Button onClick={() => handleOpenProductEdit(prod)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-linen">
                                  <Edit3 className="w-4 h-4 text-primary" />
                                </Button>
                                {user?.role === "admin" && (
                                  <Button onClick={() => handleProductDelete(prod.id)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-100/40">
                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: PAYMENTS */}
              {activeTab === "payments" && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="font-serif text-xl">Auditoría y Aprobación de Transacciones Pendientes</h3>

                  {payments.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-border border-dashed">
                      <CheckCircle className="w-10 h-10 text-green-600/60 mx-auto mb-3" />
                      <p className="font-serif text-lg mb-1">¡Todo al día!</p>
                      <p className="text-xs text-muted-foreground">No existen pagos pendientes que requieran auditoría.</p>
                    </div>
                  ) : (
                    <div className="border border-border/60 overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-linen/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/50">
                          <tr>
                            <th className="p-4">Pedido / Factura</th>
                            <th className="p-4">Tipo Comprobante</th>
                            <th className="p-4">Método</th>
                            <th className="p-4">Referencia</th>
                            <th className="p-4">Monto USD</th>
                            <th className="p-4">Monto Bs</th>
                            <th className="p-4">Fecha Pago</th>
                            <th className="p-4 text-right">Auditoría</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 bg-white">
                          {payments.map((pay) => (
                            <tr key={pay.id} className="hover:bg-linen/10">
                              <td className="p-4 font-semibold">#{pay.Order?.invoiceNumber}</td>
                              <td className="p-4 text-xs font-medium">
                                {pay.Installment ? `Cuota #${pay.Installment.installmentNumber}` : "Monto Global"}
                              </td>
                              <td className="p-4 capitalize text-xs">{pay.paymentType.replace("_", " ")}</td>
                              <td className="p-4 font-mono text-xs">{pay.referenceNumber}</td>
                              <td className="p-4 font-semibold">${Number(pay.amountUsd).toLocaleString()}</td>
                              <td className="p-4 text-xs font-mono">Bs {Number(pay.amountBs).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="p-4 text-xs">{new Date(pay.paidAt).toLocaleDateString()}</td>
                              <td className="p-4 text-right flex justify-end gap-2">
                                <Button
                                  onClick={() => handleVerifyPayment(pay.id, "confirmado")}
                                  className="h-8 rounded-none text-[10px] tracking-wider uppercase bg-emerald-600 hover:bg-emerald-700 text-white px-3"
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  onClick={() => handleVerifyPayment(pay.id, "rechazado")}
                                  variant="ghost"
                                  className="h-8 rounded-none text-[10px] tracking-wider uppercase border border-rose-300 text-rose-600 hover:bg-rose-50 px-3"
                                >
                                  Rechazar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: SHIPMENTS */}
              {activeTab === "shipments" && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="font-serif text-xl">Gestión de Despachos y Logística</h3>

                  <div className="border border-border/60 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-linen/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/50">
                        <tr>
                          <th className="p-4">Pedido #</th>
                          <th className="p-4">Estado Logístico</th>
                          <th className="p-4">Empresa Courier</th>
                          <th className="p-4">Número de Guía / Tracking</th>
                          <th className="p-4">Entrega Estimada</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 bg-white">
                        {shipments.map((ship) => (
                          <tr key={ship.id} className="hover:bg-linen/10">
                            <td className="p-4 font-semibold">#{ship.Order?.invoiceNumber}</td>
                            <td className="p-4 capitalize">
                              <span
                                className={cn(
                                  "px-3 py-1 text-xs font-bold rounded-none uppercase",
                                  ship.status === "entregado"
                                    ? "bg-emerald-100 text-green-800"
                                    : ship.status === "preparando"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                )}
                              >
                                {ship.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-4 text-xs">{ship.carrier || "Sin asignar"}</td>
                            <td className="p-4 font-mono text-xs">{ship.trackingNumber || "Sin asignar"}</td>
                            <td className="p-4 text-xs">
                              {ship.estimatedDeliveryDate ? new Date(ship.estimatedDeliveryDate).toLocaleDateString() : "Sin asignar"}
                            </td>
                            <td className="p-4 text-right">
                              <Button
                                onClick={() => handleOpenShipmentDialog(ship)}
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] tracking-wider uppercase border-primary text-primary rounded-none px-3"
                              >
                                Actualizar Guía
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: CONFIG */}
              {activeTab === "config" && (
                <div className="space-y-6 animate-fadeIn max-w-xl">
                  <h3 className="font-serif text-xl">Parámetros Operativos Globales</h3>
                  <p className="text-sm text-muted-foreground">
                    Modifica los porcentajes de impuestos, tasas de financiamiento y otros valores globales que se inyectan en las facturas y simulaciones del checkout.
                  </p>

                  <div className="p-6 bg-linen/20 border border-border/60 space-y-6 bg-white">
                    <div>
                      <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">
                        IVA / Impuesto sobre la Venta (%)
                      </label>
                      <Input
                        type="number"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(e.target.value)}
                        className="rounded-none h-11"
                        placeholder="Ej. 16"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">
                        Tasa de Interés para Financiamiento por Cuotas (%)
                      </label>
                      <Input
                        type="number"
                        value={interestPercent}
                        onChange={(e) => setInterestPercent(e.target.value)}
                        className="rounded-none h-11"
                        placeholder="Ej. 5"
                      />
                    </div>

                    <Button onClick={handleSaveConfigs} className="w-full rounded-none py-5 text-xs tracking-widest uppercase btn-premium">
                      Guardar Configuración
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Creation / Edition Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-none bg-linen p-8 border border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground text-center">
              {editingProduct ? "Editar Pieza Artesanal" : "Agregar Nueva Pieza"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProductSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Nombre de la Pieza *
                </label>
                <Input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-none bg-white h-11"
                  placeholder="Ej. Jarra Cotidiano"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Código SKU *
                </label>
                <Input
                  required
                  value={productForm.sku}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, sku: e.target.value }))}
                  className="rounded-none bg-white h-11"
                  placeholder="Ej. COT-JAR-01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Precio Proveedor (USD) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.supplierPriceUsd}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, supplierPriceUsd: e.target.value }))}
                  className="rounded-none bg-white h-11"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Precio Venta (USD) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.salePriceUsd}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, salePriceUsd: e.target.value }))}
                  className="rounded-none bg-white h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Stock Inicial *
                </label>
                <Input
                  type="number"
                  required
                  value={productForm.stockCurrent}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, stockCurrent: e.target.value }))}
                  className="rounded-none bg-white h-11"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Mínimo Alerta Reposición *
                </label>
                <Input
                  type="number"
                  required
                  value={productForm.stockMinAlert}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, stockMinAlert: e.target.value }))}
                  className="rounded-none bg-white h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                  Estado
                </label>
                <Select
                  value={productForm.status}
                  onValueChange={(val) => setProductForm((prev) => ({ ...prev, status: val as "activo" | "inactivo" }))}
                >
                  <SelectTrigger className="rounded-none bg-white h-11 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="activo">Activo (Visible)</SelectItem>
                    <SelectItem value="inactivo">Inactivo (Oculto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                Descripción Corta *
              </label>
              <Input
                required
                value={productForm.shortDescription}
                onChange={(e) => setProductForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                className="rounded-none bg-white h-11"
                placeholder="Resumen del producto para listado rápido..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                Descripción Detallada
              </label>
              <Textarea
                value={productForm.longDescription}
                onChange={(e) => setProductForm((prev) => ({ ...prev, longDescription: e.target.value }))}
                className="rounded-none bg-white min-h-[80px]"
                placeholder="Ingresa los detalles técnicos, composición, etc..."
              />
            </div>

            <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-widest uppercase btn-premium mt-2">
              {editingProduct ? "Guardar Cambios" : "Agregar al Catálogo"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shipment Tracker update Dialog */}
      <Dialog open={isShipmentDialogOpen} onOpenChange={setIsShipmentDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-none bg-linen p-8 border border-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground text-center">Actualizar Estado de Despacho</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleShipmentSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                Estado Logístico *
              </label>
              <Select
                value={shipmentForm.status}
                onValueChange={(val) => setShipmentForm((prev) => ({ ...prev, status: val as "preparando" | "enviado" | "en_transito" | "entregado" }))}
              >
                <SelectTrigger className="rounded-none bg-white h-11 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="preparando">Preparando Paquete</SelectItem>
                  <SelectItem value="enviado">Entregado al Courier</SelectItem>
                  <SelectItem value="en_transito">En Tránsito</SelectItem>
                  <SelectItem value="entregado">Entregado al Destinatario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                Empresa de Encomienda (Carrier)
              </label>
              <Input
                value={shipmentForm.carrier}
                onChange={(e) => setShipmentForm((prev) => ({ ...prev, carrier: e.target.value }))}
                className="rounded-none bg-white h-11"
                placeholder="Ej. MRW, Zoom, Tealca..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                Número de Guía / Tracking
              </label>
              <Input
                value={shipmentForm.trackingNumber}
                onChange={(e) => setShipmentForm((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                className="rounded-none bg-white h-11"
                placeholder="Código asignado por el courier"
              />
            </div>

            <Button type="submit" className="w-full rounded-none py-6 text-xs tracking-widest uppercase btn-premium mt-2">
              Actualizar Guía Logística
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
