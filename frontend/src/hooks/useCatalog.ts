import { useQuery } from "@tanstack/react-query";
import { collections as fallbackCollections, products as fallbackProducts } from "@/data/products";
import { fetchCatalogData } from "@/lib/catalogApi";

export const useCatalog = () => {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalogData,
    staleTime: 60_000,
    retry: 1,
    initialData: {
      products: fallbackProducts,
      collections: fallbackCollections,
    },
  });
};
