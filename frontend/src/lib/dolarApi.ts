export interface OfficialDollarRate {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

export type DollarStatus = Record<string, unknown>;

const DOLAR_API_BASE = "https://ve.dolarapi.com/v1";

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error al consultar ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
};

export const fetchOfficialDollarRate = () =>
  fetchJson<OfficialDollarRate>(`${DOLAR_API_BASE}/dolares/oficial`);

export const fetchDollarStatus = () =>
  fetchJson<DollarStatus>(`${DOLAR_API_BASE}/estado`);

export const fetchOfficialDollarHistory = () =>
  fetchJson<OfficialDollarRate[]>(`${DOLAR_API_BASE}/historicos/dolares/oficial`);

export const fetchDollarDashboard = async () => {
  const [official, status, history] = await Promise.all([
    fetchOfficialDollarRate(),
    fetchDollarStatus(),
    fetchOfficialDollarHistory(),
  ]);

  return {
    official,
    status,
    history: history.slice(0, 7),
  };
};
