import React from 'react';
import { Product } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useAppContext();

  return (
    <Card className="flex flex-col h-full group">
      {!product.inStock && (
        <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          Нет в наличии
        </div>
      )}
      <div
        className={`relative w-full h-40 bg-cover bg-center transition-transform duration-300 group-hover:scale-110 ${!product.inStock ? 'opacity-50' : ''}`}
        style={{ backgroundImage: `url(${product.imageUrl})` }}
        title={product.name}
      >
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-base font-semibold mb-1 truncate" title={product.name}>{product.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Бренд: <span className="font-medium">{product.brand}</span></p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Артикул: <span className="font-medium">{product.sku}</span></p>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-bold text-primary">{product.price.toFixed(2)} ₽</span>
          <Button onClick={() => addToCart(product)} disabled={!product.inStock} className="!px-3 !py-1.5 !text-xs">
            В корзину
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;