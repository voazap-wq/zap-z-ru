import React, { createContext, ReactNode } from 'react';
import { AppContextType } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

// FIX: Updated async function stubs to throw errors, ensuring their return type `Promise<never>` is assignable to the required `Promise<T>` types in AppContextType.
const defaultState: AppContextType = {
  isDarkMode: false,
  theme: 'system',
  setTheme: () => {},
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
  markNotificationAsRead: async () => {},
  markAllNotificationsAsRead: async () => {},
  siteSettings: { siteName: '', logoUrl: '', seoTitle: '', seoDescription: '', seoKeywords: '', contactPhone: '', contactEmail: '', contactAddress: '', promoBanners: [], promoBannerSpeed: 5, promoBannerHeight: 320 },
  homepageBlocks: [],
  importHistory: [],
  
  updateUser: async () => {},
  addVehicle: async () => {},
  deleteVehicle: async () => {},
  placeOrder: async () => {},
  
  createCustomerByManager: async () => { throw new Error('AppContext not provided'); },
  updateUserRole: async () => {},
  deleteUser: async () => {},

  createProduct: async () => { throw new Error('AppContext not provided'); },
  updateProduct: async () => { throw new Error('AppContext not provided'); },
  deleteProduct: async () => {},
  batchUpdateProducts: async () => {},
  clearWarehouse: async () => {},
  addImportLog: async () => {},
  
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
  updateOrderItemStatus: async () => { throw new Error('AppContext not provided'); },
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