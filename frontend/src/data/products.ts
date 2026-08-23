export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  heroImage?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  price: number;
  description: string;
  longDescription: string;
  materials: string;
  dimensions?: string;
  images: string[];
  featured?: boolean;
  new?: boolean;
}

export const collections: Collection[] = [
  {
    id: "cotidiano",
    name: "Artículos cotidianos",
    slug: "articulos-cotidianos",
    description: "Soluciones prácticas para el día a día del hogar y la oficina",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80",
  },
  {
    id: "vasos",
    name: "Vasos",
    slug: "vasos",
    description: "Modelos resistentes para bebidas frías y calientes",
    image: "https://images.unsplash.com/photo-1563223771-375783ee91ad?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1563223771-375783ee91ad?w=1920&q=80",
  },
  {
    id: "termos",
    name: "Termos",
    slug: "termos",
    description: "Conservación térmica para trabajo, gimnasio y viaje",
    image: "https://images.unsplash.com/photo-1573669855695-c5f0040b1f67?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1573669855695-c5f0040b1f67?w=1920&q=80",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    slug: "accesorios",
    description: "Complementos funcionales para estilo y organización",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80",
  },
  {
    id: "relojes",
    name: "Relojes",
    slug: "relojes",
    description: "Diseños casuales y deportivos para cada ocasión",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1920&q=80",
  },
  {
    id: "colonias",
    name: "Colonias",
    slug: "colonias",
    description: "Fragancias frescas para uso diario",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1920&q=80",
  },
];

