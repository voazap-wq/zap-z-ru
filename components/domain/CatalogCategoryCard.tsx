
import React from 'react';
import { Category } from '../../types';
import Card from '../ui/Card';

interface CatalogCategoryCardProps {
  category: Category;
  onClick: () => void;
}

const CatalogCategoryCard: React.FC<CatalogCategoryCardProps> = ({ category, onClick }) => {
  return (
    <Card
      onClick={onClick}
      role="button"
      aria-label={category.name}
      className="flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700/80 hover:shadow-lg hover:-translate-y-1"
    >
      <img src={category.imageUrl} alt={category.name} className="h-20 w-20 object-contain mb-4" />
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
        {category.name}
      </h3>
    </Card>
  );
};
export default CatalogCategoryCard;
