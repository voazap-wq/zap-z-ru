import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Category } from '../../types';
import DataTable, { TableColumn } from './DataTable';
import Button from '../ui/Button';
import CategoryDialog from './CategoryDialog';
import ConfirmDialog from '../ui/ConfirmDialog';

const ManageCategories: React.FC = () => {
    const { categories, deleteCategory } = useAppContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const handleAdd = () => {
        setCategoryToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setCategoryToEdit(category);
        setIsDialogOpen(true);
    };

    const handleDelete = (category: Category) => {
        setCategoryToDelete(category);
    };
    
    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            await deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
        }
    };

    const columns: TableColumn<Category>[] = useMemo(() => [
        { key: 'name', header: 'Название' },
        { key: 'slug', header: 'Slug' },
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
                <h1 className="text-2xl font-bold">Управление категориями</h1>
                <Button onClick={handleAdd}>Добавить категорию</Button>
            </div>
            <DataTable columns={columns} data={categories} />
            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                category={categoryToEdit}
            />
            <ConfirmDialog
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Удалить категорию?"
            >
                Вы уверены, что хотите удалить категорию "{categoryToDelete?.name}"?
            </ConfirmDialog>
        </div>
    );
};

export default ManageCategories;