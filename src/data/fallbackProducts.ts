import type { Product } from "@/components/ProductCard";

export type FallbackProduct = Product & {
  brand: string;
  confidence: number;
  reason: string;
};

export const FALLBACK_PRODUCTS: FallbackProduct[] = [
  {
    id: "fp-1",
    name: "Relaxed Linen Overshirt",
    brand: "Aerie Studio",
    price: 128,
    image_url:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
    category: "Tops",
    rating: 4.8,
    confidence: 96,
    tags: ["neutrals", "linen", "minimal"],
    reason: "Matches your minimal, neutral palette",
  },
  {
    id: "fp-2",
    name: "Cropped Boxy Tee",
    brand: "North Lane",
    price: 42,
    image_url:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    category: "Tops",
    rating: 4.5,
    confidence: 91,
    tags: ["streetwear", "cotton"],
    reason: "Aligns with your relaxed fit preference",
  },
  {
    id: "fp-3",
    name: "Silk Wrap Blouse",
    brand: "Maison Côte",
    price: 165,
    image_url:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&q=80",
    category: "Tops",
    rating: 4.9,
    confidence: 98,
    tags: ["classic", "silk"],
    reason: "A versatile classic for work occasions",
  },
  {
    id: "fp-4",
    name: "High-Rise Wide Leg Jeans",
    brand: "Denim Atelier",
    price: 98,
    image_url:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    category: "Bottoms",
    rating: 4.7,
    confidence: 94,
    tags: ["denim", "earth tones"],
    reason: "Wide-leg cut fits your relaxed silhouette",
  },
  {
    id: "fp-5",
    name: "Pleated Wool Trousers",
    brand: "Oslo & Co.",
    price: 145,
    image_url:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    category: "Bottoms",
    rating: 4.6,
    confidence: 90,
    tags: ["tailored", "neutrals"],
    reason: "Tailored finish ideal for elevated days",
  },
  {
    id: "fp-6",
    name: "Leather Low-Top Sneakers",
    brand: "Common Ground",
    price: 178,
    image_url:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    category: "Shoes",
    rating: 4.9,
    confidence: 97,
    tags: ["minimal", "leather", "white"],
    reason: "Goes with everything in your saved looks",
  },
  {
    id: "fp-7",
    name: "Suede Ankle Boots",
    brand: "Marais",
    price: 152,
    image_url:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    category: "Shoes",
    rating: 4.4,
    confidence: 88,
    tags: ["earth tones", "suede"],
    reason: "Earth tone you've been gravitating toward",
  },
  {
    id: "fp-8",
    name: "Structured Leather Tote",
    brand: "Halden",
    price: 168,
    image_url:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    category: "Accessories",
    rating: 4.7,
    confidence: 93,
    tags: ["leather", "neutrals"],
    reason: "Completes your everyday + work rotation",
  },
];
