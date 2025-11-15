


import React, { useState } from 'react';
import { Product, Category } from '../../types';
import ProductGrid from './ProductGrid';
import ProductFilters from './ProductFilters';
import Card from '../ui/Card';
import CatalogCategoryCard from './CatalogCategoryCard';
import Button from '../ui/Button';
import ProductTable from './ProductTable';
import { useAppContext } from '../../hooks/useAppContext';
import GarageSelectionDialog from './GarageSelectionDialog';

type PriceSort = 'none' | 'asc' | 'desc';

interface CatalogPageProps {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
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
  vinFilter: string | null;
  onClearVinFilter: () => void;
  onVinSelect: (vin: string) => void;
}

const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  categories,
  selectedCategoryId,
  onSelectCategory,
  availableBrands,
  filters,
  onBrandFilterChange,
  onAvailabilityFilterChange,
  onPriceSortChange,
  searchQuery,
  onSearchChange,
  vinFilter,
  onClearVinFilter,
  onVinSelect,
}) => {
  const { user } = useAppContext();
  const [isGarageDialogOpen, setGarageDialogOpen] = useState(false);
  const showProductList = selectedCategoryId || searchQuery || vinFilter;
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const handleSelectFromGarage = (vin: string) => {
    onVinSelect(vin);
    setGarageDialogOpen(false);
  };
  
  const getPageTitle = () => {
    if (vinFilter) return `Запчасти для VIN: ${vinFilter}`;
    if (selectedCategory) return selectedCategory.name;
    if (searchQuery) return `Результаты поиска по запросу "${searchQuery}"`;
    return 'Каталог';
  }

  if (showProductList) {
    return (
      <div>
        {vinFilter && (
            <Card className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="material-icons text-blue-600 dark:text-blue-300 mr-3">directions_car</span>
                    <div>
                        <p className="font-semibold text-blue-800 dark:text-blue-200">Подбор по VIN</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">{vinFilter}</p>
                    </div>
                </div>
                <Button onClick={onClearVinFilter} variant="text">Сбросить</Button>
            </Card>
        )}
        <div className="mb-4">
            <a href="#" onClick={(e) => { e.preventDefault(); onSelectCategory(null); onClearVinFilter(); }} className="text-sm text-primary hover:underline flex items-center mb-2">
                <span className="material-icons text-base mr-1">arrow_back</span>
                Ко всем каталогам
            </a>
            <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
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
            {searchQuery || vinFilter ? (
              <ProductTable products={products} />
            ) : (
              <ProductGrid products={products} />
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
            <Card className="p-4 sticky top-24">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 dark:border-gray-700">Каталоги запчастей</h3>
                <nav className="space-y-1">
                    {categories.map(category => (
                        <a
                            key={category.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); onSelectCategory(category.id); }}
                            className="block p-2 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {category.name}
                        </a>
                    ))}
                </nav>
            </Card>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Подбор по автомобилю</h1>
                {user && (
                  <Button variant="outlined" onClick={() => setGarageDialogOpen(true)}>
                      <span className="material-icons mr-2 -ml-1">garage</span>
                      Выбрать из гаража
                  </Button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => (
                    <CatalogCategoryCard key={category.id} category={category} onClick={() => onSelectCategory(category.id)} />
                ))}
            </div>
             <Card className="mt-8 p-6 flex flex-col md:flex-row items-center gap-6 bg-gray-800 dark:bg-gray-900 text-white">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" alt="Manager" className="w-24 h-24 rounded-full object-cover shrink-0"/>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold">Нужна помощь?</h3>
                    <p className="mt-2 text-gray-300">Персональный менеджер поможет подобрать запчасть, которая подойдет Вашему автомобилю.</p>
                </div>
                <Button variant="contained" className="!bg-white !text-gray-900 hover:!bg-gray-200 mt-4 md:mt-0 md:ml-auto shrink-0">
                    Обратиться к эксперту
                </Button>
            </Card>
        </main>
    </div>
    <GarageSelectionDialog 
      isOpen={isGarageDialogOpen} 
      onClose={() => setGarageDialogOpen(false)} 
      onSelect={handleSelectFromGarage}
    />
    </>
  );
};

export default CatalogPage;