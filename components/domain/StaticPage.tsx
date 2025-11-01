import React from 'react';
import { Page } from '../../types';
import Card from '../ui/Card';

interface StaticPageProps {
  page: Page;
}

const StaticPage: React.FC<StaticPageProps> = ({ page }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      <Card>
        <div className="p-6 md:p-8">
            {/* Using whitespace-pre-wrap to respect newlines in the content */}
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {page.content}
            </p>
        </div>
      </Card>
    </div>
  );
};

export default StaticPage;