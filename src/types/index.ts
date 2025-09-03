export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  actualPrice?: number;
  priority: 'low' | 'medium' | 'high';
  purchased: boolean;
  category?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
  totalEstimated: number;
  totalActual: number;
  completed: boolean;
}

export interface User {
  name: string;
  createdAt: Date;
}

export interface AppStats {
  totalLists: number;
  totalItems: number;
  totalSpent: number;
  avgMonthlySpending: number;
  mostBoughtItems: Array<{
    name: string;
    count: number;
  }>;
}
