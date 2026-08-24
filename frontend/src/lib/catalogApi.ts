import { Collection, Product } from "@/data/products";

interface BackendCategory {
  id: string;
  name: string;
}

interface BackendProduct {
  id: string;
  name: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  salePriceUsd?: string | number | null;
  imageData?: string | { type?: string; data?: number[] } | null;
  imageMimeType?: string | null;
  status?: string | null;
  dimensions?: Record<string, unknown> | string | null;
  categoryId?: string | null;
  createdAt?: string | null;
}

interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const DEFAULT_PRODUCT_IMAGE = "/placeholder.svg";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const endpoint = (path: string) => `${API_BASE_URL}${path}`;

const parsePrice = (value?: string | number | null) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const parseDimensions = (value?: Record<string, unknown> | string | null) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, val]) => val !== null && val !== undefined && val !== "");
    if (!entries.length) return undefined;
    return entries.map(([key, val]) => `${key}: ${String(val)}`).join(", ");
  }
  return undefined;
};

const bytesToBase64 = (bytes: number[]) => {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.slice(i, i + chunk);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
};

const productImageFromBackend = (imageData?: string | { type?: string; data?: number[] } | null, mimeType?: string | null) => {
  if (!imageData) return DEFAULT_PRODUCT_IMAGE;
  if (typeof imageData === "string") {
    if (imageData.startsWith("data:")) return imageData;
    return `data:${mimeType || "image/jpeg"};base64,${imageData}`;
  }
  if (Array.isArray(imageData.data) && imageData.data.length) {
    const base64 = bytesToBase64(imageData.data);
    return `data:${mimeType || "image/jpeg"};base64,${base64}`;
  }
  return DEFAULT_PRODUCT_IMAGE;
};

const categoryImageFromName = (name: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(`tata-${name}`)}/1200/800`;

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(endpoint(path), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Error API ${path}: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload?.ok) {
    throw new Error(`Respuesta inválida en ${path}`);
  }
  return payload.data;
}

const mapCategory = (category: BackendCategory): Collection => ({
  id: category.id,
  name: category.name,
  slug: slugify(category.name),
  description: `Productos de ${category.name}`,
  image: categoryImageFromName(category.name),
  heroImage: categoryImageFromName(`${category.name}-hero`),
});

const mapProduct = (product: BackendProduct, categories: BackendCategory[]): Product => {
  const collectionId = product.categoryId || "sin-categoria";
  const category = categories.find((item) => item.id === collectionId);
  const image = productImageFromBackend(product.imageData, product.imageMimeType);
  const description = product.shortDescription || product.longDescription || "Producto disponible";
  const createdAt = product.createdAt ? new Date(product.createdAt) : null;
  const isNew = createdAt ? Date.now() - createdAt.getTime() <= 1000 * 60 * 60 * 24 * 30 : false;

  return {
    id: product.id,
    name: product.name,
    slug: `${slugify(product.name)}-${product.id.slice(0, 8)}`,
    collection: category?.id || collectionId,
    price: parsePrice(product.salePriceUsd),
    description,
    longDescription: product.longDescription || description,
    materials: "N/D",
    dimensions: parseDimensions(product.dimensions),
    images: [image],
    featured: product.status === "activo",
    new: isNew,
  };
};

export async function fetchCatalogData() {
  const [categories, products] = await Promise.all([
    fetchApi<BackendCategory[]>("/api/categories"),
    fetchApi<BackendProduct[]>("/api/products"),
  ]);

  const mappedCollections = categories.map(mapCategory);
  const mappedProducts = products.map((product) => mapProduct(product, categories));

  return {
    products: mappedProducts,
    collections: mappedCollections,
  };
}
