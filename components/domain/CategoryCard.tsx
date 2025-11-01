import React from 'react';
import { Category } from '../../types';
import Card from '../ui/Card';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <div className="block group cursor-pointer" onClick={onClick}>
      <Card className="relative overflow-hidden h-full">
        <img src={category.imageUrl} alt={category.name} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h3 className="text-white text-xl font-bold text-center p-2">{category.name}</h3>
        </div>
      </Card>
    </div>
  );
};

export default CategoryCard;