import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Page } from '../../types';
import DataTable, { TableColumn } from './DataTable';
import Button from '../ui/Button';
import PageDialog from './PageDialog';
import ConfirmDialog from '../ui/ConfirmDialog';

const ManagePages: React.FC = () => {
    const { pages, deletePage } = useAppContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pageToEdit, setPageToEdit] = useState<Page | null>(null);
    const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
    
    const handleAdd = () => {
        setPageToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (page: Page) => {
        setPageToEdit(page);
        setIsDialogOpen(true);
    };

    const handleDelete = (page: Page) => {
        setPageToDelete(page);
    };

    const handleConfirmDelete = async () => {
        if (pageToDelete) {
            await deletePage(pageToDelete.id);
            setPageToDelete(null);
        }
    };

    const columns: TableColumn<Page>[] = useMemo(() => [
        { key: 'title', header: 'Заголовок' },
        { key: 'slug', header: 'Slug' },
        { key: 'showInHeader', header: 'В шапке', render: (item) => item.showInHeader ? 'Да' : 'Нет' },
        { key: 'showInFooter', header: 'В подвале', render: (item) => item.showInFooter ? 'Да' : 'Нет' },
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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Управление страницами</h1>
                <Button onClick={handleAdd}>Добавить страницу</Button>
            </div>
            <DataTable columns={columns} data={pages} />
            <PageDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                page={pageToEdit}
            />
            <ConfirmDialog
                isOpen={!!pageToDelete}
                onClose={() => setPageToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Удалить страницу?"
            >
                Вы уверены, что хотите удалить страницу "{pageToDelete?.title}"?
            </ConfirmDialog>
        </div>
    );
};

export default ManagePages;