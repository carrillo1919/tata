import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDollarDashboard } from "@/lib/dolarApi";

interface DollarRatePanelProps {
  amountUsd: number;
}

const formatBs = (value: number) =>
  new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const DollarRatePanel = ({ amountUsd }: DollarRatePanelProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dollar-rate-dashboard"],
    queryFn: fetchDollarDashboard,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });

  const latestStatus = useMemo(() => {
    if (!data?.status) return "Sin estado";

    const estado = data.status.estado;
    if (typeof estado === "string") return estado;

    const message = data.status.message;
    if (typeof message === "string") return message;

    return "Disponible";
  }, [data]);

  if (isLoading) {
    return (
      <div className="mb-6 rounded-none border border-border bg-background p-4 text-sm text-muted-foreground">
        Consultando tasa oficial BCV...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mb-6 rounded-none border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        No se pudo cargar la tasa oficial del dólar en este momento.
      </div>
    );
  }

  const totalBs = amountUsd * data.official.promedio;

  return (
    <div className="mb-6 rounded-none border border-border bg-background p-4">
      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
        Tasa BCV oficial
      </p>
      <p className="mt-2 text-sm">
        1 USD = <span className="font-semibold">Bs {formatBs(data.official.promedio)}</span>
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Total estimado en Bs para este pedido: <span className="font-medium text-foreground">Bs {formatBs(totalBs)}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Fuente: {data.official.fuente} · Estado API: {latestStatus}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Actualizado: {formatDate(data.official.fechaActualizacion)}
      </p>

      <div className="mt-4 border-t border-border pt-3">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          Histórico reciente
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {data.history.slice(0, 3).map((item) => (
            <li key={item.fechaActualizacion} className="flex justify-between gap-3">
              <span>{formatDate(item.fechaActualizacion)}</span>
              <span className="text-foreground">Bs {formatBs(item.promedio)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
