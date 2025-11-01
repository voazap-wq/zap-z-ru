import React from 'react';
import Card from '../ui/Card';

type PriceSort = 'none' | 'asc' | 'desc';

interface ProductFiltersProps {
  availableBrands: string[];
  selectedBrands: string[];
  onBrandChange: (brands: string[]) => void;
  inStockOnly: boolean;
  onInStockChange: (inStockOnly: boolean) => void;
  priceSort: PriceSort;
  onPriceSortChange: (sort: PriceSort) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  availableBrands,
  selectedBrands,
  onBrandChange,
  inStockOnly,
  onInStockChange,
  priceSort,
  onPriceSortChange,
}) => {
  const handleBrandCheckboxChange = (brand: string) => {
    const newSelectedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    onBrandChange(newSelectedBrands);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">Фильтры</h3>
      
      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Бренд</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {availableBrands.map(brand => (
            <label key={brand} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandCheckboxChange(brand)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">{brand}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Availability Filter */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Наличие</h4>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">Только в наличии</span>
        </label>
      </div>
      
      {/* Price Sort */}
      <div>
        <h4 className="font-semibold mb-2">Сортировка по цене</h4>
        <select
          value={priceSort}
          onChange={(e) => onPriceSortChange(e.target.value as PriceSort)}
          className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="none">По умолчанию</option>
          <option value="asc">Сначала дешевле</option>
          <option value="desc">Сначала дороже</option>
        </select>
      </div>
    </Card>
  );
};

export default ProductFilters;
