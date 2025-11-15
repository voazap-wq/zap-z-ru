

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { NewsArticle } from '../../types';
import DataTable, { TableColumn } from './DataTable';
import Button from '../ui/Button';
import NewsDialog from './NewsDialog';
import ConfirmDialog from '../ui/ConfirmDialog';

const ManageNews: React.FC = () => {
    const { news, deleteNews } = useAppContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [articleToEdit, setArticleToEdit] = useState<NewsArticle | null>(null);
    const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
    
    const handleAdd = () => {
        setArticleToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (article: NewsArticle) => {
        setArticleToEdit(article);
        setIsDialogOpen(true);
    };

    const handleDelete = (article: NewsArticle) => {
        setArticleToDelete(article);
    };

    const handleConfirmDelete = async () => {
        if (articleToDelete) {
            await deleteNews(articleToDelete.id);
            setArticleToDelete(null);
        }
    };

    const columns: TableColumn<NewsArticle>[] = useMemo(() => [
        { key: 'title', header: 'Заголовок' },
        { key: 'excerpt', header: 'Отрывок' },
        {
            key: 'id',
            header: 'Действия',
            render: (item) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary-dark"><span className="material-icons text-xl">edit</span></button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700"><span className="material-icons text-xl">delete</span></button>
                </div>
            ),
        },
    ], []);

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>Добавить новость</Button>
            </div>
            <DataTable columns={columns} data={news} />
            <NewsDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                article={articleToEdit}
            />
            <ConfirmDialog
                isOpen={!!articleToDelete}
                onClose={() => setArticleToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Удалить новость?"
            >
                Вы уверены, что хотите удалить новость "{articleToDelete?.title}"?
            </ConfirmDialog>
        </div>
    );
};

export default ManageNews;