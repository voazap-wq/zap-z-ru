import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Product } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type FormData = Omit<Product, 'id'>;

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, onClose, product }) => {
  const { categories, createProduct, updateProduct } = useAppContext();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  
  const isEditing = !!product;

  useEffect(() => {
    if (isOpen) {
        if (product) {
            reset(product);
        } else {
            reset({
                name: '',
                categoryId: categories[0]?.id || '',
                price: 0,
                imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&auto=format&fit=crop&q=60',
                description: '',
                sku: '',
                brand: '',
                inStock: true,
                analogs: []
            });
        }
    }
  }, [isOpen, product, reset, categories]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const productData = {
        ...data,
        price: Number(data.price),
        analogs: Array.isArray(data.analogs) ? data.analogs : (data.analogs as unknown as string).split(',').map(s => s.trim()).filter(Boolean)
    };

    if (isEditing) {
      await updateProduct(product.id, productData);
    } else {
      await createProduct(productData);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать товар' : 'Добавить товар'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="name" label="Название" register={register('name', { required: 'Введите название' })} error={errors.name as any} />
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="brand" label="Бренд" register={register('brand', { required: 'Введите бренд' })} error={errors.brand as any} />
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="sku" label="Артикул (SKU/OEM)" register={register('sku', { required: 'Введите артикул' })} error={errors.sku as any} />
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="price" label="Цена" type="number" register={register('price', { required: 'Введите цену', min: 0 })} error={errors.price as any} />
        <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
            <select id="categoryId" {...register('categoryId', { required: 'Выберите категорию' })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
        </div>
        {/* FIX: Cast error to 'any' to resolve react-hook-form type incompatibility. */}
        <TextField id="description" label="Описание" register={register('description')} error={errors.description as any} />
        {/* FIX: Cast errors.analogs to 'any' because react-hook-form provides a complex error type for array fields that is not compatible with the TextField component's 'error' prop. */}
        <TextField id="analogs" label="Аналоги (через запятую)" register={register('analogs')} error={errors.analogs as any} />
        <label className="flex items-center cursor-pointer">
            <input type="checkbox" {...register('inStock')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="ml-2">В наличии</span>
        </label>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ProductDialog;