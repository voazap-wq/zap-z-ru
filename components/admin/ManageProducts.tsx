

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Product } from '../../types';
import DataTable, { TableColumn } from './DataTable';
import Button from '../ui/Button';
import ProductDialog from './ProductDialog';
import ConfirmDialog from '../ui/ConfirmDialog';
import ImportProductsDialog from './ImportProductsDialog';
import ImportHistoryDialog from './ImportHistoryDialog';

const WarehouseSummary: React.FC = () => {
    const { products } = useAppContext();

    const totalPositions = products.length;
    const totalPurchaseValue = products.reduce((sum, p) => sum + (p.purchasePrice || 0) * (p.stockQuantity || 0), 0);
    const totalSellingValue = products.reduce((sum, p) => sum + p.price * (p.stockQuantity || 0), 0);
    
    const formatCurrency = (value: number) => 
        new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB', 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        }).format(value);

    return (
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold">Остатки на складе</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Товары со статусом "На складе" из всех заказов</p>
            </div>
            <div className="flex items-center space-x-6 sm:space-x-8 text-right">
                <div>
                    <p className="text-2xl font-bold">{totalPositions}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Позиций всего</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{formatCurrency(totalPurchaseValue)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Сумма закупки</p>
                </div>
                <div className="flex items-center">
                    <div>
                        <p className="text-2xl font-bold">{formatCurrency(totalSellingValue)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Сумма продажи</p>
                    </div>
                    <span className="material-icons text-gray-400 dark:text-gray-500 ml-2 cursor-help" title="Общая стоимость всех товаров в наличии по цене продажи">
                        info_outline
                    </span>
                </div>
            </div>
        </div>
    );
};


const ManageProducts: React.FC = () => {
    const { products, categories, deleteProduct, clearWarehouse } = useAppContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
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
    
    const handleConfirmClear = async () => {
        await clearWarehouse();
        setIsClearConfirmOpen(false);
    };

    const handleExport = () => {
        const headers = ['Наименование', 'Артикул', 'Производитель', 'Поставщик', 'Ячейка', 'Цена', 'Количество', 'Закупка', 'Ссылка на фото', 'ID Категории', 'Дата поступления', 'Описание', 'Аналоги'];
        
        const headerKeyMap: { [key: string]: keyof Product } = {
            'Наименование': 'name',
            'Артикул': 'sku',
            'Производитель': 'brand',
            'Поставщик': 'supplier',
            'Ячейка': 'storageBin',
            'Цена': 'price',
            'Количество': 'stockQuantity',
            'Закупка': 'purchasePrice',
            'Ссылка на фото': 'imageUrl',
            'ID Категории': 'categoryId',
            'Дата поступления': 'arrivalDate',
            'Описание': 'description',
            'Аналоги': 'analogs',
        };

        const dataToExport = products.map(p => {
            const arrivalDate = p.arrivalDate ? new Date(p.arrivalDate).toLocaleDateString('ru-RU') : '';
            return { ...p, arrivalDate };
        });

        const csvContent = [
            headers.join(','),
            ...dataToExport.map(p => headers.map(header => {
                const key = headerKeyMap[header];
                let value = p[key as keyof typeof p];
                if (key === 'analogs' && Array.isArray(value)) {
                    value = value.join(';');
                }
                const stringValue = String(value ?? '').replace(/"/g, '""');
                if (stringValue.includes(',')) {
                    return `"${stringValue}"`;
                }
                return stringValue;
            }).join(','))
        ].join('\n');


        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "warehouse_stock.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const columns: TableColumn<Product>[] = useMemo(() => [
        { key: 'categoryId', header: 'Категория', render: (item) => categories.find(c => c.id === item.categoryId)?.name || item.categoryId },
        { key: 'name', header: 'Наименование', render: (item) => <span title={item.name}>{item.name}</span> },
        { key: 'sku', header: 'Артикул' },
        { key: 'brand', header: 'Производитель' },
        { key: 'supplier', header: 'Поставщик' },
        { key: 'storageBin', header: 'Ячейка' },
        { key: 'price', header: 'Цена', render: (item) => `${item.price.toFixed(2)} ₽` },
        { key: 'purchasePrice', header: 'Закупка', render: (item) => item.purchasePrice ? `${item.purchasePrice.toFixed(2)} ₽` : '-' },
        { key: 'stockQuantity', header: 'Кол-во' },
        { 
            key: 'arrivalDate', 
            header: 'Дней на складе', 
            render: (item) => {
                if (!item.arrivalDate) return '-';
                try {
                    const arrival = new Date(item.arrivalDate);
                    const today = new Date();
                    arrival.setHours(0,0,0,0);
                    today.setHours(0,0,0,0);
                    const diffTime = today.getTime() - arrival.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 ? diffDays : 0;
                } catch {
                    return '-';
                }
            }
        },
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
    ], [categories]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h1 className="text-2xl font-bold">Управление товарами</h1>
                <div className="flex space-x-2 flex-wrap gap-2">
                    <Button onClick={() => setIsImportDialogOpen(true)} variant="outlined">
                        <span className="material-icons mr-2 -ml-1 text-base">file_upload</span>
                        Импорт
                    </Button>
                     <Button onClick={() => setIsHistoryOpen(true)} variant="outlined">
                        <span className="material-icons mr-2 -ml-1 text-base">history</span>
                        История приходов
                    </Button>
                    <Button onClick={handleExport} variant="outlined">
                        <span className="material-icons mr-2 -ml-1 text-base">file_download</span>
                        Экспорт
                    </Button>
                    <Button onClick={() => setIsClearConfirmOpen(true)} className="!bg-red-600 hover:!bg-red-700 focus:!ring-red-500 text-white">
                        <span className="material-icons mr-2 -ml-1 text-base">delete_sweep</span>
                        Очистить склад
                    </Button>
                    <Button onClick={handleAdd}>
                        <span className="material-icons mr-2 -ml-1">add</span>
                        Добавить товар
                    </Button>
                </div>
            </div>
            <WarehouseSummary />
            <DataTable columns={columns} data={products} />
            <ProductDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                product={productToEdit}
            />
            <ImportProductsDialog 
                isOpen={isImportDialogOpen}
                onClose={() => setIsImportDialogOpen(false)}
            />
             <ImportHistoryDialog 
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
            <ConfirmDialog
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Удалить товар?"
            >
                Вы уверены, что хотите удалить товар "{productToDelete?.name}"?
            </ConfirmDialog>
            <ConfirmDialog
                isOpen={isClearConfirmOpen}
                onClose={() => setIsClearConfirmOpen(false)}
                onConfirm={handleConfirmClear}
                title="Очистить склад?"
            >
                Вы уверены, что хотите удалить ВСЕ товары со склада? Это действие необратимо.
            </ConfirmDialog>
        </div>
    );
};

export default ManageProducts;