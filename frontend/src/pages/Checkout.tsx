import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { DollarRatePanel } from "@/components/DollarRatePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getSubtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<"contado" | "cuotas">("contado");
  const [installments, setInstallments] = useState("3");
  const [installmentIntervalDays, setInstallmentIntervalDays] = useState("30");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });

  const subtotal = getSubtotal();
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container-narrow py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-4xl mb-4">Inicia Sesión para Comprar</h1>
            <p className="text-muted-foreground mb-8">
              Necesitas iniciar sesión o registrarte para completar tu pedido en Tata.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="rounded-none px-8 text-sm tracking-[0.1em] uppercase btn-premium">
                <Link to="/login" state={{ from: { pathname: "/checkout" } }}>
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-none px-8 text-sm tracking-[0.1em] uppercase border-foreground text-foreground">
                <Link to="/register">
                  Registrarse
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-narrow py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-4xl mb-4">No Items to Checkout</h1>
            <p className="text-muted-foreground mb-8">
              Your bag is empty. Add some items before checking out.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase btn-premium"
            >
              <Link to="/products">
                Start Shopping
                <ArrowRight className="ml-3 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      paymentType,
      shippingUsd: shipping,
      billingData: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
      },
      ...(paymentType === "cuotas"
        ? {
            installments: Number(installments),
            installmentIntervalDays: Number(installmentIntervalDays),
          }
        : {}),
    };

    try {
      const response = await api.post<{ ok: boolean }>("/api/checkout", payload);
      if (response.ok) {
        toast({
          title: "Pedido Realizado con Éxito",
          description: "¡Gracias por tu compra! Tu orden ha sido registrada en el sistema.",
        });
        clearCart();
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Por favor verifica los datos ingresados.";
      toast({
        variant: "destructive",
        title: "Error al realizar pedido",
        description: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container-full py-6 border-b border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/cart" className="hover:text-foreground transition-colors">
            Your Bag
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">Checkout</span>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container-full py-4">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-primary" />
            <p>
              <span className="font-medium">Checkout contado habilitado.</span>{" "}
              <span className="text-muted-foreground">
                Completa tu pedido y nuestro equipo verificará el pago para confirmar despacho.
              </span>
            </p>
          </div>
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl mb-12"
          >
            Checkout
          </motion.h1>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Information */}
                <div>
                  <h2 className="font-serif text-xl mb-6">
                    Contact Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                      >
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="rounded-none h-12"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                      >
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="rounded-none h-12"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                      >
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="rounded-none h-12"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                      >
                        Phone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="rounded-none h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="font-serif text-xl mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                      >
                        Street Address *
                      </label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="rounded-none h-12"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label
                          htmlFor="city"
                          className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                        >
                          City *
                        </label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="rounded-none h-12"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                        >
                          Postal Code *
                        </label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required
                          className="rounded-none h-12"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="country"
                          className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                        >
                          Country *
                        </label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          className="rounded-none h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Plan Options */}
                <div>
                  <h2 className="font-serif text-xl mb-6">Plan de Pago</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">
                        Tipo de Pago *
                      </label>
                      <Select
                        value={paymentType}
                        onValueChange={(value) => setPaymentType(value as "contado" | "cuotas")}
                      >
                        <SelectTrigger className="rounded-none h-12 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="contado">Pago Único (Al Contado)</SelectItem>
                          <SelectItem value="cuotas">Pago en Cuotas (Financiamiento)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentType === "cuotas" && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">
                            Número de Cuotas *
                          </label>
                          <Select value={installments} onValueChange={setInstallments}>
                            <SelectTrigger className="rounded-none h-12 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="2">2 Cuotas</SelectItem>
                              <SelectItem value="3">3 Cuotas</SelectItem>
                              <SelectItem value="6">6 Cuotas</SelectItem>
                              <SelectItem value="12">12 Cuotas</SelectItem>
                              <SelectItem value="24">24 Cuotas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">
                            Frecuencia de Cuotas (Días) *
                          </label>
                          <Select value={installmentIntervalDays} onValueChange={setInstallmentIntervalDays}>
                            <SelectTrigger className="rounded-none h-12 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="7">Cada 7 Días (Semanal)</SelectItem>
                              <SelectItem value="15">Cada 15 Días (Quincenal)</SelectItem>
                              <SelectItem value="30">Cada 30 Días (Mensual)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <h2 className="font-serif text-xl mb-6">Order Notes</h2>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special requests or notes for your order..."
                    className="rounded-none min-h-[120px]"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full rounded-none py-6 text-sm tracking-[0.15em] uppercase btn-premium"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit Order Request
                      <ArrowRight className="ml-3 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-linen p-8 lg:sticky lg:top-28">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>

                <DollarRatePanel amountUsd={total} />

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-16 h-20 bg-muted/30 overflow-hidden">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm mt-1">
                          ${(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? "Complimentary" : `$${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-serif text-xl">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-3">
                    Questions?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Escríbenos a{" "}
                    <a
                      href="mailto:ventas@tata.com"
                      className="text-foreground underline"
                    >
                      ventas@tata.com
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
