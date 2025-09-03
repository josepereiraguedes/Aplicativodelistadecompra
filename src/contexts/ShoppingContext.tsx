import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ShoppingList, ShoppingItem, User, AppStats } from '../types';

interface ShoppingState {
  user: User | null;
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  stats: AppStats;
}

type ShoppingAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LISTS'; payload: ShoppingList[] }
  | { type: 'ADD_LIST'; payload: ShoppingList }
  | { type: 'UPDATE_LIST'; payload: ShoppingList }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SET_CURRENT_LIST'; payload: ShoppingList | null }
  | { type: 'ADD_ITEM'; payload: { listId: string; item: ShoppingItem } }
  | { type: 'UPDATE_ITEM'; payload: { listId: string; item: ShoppingItem } }
  | { type: 'DELETE_ITEM'; payload: { listId: string; itemId: string } }
  | { type: 'UPDATE_STATS'; payload: AppStats };

const initialState: ShoppingState = {
  user: null,
  lists: [],
  currentList: null,
  stats: {
    totalLists: 0,
    totalItems: 0,
    totalSpent: 0,
    avgMonthlySpending: 0,
    mostBoughtItems: []
  }
};

// Helper to recalculate totals for a list
const recalculateListTotals = (items: ShoppingItem[]) => {
  const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0);
  const totalActual = items.reduce((sum, item) => sum + (item.actualPrice ?? 0), 0);
  return { totalEstimated, totalActual };
};

function shoppingReducer(state: ShoppingState, action: ShoppingAction): ShoppingState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LISTS':
      return { ...state, lists: action.payload };
    case 'ADD_LIST':
      return { ...state, lists: [...state.lists, action.payload] };
    case 'UPDATE_LIST':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.id ? action.payload : list
        ),
        currentList: state.currentList?.id === action.payload.id ? action.payload : state.currentList
      };
    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
        currentList: state.currentList?.id === action.payload ? null : state.currentList
      };
    case 'SET_CURRENT_LIST':
      return { ...state, currentList: action.payload };
    
    case 'ADD_ITEM':
    case 'UPDATE_ITEM':
    case 'DELETE_ITEM': {
      const newLists = state.lists.map(list => {
        if (list.id !== action.payload.listId) {
          return list;
        }

        let updatedItems: ShoppingItem[];

        if (action.type === 'ADD_ITEM') {
          updatedItems = [...list.items, action.payload.item];
        } else if (action.type === 'UPDATE_ITEM') {
          updatedItems = list.items.map(item =>
            item.id === action.payload.item.id ? action.payload.item : item
          );
        } else { // DELETE_ITEM
          updatedItems = list.items.filter(item => item.id !== action.payload.itemId);
        }

        const { totalEstimated, totalActual } = recalculateListTotals(updatedItems);
        
        return {
          ...list,
          items: updatedItems,
          totalEstimated,
          totalActual,
          updatedAt: new Date(),
        };
      });
      return { ...state, lists: newLists };
    }

    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };
    default:
      return state;
  }
}

const ShoppingContext = createContext<{
  state: ShoppingState;
  dispatch: React.Dispatch<ShoppingAction>;
} | null>(null);

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shoppingReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('shopping-user');
    const savedLists = localStorage.getItem('shopping-lists');

    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }

    if (savedLists) {
      const lists = JSON.parse(savedLists).map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt)
      }));
      dispatch({ type: 'SET_LISTS', payload: lists });
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('shopping-user', JSON.stringify(state.user));
    }
  }, [state.user]);

  useEffect(() => {
    // Only save if there are lists, or clear if there are none
    if (state.lists.length > 0) {
      localStorage.setItem('shopping-lists', JSON.stringify(state.lists));
    } else {
      localStorage.removeItem('shopping-lists');
    }
  }, [state.lists]);

  // Calculate stats when lists change
  useEffect(() => {
    const completedLists = state.lists.filter(l => l.completed);
    const stats: AppStats = {
      totalLists: state.lists.length,
      totalItems: state.lists.reduce((sum, list) => sum + list.items.length, 0),
      totalSpent: completedLists.reduce((sum, list) => sum + list.totalActual, 0),
      avgMonthlySpending: 0,
      mostBoughtItems: []
    };

    // Calculate most bought items
    const itemCounts: { [key: string]: number } = {};
    completedLists.forEach(list => {
      list.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });
    });

    stats.mostBoughtItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    dispatch({ type: 'UPDATE_STATS', payload: stats });
  }, [state.lists]);

  return (
    <ShoppingContext.Provider value={{ state, dispatch }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShoppingContext() {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingContext must be used within a ShoppingProvider');
  }
  return context;
}