export const products: Product[] = [
  {
    id: "vaso-termico-premium",
    name: "Vaso térmico premium 600ml",
    slug: "vaso-termico-premium-600ml",
    collection: "vasos",
    price: 18,
    description: "Acero inoxidable y tapa antifugas",
    longDescription:
      "Vaso reutilizable ideal para café, té o bebidas frías. Mantiene temperatura por horas y su tapa evita derrames durante traslados.",
    materials: "Acero inoxidable 304, tapa de silicona",
    dimensions: "600 ml",
    images: [
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1f50c?w=800&q=80",
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
    ],
    featured: true,
    new: true,
  },
  {
    id: "set-vasos-vidrio",
    name: "Set de vasos de vidrio x6",
    slug: "set-vasos-vidrio-x6",
    collection: "vasos",
    price: 24,
    description: "Vidrio templado para uso cotidiano",
    longDescription:
      "Juego de seis vasos con diseño apilable para ahorrar espacio y facilitar su almacenamiento en cocina o barra.",
    materials: "Vidrio templado",
    dimensions: "350 ml por vaso",
    images: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=80",
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&q=80",
    ],
  },
  {
    id: "termo-deportivo-750",
    name: "Termo deportivo 750ml",
    slug: "termo-deportivo-750ml",
    collection: "termos",
    price: 22,
    description: "Conserva frío y calor con boquilla rápida",
    longDescription:
      "Termo ergonómico con agarre seguro y boquilla de apertura rápida. Perfecto para gimnasio, oficina o actividades al aire libre.",
    materials: "Acero inoxidable, plástico BPA free",
    dimensions: "750 ml",
    images: [
      "https://images.unsplash.com/photo-1622480916113-f85f83f0f6f0?w=800&q=80",
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "termo-familiar-1l",
    name: "Termo familiar 1L",
    slug: "termo-familiar-1l",
    collection: "termos",
    price: 29,
    description: "Mayor capacidad para jornadas largas",
    longDescription:
      "Termo de alta capacidad para mantener bebidas a temperatura ideal durante toda la jornada laboral o viajes largos.",
    materials: "Acero inoxidable doble pared",
    dimensions: "1 litro",
    images: [
      "https://images.unsplash.com/photo-1522992319-0365e5f11656?w=800&q=80",
      "https://images.unsplash.com/photo-1610130353283-8f67f4b18f2f?w=800&q=80",
    ],
  },
  {
    id: "organizador-escritorio",
    name: "Organizador de escritorio modular",
    slug: "organizador-escritorio-modular",
    collection: "cotidiano",
    price: 16,
    description: "Mantén cables, bolígrafos y notas en orden",
    longDescription:
      "Organizador práctico para espacios de trabajo y estudio. Incluye compartimentos para accesorios pequeños y documentos.",
    materials: "ABS reciclado",
    dimensions: "28cm × 18cm × 8cm",
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "set-lonchera",
    name: "Set lonchera con cubiertos",
    slug: "set-lonchera-con-cubiertos",
    collection: "cotidiano",
    price: 20,
    description: "Incluye envase principal y cubiertos reutilizables",
    longDescription:
      "Set ideal para oficina o universidad, con cierre seguro y tamaño compacto para llevar tus comidas de forma cómoda.",
    materials: "Polipropileno libre de BPA",
    dimensions: "1.2 litros",
    images: [
      "https://images.unsplash.com/photo-1514995669114-6081e934b693?w=800&q=80",
      "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=800&q=80",
    ],
  },
  {
    id: "reloj-casual-negro",
    name: "Reloj casual negro",
    slug: "reloj-casual-negro",
    collection: "relojes",
    price: 35,
    description: "Diseño minimalista para uso diario",
    longDescription:
      "Reloj de pulsera con correa cómoda y resistencia a salpicaduras. Ideal para combinar con looks casuales o de oficina.",
    materials: "Correa de silicona, caja de aleación",
    dimensions: "Diámetro 42mm",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
      "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "reloj-deportivo-azul",
    name: "Reloj deportivo azul",
    slug: "reloj-deportivo-azul",
    collection: "relojes",
    price: 42,
    description: "Ligero y resistente para entrenamiento",
    longDescription:
      "Incluye cronómetro, formato 12/24h e iluminación nocturna. Diseñado para acompañarte en entrenamientos y rutinas activas.",
    materials: "Resina reforzada",
    dimensions: "Diámetro 44mm",
    images: [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    ],
    new: true,
  },
  {
    id: "colonia-fresh-day",
    name: "Colonia Fresh Day",
    slug: "colonia-fresh-day",
    collection: "colonias",
    price: 19,
    description: "Aroma fresco de larga duración",
    longDescription:
      "Fragancia ligera para uso diario con notas cítricas y amaderadas suaves. Presentación práctica para llevar.",
    materials: "Eau de toilette",
    dimensions: "100 ml",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "colonia-urban-night",
    name: "Colonia Urban Night",
    slug: "colonia-urban-night",
    collection: "colonias",
    price: 23,
    description: "Fragancia intensa para tarde y noche",
    longDescription:
      "Notas especiadas y amaderadas para una presencia más marcada. Ideal para ocasiones especiales o uso nocturno.",
    materials: "Eau de parfum",
    dimensions: "100 ml",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
    ],
  },
  {
    id: "correa-reloj-cuero",
    name: "Correa de reloj en cuero",
    slug: "correa-reloj-cuero",
    collection: "accesorios",
    price: 14,
    description: "Repuesto universal para relojes de 22mm",
    longDescription:
      "Correa adaptable para renovar tu reloj y darle un estilo clásico. Cierre metálico resistente y ajuste cómodo.",
    materials: "Cuero sintético",
    dimensions: "22mm",
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    ],
  },
  {
    id: "bolso-organizador",
    name: "Bolso organizador multifunción",
    slug: "bolso-organizador-multifuncion",
    collection: "accesorios",
    price: 28,
    description: "Compartimientos internos para viaje y oficina",
    longDescription:
      "Bolso compacto para llevar accesorios, documentos y dispositivos pequeños. Diseño sobrio y resistente al uso diario.",
    materials: "Poliéster reforzado",
    dimensions: "32cm × 24cm × 12cm",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    ],
    new: true,
  },
];

export const getProductsByCollection = (collectionSlug: string): Product[] => {
  return products.filter((product) => product.collection === collectionSlug);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((product) => product.featured);
};

export const getNewProducts = (): Product[] => {
  return products.filter((product) => product.new);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((product) => product.slug === slug);
};

export const getCollectionBySlug = (slug: string): Collection | undefined => {
  return collections.find((collection) => collection.slug === slug);
};

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  return products
    .filter((p) => p.collection === product.collection && p.id !== productId)
    .slice(0, limit);
};
