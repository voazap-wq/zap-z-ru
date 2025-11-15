import React from 'react';
import { Product } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Button from '../ui/Button';

interface SearchResultsProps {
  products: Product[];
  query: string;
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ products, query, onClose }) => {
  const { addToCart } = useAppContext();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    onClose();
  };

  return (
    <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
      {products.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map(product => (
            <li key={product.id} className="p-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-sm truncate" title={product.name}>{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Арт: {product.sku}</p>
              </div>
              <div className="text-sm font-bold text-right flex-shrink-0 pr-2">
                {product.price.toFixed(2)} ₽
              </div>
              <Button 
                onClick={() => handleAddToCart(product)} 
                disabled={!product.inStock} 
                className="!px-3 !py-1 !text-xs ml-auto flex-shrink-0"
              >
                В корзину
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>По запросу "{query}" ничего не найдено.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
