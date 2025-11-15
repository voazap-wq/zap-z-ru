

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Page } from '../../types';
import DataTable, { TableColumn } from './DataTable';
import Button from '../ui/Button';
import PageDialog from './PageDialog';
import ConfirmDialog from '../ui/ConfirmDialog';

const ManagePages: React.FC = () => {
    const { pages, updatePage, deletePage, showSnackbar } = useAppContext();
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

    const handleToggleVisibility = async (page: Page, field: 'showInHeader' | 'showInFooter') => {
        const updatedData: Omit<Page, 'id'> = {
            ...page,
            [field]: !page[field],
        };
        try {
            await updatePage(page.id, updatedData);
        } catch (error) {
            console.error("Failed to update page visibility", error);
            showSnackbar(error instanceof Error ? error.message : 'Не удалось обновить страницу', 'error');
        }
    };

    const columns: TableColumn<Page>[] = useMemo(() => [
        { 
            key: 'title', 
            header: 'Заголовок', 
            render: (item) => (
                <div className="flex items-center">
                    <span>{item.title}</span>
                    {item.isSystemPage && <span className="ml-3 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">Системная</span>}
                </div>
            )
        },
        { key: 'slug', header: 'Slug' },
        { 
            key: 'showInHeader', 
            header: 'В шапке', 
            render: (item) => (
                <input 
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    checked={item.showInHeader}
                    onChange={() => handleToggleVisibility(item, 'showInHeader')}
                />
            ) 
        },
        { 
            key: 'showInFooter', 
            header: 'В подвале', 
            render: (item) => (
                <input 
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    checked={item.showInFooter}
                    onChange={() => handleToggleVisibility(item, 'showInFooter')}
                />
            )
        },
        {
            key: 'id',
            header: 'Действия',
            render: (item) => (
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handleEdit(item)} 
                        disabled={item.isSystemPage}
                        className="text-primary hover:text-primary-dark disabled:text-gray-400 disabled:cursor-not-allowed"
                        title={item.isSystemPage ? 'Системные страницы нельзя редактировать' : 'Редактировать'}
                    >
                        <span className="material-icons text-xl">edit</span>
                    </button>
                    <button 
                        onClick={() => handleDelete(item)} 
                        disabled={item.isSystemPage}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title={item.isSystemPage ? 'Системные страницы нельзя удалять' : 'Удалить'}
                    >
                        <span className="material-icons text-xl">delete</span>
                    </button>
                </div>
            ),
        },
    ], []);

    return (
        <div>
            <div className="flex justify-end mb-4">
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