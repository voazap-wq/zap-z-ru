import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Product } from '../../types';
import DataTable, { TableColumn } from './DataTable';
import Button from '../ui/Button';
import ProductDialog from './ProductDialog';
import ConfirmDialog from '../ui/ConfirmDialog';

const ManageProducts: React.FC = () => {
    const { products, deleteProduct } = useAppContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    
    const handleAdd = () => {
        setProductToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsDialogOpen(true);
    };

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
    };

    const handleConfirmDelete = async () => {
        if (productToDelete) {
            await deleteProduct(productToDelete.id);
            setProductToDelete(null);
        }
    };

    const columns: TableColumn<Product>[] = useMemo(() => [
        { key: 'name', header: 'Название' },
        { key: 'brand', header: 'Бренд' },
        { key: 'sku', header: 'Артикул' },
        { key: 'price', header: 'Цена', render: (item) => `${item.price.toFixed(2)} ₽` },
        { key: 'inStock', header: 'В наличии', render: (item) => item.inStock ? 'Да' : 'Нет' },
        {
            key: 'id',
            header: 'Действия',
            render: (item) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-primary hover:text-primary-dark">
                        <span className="material-icons text-xl">edit</span>
                    </button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700">
                        <span className="material-icons text-xl">delete</span>
                    </button>
                </div>
            ),
        },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Управление товарами</h1>
                <Button onClick={handleAdd}>
                    <span className="material-icons mr-2 -ml-1">add</span>
                    Добавить товар
                </Button>
            </div>
            <DataTable columns={columns} data={products} />
            <ProductDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                product={productToEdit}
            />
            <ConfirmDialog
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Удалить товар?"
            >
                Вы уверены, что хотите удалить товар "{productToDelete?.name}"?
            </ConfirmDialog>
        </div>
    );
};

export default ManageProducts;