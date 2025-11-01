import React from 'react';
import CategoryCard from './CategoryCard';
import NewsCard from './NewsCard';
import ProductSlider from './ProductSlider';
import SearchSection from '../layout/SearchSection';
import { useAppContext } from '../../hooks/useAppContext';

interface HomePageProps {
  onCatalogClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCatalogClick, searchQuery, onSearchChange, onSearchFocus }) => {
  const { products, categories, news, homepageBlocks } = useAppContext();
  const featuredProducts = products.slice(0, 8); // Use more products for the slider

  const sections = {
    categories: (
      <section key="categories">
        <h2 className="text-2xl font-bold mb-6 text-center">Категории товаров</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} onClick={onCatalogClick} />
          ))}
        </div>
      </section>
    ),
    featured: (
      <section key="featured">
        <h2 className="text-2xl font-bold mb-6 text-center">Популярные товары</h2>
        <ProductSlider products={featuredProducts} />
      </section>
    ),
    news: (
      <section key="news">
        <h2 className="text-2xl font-bold mb-6 text-center">Новости и акции</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    ),
  };

  return (
    <div className="space-y-12">
      <SearchSection 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSearchFocus={onSearchFocus}
      />
      {homepageBlocks.filter(block => block.enabled).map(block => sections[block.id])}
    </div>
  );
};

export default HomePage;