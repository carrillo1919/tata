import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });
      toast({
        title: "Cuenta Creada",
        description: "¡Te has registrado con éxito en Tata!",
      });
      navigate("/");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al registrarse. Inténtalo de nuevo.";
      setError(errorMsg);
    }
  };

  return (
    <Layout>
      <section className="py-20 md:py-28">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-linen p-8 md:p-12 border border-border"
          >
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl md:text-4xl mb-3">Crear una Cuenta</h1>
              <p className="text-muted-foreground text-sm">
                Únete a Tata para registrar tus pedidos, realizar seguimiento de envíos y administrar tus formas de pago.
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                >
                  Nombre Completo *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="rounded-none h-12 bg-white"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                >
                  Correo Electrónico *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="rounded-none h-12 bg-white"
                  placeholder="ejemplo@tata.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                >
                  Teléfono de Contacto
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="rounded-none h-12 bg-white"
                  placeholder="+58 412-1234567"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2"
                >
                  Contraseña *
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="rounded-none h-12 bg-white"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full rounded-none py-6 text-sm tracking-[0.15em] uppercase btn-premium mt-4"
              >
                {isLoading ? "Registrando..." : "Crear Cuenta"}
                {!isLoading && <ArrowRight className="ml-3 w-4 h-4" />}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-foreground font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
