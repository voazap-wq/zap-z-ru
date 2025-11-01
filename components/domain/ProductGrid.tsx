import React from 'react';
import { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-icons text-6xl text-gray-400 mb-4">search_off</span>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Товары не найдены</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Попробуйте изменить поисковый запрос.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;