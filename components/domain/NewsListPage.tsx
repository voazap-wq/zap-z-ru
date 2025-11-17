import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import NewsCard from './NewsCard';

const NewsListPage: React.FC = () => {
  const { news } = useAppContext();
  const sortedNews = [...news].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Новости</h1>
      {sortedNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNews.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="material-icons text-6xl text-gray-400 mb-4">article</span>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Новостей пока нет</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Следите за обновлениями!</p>
        </div>
      )}
    </div>
  );
};

export default NewsListPage;
