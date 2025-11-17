import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Product } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';
import ImageDropzone from '../ui/ImageDropzone';

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type FormData = Omit<Product, 'id' | 'inStock'>;

const ProductDialog: React.FC<ProductDialogProps> = ({ isOpen, onClose, product }) => {
  const { categories, createProduct, updateProduct } = useAppContext();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<FormData>();
  
  const isEditing = !!product;
  const imageUrlValue = watch('imageUrl');
  const brandValue = watch('brand');
  const nameValue = watch('name');
  const skuValue = watch('sku');

  useEffect(() => {
    if (isOpen) {
        if (product) {
            reset({
              ...product,
              arrivalDate: product.arrivalDate ? new Date(product.arrivalDate).toISOString().split('T')[0] : '',
              analogs: Array.isArray(product.analogs) ? product.analogs.join(', ') : product.analogs,
            } as any);
        } else {
            reset({
                name: '',
                categoryId: categories[0]?.id || '',
                price: 0,
                purchasePrice: 0,
                stockQuantity: 0,
                imageUrl: '',
                description: '',
                sku: '',
                brand: '',
                analogs: [],
                supplier: '',
                storageBin: '',
                arrivalDate: new Date().toISOString().split('T')[0],
            });
        }
    }
  }, [isOpen, product, reset, categories]);

  const handleImageUpload = (base64: string) => {
    setValue('imageUrl', base64, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const productData = {
        ...data,
        inStock: (data.stockQuantity || 0) > 0,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate).toISOString() : undefined,
        analogs: Array.isArray(data.analogs) ? data.analogs : (data.analogs as unknown as string).split(',').map(s => s.trim()).filter(Boolean)
    };

    if (isEditing) {
      await updateProduct(product.id, productData);
    } else {
      await createProduct(productData);
    }
    onClose();
  };

  const handleGoogleImageSearch = () => {
      const query = `${brandValue || ''} ${nameValue || ''} ${skuValue || ''}`.trim();
      if (!query) return;
      const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать товар' : 'Добавить товар'} className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField id="name" label="Название" register={register('name', { required: 'Введите название' })} error={errors.name as any} />
            <TextField id="brand" label="Бренд" register={register('brand', { required: 'Введите бренд' })} error={errors.brand as any} />
            <TextField id="sku" label="Артикул (SKU/OEM)" register={register('sku', { required: 'Введите артикул' })} error={errors.sku as any} />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Фотография
            </label>
            <ImageDropzone 
                value={imageUrlValue || ''}
                onChange={handleImageUpload}
                className="min-h-[10rem]"
            />
            <div className="flex items-center mt-2">
                <TextField 
                    id="imageUrl" 
                    label="или вставьте URL" 
                    register={register('imageUrl')}
                    error={errors.imageUrl as any}
                    className="flex-grow"
                    placeholder="https://example.com/image.jpg"
                />
                 <Button 
                    type="button" 
                    variant="outlined" 
                    onClick={handleGoogleImageSearch}
                    className="ml-2 shrink-0 !py-2.5"
                    title="Найти изображение в Google"
                  >
                     <span className="material-icons text-base">search</span>
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TextField id="price" label="Цена продажи" type="number" step="0.01" register={register('price', { required: 'Введите цену', valueAsNumber: true, min: 0 })} error={errors.price as any} />
          <TextField id="purchasePrice" label="Цена закупки" type="number" step="0.01" register={register('purchasePrice', { valueAsNumber: true, min: 0 })} error={errors.purchasePrice as any} />
          <TextField id="stockQuantity" label="Количество" type="number" register={register('stockQuantity', { required: 'Укажите количество', valueAsNumber: true, min: 0 })} error={errors.stockQuantity as any} />
           <TextField id="arrivalDate" label="Дата поступления" type="date" register={register('arrivalDate')} error={errors.arrivalDate as any} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
                <select id="categoryId" {...register('categoryId', { required: 'Выберите категорию' })} className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
            <TextField id="supplier" label="Поставщик" register={register('supplier')} error={errors.supplier as any} />
            <TextField id="storageBin" label="Ячейка на складе" register={register('storageBin')} error={errors.storageBin as any} />
        </div>
        
        <TextField id="description" label="Описание" register={register('description')} error={errors.description as any} />
        <TextField id="analogs" label="Аналоги (через запятую)" register={register('analogs')} error={errors.analogs as any} />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ProductDialog;