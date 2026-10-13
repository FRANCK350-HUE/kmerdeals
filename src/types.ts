export type ProductCondition = 'Neuf' | 'Occasion';

export type ProductCategory =
  | 'Smartphones'
  | 'Ordinateurs'
  | 'Télévisions'
  | 'Consoles'
  | 'Audio'
  | 'Appareils photo'
  | 'Montres connectées'
  | 'Tablettes'
  | 'Autres';

export type Offer = {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  description: string;
  price: number;
  currency: 'FCFA';
  condition: ProductCondition;
  city: string;
  quartier: string;
  sellerName: string;
  phone: string;
  whatsapp?: string;
  updatedAt: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  image?: string;
};

export type FilterState = {
  q: string;
  city: string;
  category: ProductCategory | 'Tous';
  state: 'Tous' | ProductCondition;
  minPrice: number;
  maxPrice: number;
};
