import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product as FEProduct, products as staticProducts } from "@/data/products";

export interface DBProduct {
  id: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  sku: string;
  supplierPriceUsd: string | number;
  salePriceUsd: string | number;
  stockCurrent: number;
  stockMinAlert: number;
  imageData?: { type: string; data: number[] } | string | null;
  imageMimeType?: string;
  status: "activo" | "inactivo";
  weightKg?: string | number;
  dimensions?: unknown;
  categoryId?: string;
  createdAt?: string;
}

export const mapDbProductToFrontend = (dbProd: DBProduct): FEProduct => {
  let imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";
  
  if (dbProd.imageData) {
    if (typeof dbProd.imageData === "string") {
      imageUrl = dbProd.imageData.startsWith("data:") 
        ? dbProd.imageData 
        : `data:${dbProd.imageMimeType || "image/jpeg"};base64,${dbProd.imageData}`;
    } else if (dbProd.imageData.data) {
      try {
        const binary = String.fromCharCode(...dbProd.imageData.data);
        const base64 = btoa(binary);
        imageUrl = `data:${dbProd.imageMimeType || "image/jpeg"};base64,${base64}`;
      } catch (e) {
        console.error("Error converting product image blob", e);
      }
    }
  } else {
    // Buscar si el SKU coincide con algún producto estático para usar su imagen premium
    const matchingStatic = staticProducts.find(
      (p) => p.name.toLowerCase() === dbProd.name.toLowerCase() || p.id === dbProd.id
    );
    if (matchingStatic && matchingStatic.images.length > 0) {
      return {
        ...matchingStatic,
        id: dbProd.id,
        price: Number(dbProd.salePriceUsd),
        description: dbProd.shortDescription || matchingStatic.description,
      };
    }
  }

  return {
    id: dbProd.id,
    name: dbProd.name,
    slug: dbProd.sku || dbProd.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    collection: dbProd.categoryId || "cotidiano",
    price: Number(dbProd.salePriceUsd),
    description: dbProd.shortDescription || dbProd.name,
    longDescription: dbProd.longDescription || dbProd.shortDescription || "",
    materials: "Cerámica gres, esmalte natural satinado de ceniza mineral",
    dimensions: dbProd.dimensions ? JSON.stringify(dbProd.dimensions) : "Varios",
    images: [imageUrl],
    featured: dbProd.status === "activo",
    new: true,
  };
};

export const useProducts = () => {
  return useQuery<FEProduct[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await api.get<{ ok: boolean; data: DBProduct[] }>("/api/products");
        if (response.ok && response.data && response.data.length > 0) {
          const dbMapped = response.data.map(mapDbProductToFrontend);
          // Mezclamos los productos creados dinámicamente con los estáticos para un catálogo súper rico
          const mappedIds = new Set(dbMapped.map((p) => p.name.toLowerCase()));
          const uniqueStatic = staticProducts.filter((p) => !mappedIds.has(p.name.toLowerCase()));
          return [...dbMapped, ...uniqueStatic];
        }
      } catch (err) {
        console.warn("Backend products fetch failed, falling back to static products", err);
      }
      return staticProducts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
