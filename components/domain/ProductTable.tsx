
import React from 'react';
import { Product } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface ProductTableProps {
  products: Product[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const { addToCart } = useAppContext();

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-icons text-6xl text-gray-400 mb-4">search_off</span>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Товары не найдены</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Попробуйте изменить поисковый запрос или сбросить фильтры.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Товар</th>
              <th scope="col" className="px-6 py-3 hidden sm:table-cell">Производитель</th>
              <th scope="col" className="px-6 py-3">Наличие</th>
              <th scope="col" className="px-6 py-3">Цена</th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md hidden md:block flex-shrink-0" />
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white" title={product.name}>{product.name}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">Арт: {product.sku}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">{product.brand}</td>
                <td className="px-6 py-4">
                  {product.inStock ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
                      В наличии
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full"></span>
                      Нет в наличии
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-base text-gray-900 dark:text-white">{product.price.toFixed(2)} ₽</td>
                <td className="px-6 py-4 text-right">
                  <Button onClick={() => addToCart(product)} disabled={!product.inStock} className="!px-3 !py-1.5 !text-xs">
                    В корзину
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ProductTable;