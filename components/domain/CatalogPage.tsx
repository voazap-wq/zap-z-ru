import React from 'react';
import { Product } from '../../types';
import ProductGrid from './ProductGrid';
import ProductFilters from './ProductFilters';

type PriceSort = 'none' | 'asc' | 'desc';

interface CatalogPageProps {
  products: Product[];
  availableBrands: string[];
  filters: {
    brandFilters: string[];
    availabilityFilter: boolean;
    priceSort: PriceSort;
  };
  onBrandFilterChange: (brands: string[]) => void;
  onAvailabilityFilterChange: (inStockOnly: boolean) => void;
  onPriceSortChange: (sort: PriceSort) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  availableBrands,
  filters,
  onBrandFilterChange,
  onAvailabilityFilterChange,
  onPriceSortChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div>
      <div className="mb-8">
        <div className="relative max-w-xl">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">search</span>
          <input
            type="search"
            placeholder="Поиск по каталогу..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Поиск по каталогу"
            autoFocus
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <ProductFilters
            availableBrands={availableBrands}
            selectedBrands={filters.brandFilters}
            onBrandChange={onBrandFilterChange}
            inStockOnly={filters.availabilityFilter}
            onInStockChange={onAvailabilityFilterChange}
            priceSort={filters.priceSort}
            onPriceSortChange={onPriceSortChange}
          />
        </aside>
        <section className="w-full md:w-3/4 lg:w-4/5">
          <ProductGrid products={products} />
        </section>
      </div>
    </div>
  );
};

export default CatalogPage;