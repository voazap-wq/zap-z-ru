import React, { createContext, ReactNode } from 'react';
import { AppContextType } from '../types';
import Snackbar from '../components/ui/Snackbar';

export const AppContext = createContext<AppContextType | undefined>(undefined);

// FIX: Updated async function stubs to throw errors, ensuring their return type `Promise<never>` is assignable to the required `Promise<T>` types in AppContextType.
const defaultState: AppContextType = {
  isDarkMode: false,
  toggleDarkMode: () => {},
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartQuantity: () => {},
  clearCart: () => {},
  showSnackbar: () => {},
  
  products: [],
  categories: [],
  news: [],
  pages: [],
  users: [],
  orders: [],
  vehicles: [],
  notifications: [],
  siteSettings: { siteName: '', logoUrl: '', seoTitle: '', seoDescription: '', seoKeywords: '' },
  homepageBlocks: [],
  
  updateUser: async () => {},
  addVehicle: async () => {},
  deleteVehicle: async () => {},
  placeOrder: async () => {},
  
  updateUserRole: async () => {},
  deleteUser: async () => {},

  createProduct: async () => { throw new Error('AppContext not provided'); },
  updateProduct: async () => { throw new Error('AppContext not provided'); },
  deleteProduct: async () => {},
  
  createCategory: async () => { throw new Error('AppContext not provided'); },
  updateCategory: async () => { throw new Error('AppContext not provided'); },
  deleteCategory: async () => {},
  
  createNews: async () => { throw new Error('AppContext not provided'); },
  updateNews: async () => { throw new Error('AppContext not provided'); },
  deleteNews: async () => {},

  createPage: async () => { throw new Error('AppContext not provided'); },
  updatePage: async () => { throw new Error('AppContext not provided'); },
  deletePage: async () => {},
  
  updateOrderStatus: async () => { throw new Error('AppContext not provided'); },
  updateSiteSettings: async () => { throw new Error('AppContext not provided'); },
  updateHomepageBlocks: async () => { throw new Error('AppContext not provided'); },
};

export const AppContextProvider: React.FC<{ children: ReactNode, value: AppContextType }> = ({ children, value }) => {
  // Snackbar is now rendered inside the provider in App.tsx
  // This component now just provides the context value
  return (
    <AppContext.Provider value={value || defaultState}>
      {children}
    </AppContext.Provider>
  );
};
