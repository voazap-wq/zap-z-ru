import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Category } from '../../types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import { useAppContext } from '../../hooks/useAppContext';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

type FormData = Omit<Category, 'id'>;

const CategoryDialog: React.FC<CategoryDialogProps> = ({ isOpen, onClose, category }) => {
  const { createCategory, updateCategory } = useAppContext();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting, touchedFields }, 
    reset, 
    setValue, 
    watch 
  } = useForm<FormData>();
  
  const isEditing = !!category;
  const nameValue = watch('name');
  const imageUrlValue = watch('imageUrl'); // Watch for preview

  useEffect(() => {
    // Register the imageUrl field programmatically for validation
    register('imageUrl', { required: 'Изображение обязательно' });
  }, [register]);


  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset(category);
      } else {
        reset({
            name: '',
            slug: '',
            imageUrl: '' // Start with no image
        });
      }
    }
  }, [isOpen, category, reset]);
  
  useEffect(() => {
    // Automatically generate slug from name, but only if user hasn't manually edited it.
    if (nameValue && !touchedFields.slug) {
      const slug = nameValue.toLowerCase()
        .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g').replace(/д/g, 'd')
        .replace(/е/g, 'e').replace(/ё/g, 'e').replace(/ж/g, 'zh').replace(/з/g, 'z').replace(/и/g, 'i')
        .replace(/й/g, 'y').replace(/к/g, 'k').replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n')
        .replace(/о/g, 'o').replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
        .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'c').replace(/ч/g, 'ch')
        .replace(/ш/g, 'sh').replace(/щ/g, 'sch').replace(/ъ/g, '').replace(/ы/g, 'y').replace(/ь/g, '')
        .replace(/э/g, 'e').replace(/ю/g, 'yu').replace(/я/g, 'ya')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('slug', slug, { shouldValidate: true, shouldDirty: true });
    }
  }, [nameValue, touchedFields.slug, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imageUrl', reader.result as string, { shouldValidate: true, shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isEditing) {
      await updateCategory(category.id, data);
    } else {
      await createCategory(data);
    }
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать категорию' : 'Добавить категорию'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField 
            id="name" 
            label="Название" 
            register={register('name', { required: 'Введите название' })}
            error={errors.name as any} 
        />
        <TextField id="slug" label="Slug (URL)" register={register('slug', { required: 'Введите slug' })} error={errors.slug as any} />
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Изображение
            </label>
            <div className="mt-1 flex items-center space-x-4">
                <div 
                  className="w-32 h-20 rounded-md bg-gray-200 dark:bg-gray-700 bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${imageUrlValue || ''})` }}
                  role="img"
                  aria-label="Предпросмотр изображения"
                >
                  {!imageUrlValue && <span className="material-icons text-gray-400 flex items-center justify-center h-full">photo_size_select_actual</span>}
                </div>
                <label htmlFor="image-upload" className="cursor-pointer bg-white dark:bg-gray-800 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <span>Загрузить файл</span>
                  <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message as any}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CategoryDialog;