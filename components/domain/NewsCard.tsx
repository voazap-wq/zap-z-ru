
import React from 'react';
import { NewsArticle } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <Card className="flex flex-col h-full">
      <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">{article.excerpt}</p>
        <div className="mt-auto">
          <Button variant="text">Читать далее</Button>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;