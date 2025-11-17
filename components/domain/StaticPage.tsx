import React, { useState } from 'react';
import { Page, PageBlock } from '../../types';
import Card from '../ui/Card';
import { useAppContext } from '../../hooks/useAppContext';
import ProductGrid from './ProductGrid';
import Button from '../ui/Button';
import PageEditor from '../admin/PageEditor';
import ImageCarousel from '../ui/ImageCarousel';

interface StaticPageProps {
  page: Page;
}

const renderBlock = (block: PageBlock, allProducts: any[]) => {
  switch (block.type) {
    case 'text':
      return (
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
             dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br />') }}
        />
      );
    case 'image':
      return (
        <figure className="my-6 text-center">
          <img src={block.src} alt={block.alt} className="max-w-full h-auto mx-auto rounded-lg shadow-md" />
          {block.alt && <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">{block.alt}</figcaption>}
        </figure>
      );
    case 'button':
      return (
        <div className="my-6 text-center">
            <a href={block.link} target="_blank" rel="noopener noreferrer">
                <Button variant={block.variant}>{block.text}</Button>
            </a>
        </div>
      );
    case 'products':
      const productsToShow = allProducts.filter(p => block.productIds.includes(p.id));
      return (
        <div className="my-8">
            <h2 className="text-2xl font-bold mb-4 text-center">{block.title}</h2>
            {productsToShow.length > 0 ? (
                <ProductGrid products={productsToShow} />
            ) : (
                <p className="text-center text-gray-500">Товары для этого блока не найдены.</p>
            )}
        </div>
      );
    case 'carousel':
        return <ImageCarousel images={block.images} />;
    case 'columns':
        const gridClasses = {
            2: 'sm:grid-cols-2',
            3: 'sm:grid-cols-3',
            4: 'sm:grid-cols-4',
        };
        return (
            <div className={`grid grid-cols-1 ${gridClasses[block.columnCount]} gap-6 my-6`}>
                {block.columns.map(column => (
                    <div key={column.id} className="space-y-4">
                        {column.blocks.map(innerBlock => (
                            <div key={innerBlock.id}>
                                {renderBlock(innerBlock, allProducts)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    case 'html':
      return (
        <div dangerouslySetInnerHTML={{ __html: block.content }} />
      );
    default:
      return null;
  }
};

const StaticPage: React.FC<StaticPageProps> = ({ page }) => {
  const { products, user } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = user?.role === 'manager' || user?.role === 'superadmin';

  if (isAdmin && isEditing) {
    return <PageEditor page={page} onFinish={() => setIsEditing(false)} />;
  }

  return (
    <div>
       {isAdmin && (
        <div className="fixed bottom-8 right-8 z-40">
          <Button onClick={() => setIsEditing(true)} className="!rounded-full !px-5 !py-3 shadow-lg">
            <span className="material-icons mr-2">edit</span>
            Редактировать страницу
          </Button>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6 text-center">{page.title}</h1>
      <Card>
        <div className="p-6 md:p-8">
            {page.content.map(block => (
                <div key={block.id}>
                    {renderBlock(block, products)}
                </div>
            ))}
             {page.content.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">
                    Эта страница пока пуста.
                </p>
            )}
        </div>
      </Card>
    </div>
  );
};

export default StaticPage;